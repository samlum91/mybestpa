import React, { createContext, useContext, useReducer, useEffect, useState, useMemo } from 'react';
import { Subscription, AppNotification, LeakageItem } from '../types/subscription';
import { StorageService } from '../services/storage';
import {
  detectLeakages,
  calculateMonthlyEquivalent,
  calculateYearlyEquivalent,
  getDaysUntil,
} from '../utils/dateCalculations';

export const FREE_TIER_LIMIT = 10;

interface SubscriptionState {
  subscriptions: Subscription[];
  notifications: AppNotification[];
  isUpgradeModalOpen: boolean;
  selectedSubscriptionForDetail: Subscription | null;
  subscriptionToEdit: Subscription | null;
  isFormModalOpen: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
}

type Action =
  | { type: 'SET_SUBSCRIPTIONS'; payload: Subscription[] }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription }
  | { type: 'DELETE_SUBSCRIPTION'; payload: string }
  | { type: 'TOGGLE_STATUS'; payload: { id: string; status: Subscription['status'] } }
  | { type: 'LOG_USAGE_TODAY'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: AppNotification[] }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ACTION_NOTIFICATION'; payload: { notifId: string; action: 'kept' | 'snoozed' | 'cancelled'; subscriptionId: string } }
  | { type: 'SET_UPGRADE_MODAL'; payload: boolean }
  | { type: 'OPEN_FORM_MODAL'; payload?: Subscription | null }
  | { type: 'CLOSE_FORM_MODAL' }
  | { type: 'SET_DETAIL_MODAL'; payload: Subscription | null }
  | { type: 'SET_NOTIFICATION_PERMISSION'; payload: NotificationPermission | 'unsupported' }
  | { type: 'RESET_DEMO' };

function subscriptionReducer(state: SubscriptionState, action: Action): SubscriptionState {
  switch (action.type) {
    case 'SET_SUBSCRIPTIONS':
      return { ...state, subscriptions: action.payload };

    case 'ADD_SUBSCRIPTION': {
      const activeCount = state.subscriptions.filter((s) => s.status === 'Active').length;
      // If adding an active subscription pushes over the free tier limit
      if (action.payload.status === 'Active' && activeCount >= FREE_TIER_LIMIT) {
        return { ...state, isUpgradeModalOpen: true };
      }
      const updated = [action.payload, ...state.subscriptions];
      StorageService.saveSubscriptions(updated);
      return { ...state, subscriptions: updated, isFormModalOpen: false };
    }

    case 'UPDATE_SUBSCRIPTION': {
      const updated = state.subscriptions.map((s) =>
        s.id === action.payload.id ? action.payload : s
      );
      StorageService.saveSubscriptions(updated);
      return {
        ...state,
        subscriptions: updated,
        isFormModalOpen: false,
        selectedSubscriptionForDetail:
          state.selectedSubscriptionForDetail?.id === action.payload.id
            ? action.payload
            : state.selectedSubscriptionForDetail,
      };
    }

    case 'DELETE_SUBSCRIPTION': {
      const updated = state.subscriptions.filter((s) => s.id !== action.payload);
      StorageService.saveSubscriptions(updated);
      const filteredNotifs = state.notifications.filter(
        (n) => n.subscriptionId !== action.payload
      );
      StorageService.saveNotifications(filteredNotifs);
      return {
        ...state,
        subscriptions: updated,
        notifications: filteredNotifs,
        selectedSubscriptionForDetail: null,
      };
    }

    case 'TOGGLE_STATUS': {
      const activeCount = state.subscriptions.filter((s) => s.status === 'Active').length;
      if (action.payload.status === 'Active' && activeCount >= FREE_TIER_LIMIT) {
        return { ...state, isUpgradeModalOpen: true };
      }
      const updated = state.subscriptions.map((s) =>
        s.id === action.payload.id ? { ...s, status: action.payload.status, updatedAt: new Date().toISOString() } : s
      );
      StorageService.saveSubscriptions(updated);
      return { ...state, subscriptions: updated };
    }

    case 'LOG_USAGE_TODAY': {
      const todayStr = new Date().toISOString().split('T')[0];
      const updated = state.subscriptions.map((s) =>
        s.id === action.payload ? { ...s, lastUsedDate: todayStr, updatedAt: new Date().toISOString() } : s
      );
      StorageService.saveSubscriptions(updated);
      return { ...state, subscriptions: updated };
    }

    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };

    case 'DISMISS_NOTIFICATION': {
      const updated = state.notifications.filter((n) => n.id !== action.payload);
      StorageService.saveNotifications(updated);
      return { ...state, notifications: updated };
    }

    case 'MARK_NOTIFICATION_READ': {
      const updated = state.notifications.map((n) =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      StorageService.saveNotifications(updated);
      return { ...state, notifications: updated };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      StorageService.saveNotifications(updated);
      return { ...state, notifications: updated };
    }

    case 'ACTION_NOTIFICATION': {
      const { notifId, action: alertAction, subscriptionId } = action.payload;

      let updatedSubs = state.subscriptions;
      if (alertAction === 'cancelled') {
        updatedSubs = state.subscriptions.map((s) =>
          s.id === subscriptionId ? { ...s, status: 'Cancelled' as const, updatedAt: new Date().toISOString() } : s
        );
        StorageService.saveSubscriptions(updatedSubs);
      }

      const updatedNotifs = state.notifications.map((n) =>
        n.id === notifId
          ? {
              ...n,
              read: true,
              actionTaken: alertAction,
              snoozedUntil:
                alertAction === 'snoozed'
                  ? new Date(Date.now() + 24 * 3600 * 1000).toISOString()
                  : undefined,
            }
          : n
      );
      StorageService.saveNotifications(updatedNotifs);

      return {
        ...state,
        subscriptions: updatedSubs,
        notifications: updatedNotifs,
      };
    }

    case 'SET_UPGRADE_MODAL':
      return { ...state, isUpgradeModalOpen: action.payload };

    case 'OPEN_FORM_MODAL':
      return {
        ...state,
        isFormModalOpen: true,
        subscriptionToEdit: action.payload || null,
      };

    case 'CLOSE_FORM_MODAL':
      return { ...state, isFormModalOpen: false, subscriptionToEdit: null };

    case 'SET_DETAIL_MODAL':
      return { ...state, selectedSubscriptionForDetail: action.payload };

    case 'SET_NOTIFICATION_PERMISSION':
      return { ...state, notificationPermission: action.payload };

    case 'RESET_DEMO': {
      const { subscriptions, notifications } = StorageService.resetToDemo();
      return {
        ...state,
        subscriptions,
        notifications,
        selectedSubscriptionForDetail: null,
        subscriptionToEdit: null,
        isFormModalOpen: false,
        isUpgradeModalOpen: false,
      };
    }

    default:
      return state;
  }
}

interface SubscriptionContextType {
  subscriptions: Subscription[];
  notifications: AppNotification[];
  unreadNotifCount: number;
  activeCount: number;
  totalMonthlySpend: number;
  totalYearlySpend: number;
  renewalsNext7Days: { count: number; totalCost: number; items: Subscription[] };
  upcomingRenewals30Days: Subscription[];
  leakages: LeakageItem[];
  isUpgradeModalOpen: boolean;
  selectedSubscriptionForDetail: Subscription | null;
  subscriptionToEdit: Subscription | null;
  isFormModalOpen: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateSubscription: (sub: Subscription) => void;
  deleteSubscription: (id: string) => void;
  toggleStatus: (id: string, status: Subscription['status']) => void;
  logUsageToday: (id: string) => void;
  dismissNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  handleNotificationAction: (
    notifId: string,
    action: 'kept' | 'snoozed' | 'cancelled',
    subscriptionId: string
  ) => void;
  setUpgradeModalOpen: (open: boolean) => void;
  openAddModal: () => void;
  openEditModal: (sub: Subscription) => void;
  closeFormModal: () => void;
  setDetailModal: (sub: Subscription | null) => void;
  requestNotificationPermission: () => Promise<void>;
  sendTestBrowserNotification: () => void;
  resetDemoData: () => void;
  importData: (json: string) => { success: boolean; message: string; count?: number };
  exportData: () => string;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(subscriptionReducer, {
    subscriptions: [],
    notifications: [],
    isUpgradeModalOpen: false,
    selectedSubscriptionForDetail: null,
    subscriptionToEdit: null,
    isFormModalOpen: false,
    notificationPermission:
      typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'unsupported',
  });

  // Load from localStorage on initial render
  useEffect(() => {
    const loadedSubs = StorageService.getSubscriptions();
    const loadedNotifs = StorageService.getNotifications();
    dispatch({ type: 'SET_SUBSCRIPTIONS', payload: loadedSubs });
    dispatch({ type: 'SET_NOTIFICATIONS', payload: loadedNotifs });

    if (typeof window !== 'undefined' && 'Notification' in window) {
      dispatch({
        type: 'SET_NOTIFICATION_PERMISSION',
        payload: Notification.permission,
      });
    }
  }, []);

  // Compute key dashboard metrics
  const activeSubs = useMemo(
    () => state.subscriptions.filter((s) => s.status === 'Active'),
    [state.subscriptions]
  );

  const activeCount = activeSubs.length;

  const totalMonthlySpend = useMemo(() => {
    return activeSubs.reduce(
      (sum, s) => sum + calculateMonthlyEquivalent(s.cost, s.billingCycle, s.customDays),
      0
    );
  }, [activeSubs]);

  const totalYearlySpend = useMemo(() => {
    return totalMonthlySpend * 12;
  }, [totalMonthlySpend]);

  const renewalsNext7Days = useMemo(() => {
    const today = new Date();
    const in7Days = activeSubs.filter((s) => {
      const days = getDaysUntil(s.nextRenewalDate, today);
      return days >= 0 && days <= 7;
    });

    const totalCost = in7Days.reduce((sum, s) => sum + s.cost, 0);
    return { count: in7Days.length, totalCost, items: in7Days };
  }, [activeSubs]);

  const upcomingRenewals30Days = useMemo(() => {
    const today = new Date();
    return [...activeSubs]
      .filter((s) => {
        const days = getDaysUntil(s.nextRenewalDate, today);
        return days >= 0 && days <= 30;
      })
      .sort((a, b) => {
        const daysA = getDaysUntil(a.nextRenewalDate, today);
        const daysB = getDaysUntil(b.nextRenewalDate, today);
        return daysA - daysB;
      });
  }, [activeSubs]);

  const leakages = useMemo(() => {
    return detectLeakages(state.subscriptions);
  }, [state.subscriptions]);

  const unreadNotifCount = useMemo(() => {
    const now = Date.now();
    return state.notifications.filter((n) => {
      if (n.dismissed) return false;
      if (n.snoozedUntil && new Date(n.snoozedUntil).getTime() > now) return false;
      return !n.read;
    }).length;
  }, [state.notifications]);

  // Context methods
  const addSubscription = (subData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (subData.status === 'Active' && activeCount >= FREE_TIER_LIMIT) {
      dispatch({ type: 'SET_UPGRADE_MODAL', payload: true });
      return false;
    }

    const newSub: Subscription = {
      ...subData,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSub });
    return true;
  };

  const updateSubscription = (sub: Subscription) => {
    dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: sub });
  };

  const deleteSubscription = (id: string) => {
    dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id });
  };

  const toggleStatus = (id: string, status: Subscription['status']) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: { id, status } });
  };

  const logUsageToday = (id: string) => {
    dispatch({ type: 'LOG_USAGE_TODAY', payload: id });
  };

  const dismissNotification = (id: string) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const markAllNotificationsRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };

  const handleNotificationAction = (
    notifId: string,
    action: 'kept' | 'snoozed' | 'cancelled',
    subscriptionId: string
  ) => {
    dispatch({
      type: 'ACTION_NOTIFICATION',
      payload: { notifId, action, subscriptionId },
    });
  };

  const setUpgradeModalOpen = (open: boolean) => {
    dispatch({ type: 'SET_UPGRADE_MODAL', payload: open });
  };

  const openAddModal = () => {
    if (activeCount >= FREE_TIER_LIMIT) {
      dispatch({ type: 'SET_UPGRADE_MODAL', payload: true });
      return;
    }
    dispatch({ type: 'OPEN_FORM_MODAL', payload: null });
  };

  const openEditModal = (sub: Subscription) => {
    dispatch({ type: 'OPEN_FORM_MODAL', payload: sub });
  };

  const closeFormModal = () => {
    dispatch({ type: 'CLOSE_FORM_MODAL' });
  };

  const setDetailModal = (sub: Subscription | null) => {
    dispatch({ type: 'SET_DETAIL_MODAL', payload: sub });
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        dispatch({ type: 'SET_NOTIFICATION_PERMISSION', payload: permission });
        if (permission === 'granted') {
          new Notification('MyBestSPA Alerts Enabled!', {
            body: "You're all set. We'll remind you before renewals and trial ends so you never waste a single cent.",
          });
        }
      } catch (err) {
        console.error('Error requesting notification permission', err);
      }
    }
  };

  const sendTestBrowserNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Heads up! Netflix renews in 3 days', {
        body: 'Renewal cost: S$22.98 on DBS Visa Debit. Still watching?',
      });
    }
  };

  const resetDemoData = () => {
    dispatch({ type: 'RESET_DEMO' });
  };

  const importData = (json: string) => {
    const res = StorageService.importBackupJson(json);
    if (res.success) {
      dispatch({ type: 'SET_SUBSCRIPTIONS', payload: StorageService.getSubscriptions() });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: StorageService.getNotifications() });
    }
    return res;
  };

  const exportData = () => {
    return StorageService.exportBackupJson();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions: state.subscriptions,
        notifications: state.notifications,
        unreadNotifCount,
        activeCount,
        totalMonthlySpend,
        totalYearlySpend,
        renewalsNext7Days,
        upcomingRenewals30Days,
        leakages,
        isUpgradeModalOpen: state.isUpgradeModalOpen,
        selectedSubscriptionForDetail: state.selectedSubscriptionForDetail,
        subscriptionToEdit: state.subscriptionToEdit,
        isFormModalOpen: state.isFormModalOpen,
        notificationPermission: state.notificationPermission,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        toggleStatus,
        logUsageToday,
        dismissNotification,
        markNotificationRead,
        markAllNotificationsRead,
        handleNotificationAction,
        setUpgradeModalOpen,
        openAddModal,
        openEditModal,
        closeFormModal,
        setDetailModal,
        requestNotificationPermission,
        sendTestBrowserNotification,
        resetDemoData,
        importData,
        exportData,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
};
