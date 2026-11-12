import { format, addDays, subDays } from 'date-fns';
import { Subscription, AppNotification } from '../types/subscription';
import { calculateNextRenewal } from '../utils/dateCalculations';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'mybestspa_subscriptions_v1',
  NOTIFICATIONS: 'mybestspa_notifications_v1',
  SETTINGS: 'mybestspa_settings_v1',
};

// Generate realistic default mock subscriptions anchored to the current date
export function getInitialMockSubscriptions(): Subscription[] {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Netflix renews in 3 days
  const netflixRenewal = format(addDays(today, 3), 'yyyy-MM-dd');
  // Nespresso delivery in 6 days
  const nespressoRenewal = format(addDays(today, 6), 'yyyy-MM-dd');
  // Superhuman trial ending in 2 days
  const trialEndDate = format(addDays(today, 2), 'yyyy-MM-dd');
  // Gym last used 42 days ago
  const gymLastUsed = format(subDays(today, 42), 'yyyy-MM-dd');

  return [
    {
      id: 'sub-1',
      name: 'Netflix Premium (4K)',
      category: 'Streaming',
      type: 'Digital',
      cost: 22.98,
      currency: 'SGD',
      billingCycle: 'monthly',
      startDate: format(subDays(today, 180), 'yyyy-MM-dd'),
      nextRenewalDate: netflixRenewal,
      paymentMethod: 'DBS Visa Debit',
      isTrial: false,
      cancellationNoticePeriod: 0,
      cancellationNotes: 'Cancel anytime in Account > Cancel Membership. Access continues until billing period ends.',
      status: 'Active',
      lastUsedDate: format(subDays(today, 1), 'yyyy-MM-dd'),
      remindDaysBefore: 3,
      trialReminder: true,
      cancellationReminder: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub-2',
      name: 'Superhuman AI Mail',
      category: 'Software',
      type: 'Digital',
      cost: 38.00,
      currency: 'SGD',
      billingCycle: 'monthly',
      startDate: format(subDays(today, 12), 'yyyy-MM-dd'),
      nextRenewalDate: trialEndDate,
      paymentMethod: 'DBS Visa Debit',
      isTrial: true,
      trialEndDate: trialEndDate,
      cancellationNoticePeriod: 1,
      cancellationNotes: 'Click Profile > Subscription > Cancel Trial before 11:59 PM to avoid charge.',
      status: 'Active',
      lastUsedDate: format(subDays(today, 4), 'yyyy-MM-dd'),
      remindDaysBefore: 2,
      trialReminder: true,
      cancellationReminder: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub-3',
      name: 'Equinox Gym / Fitness Club',
      category: 'Fitness',
      type: 'Physical',
      cost: 185.00,
      currency: 'SGD',
      billingCycle: 'monthly',
      startDate: format(subDays(today, 240), 'yyyy-MM-dd'),
      nextRenewalDate: format(addDays(today, 14), 'yyyy-MM-dd'),
      paymentMethod: 'OCBC 365 Credit',
      isTrial: false,
      cancellationNoticePeriod: 30,
      cancellationNotes: 'Requires 30 days written notice submitted to front desk or via member portal before 1st of month.',
      status: 'Active',
      lastUsedDate: gymLastUsed, // 42 days ago -> triggers Unused Zombie warning!
      remindDaysBefore: 7,
      trialReminder: false,
      cancellationReminder: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub-4',
      name: 'Nespresso Master Coffee Pods',
      category: 'Physical Product',
      type: 'Physical',
      cost: 64.50,
      currency: 'SGD',
      billingCycle: 'monthly',
      startDate: format(subDays(today, 120), 'yyyy-MM-dd'),
      nextRenewalDate: nespressoRenewal,
      paymentMethod: 'DBS Altitude Card',
      isTrial: false,
      cancellationNoticePeriod: 2,
      cancellationNotes: 'Modify or pause standing monthly delivery in Nespresso app at least 48h prior.',
      status: 'Active',
      lastUsedDate: todayStr,
      remindDaysBefore: 3,
      trialReminder: false,
      cancellationReminder: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub-5',
      name: 'Figma Professional',
      category: 'Software',
      type: 'Digital',
      cost: 16.00,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: format(subDays(today, 300), 'yyyy-MM-dd'),
      nextRenewalDate: format(addDays(today, 19), 'yyyy-MM-dd'),
      paymentMethod: 'GrabPay Mastercard',
      isTrial: false,
      cancellationNoticePeriod: 0,
      cancellationNotes: 'Admin console > Billing > Downgrade to Starter plan.',
      status: 'Active',
      lastUsedDate: format(subDays(today, 2), 'yyyy-MM-dd'),
      remindDaysBefore: 3,
      trialReminder: false,
      cancellationReminder: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub-6',
      name: 'Singtel 2Gbps Home Fibre',
      category: 'Utilities',
      type: 'Contract',
      cost: 54.90,
      currency: 'SGD',
      billingCycle: 'monthly',
      startDate: format(subDays(today, 365), 'yyyy-MM-dd'),
      nextRenewalDate: format(addDays(today, 22), 'yyyy-MM-dd'),
      paymentMethod: 'PayNow GIRO',
      isTrial: false,
      cancellationNoticePeriod: 30,
      cancellationNotes: '24-month contract renewal notice. Early termination fee applies if cancelled before end of contract.',
      status: 'Active',
      lastUsedDate: todayStr,
      remindDaysBefore: 14,
      trialReminder: false,
      cancellationReminder: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub-7',
      name: 'The Straits Times All-Digital',
      category: 'News',
      type: 'Digital',
      cost: 9.90,
      currency: 'SGD',
      billingCycle: 'monthly',
      startDate: format(subDays(today, 90), 'yyyy-MM-dd'),
      nextRenewalDate: format(addDays(today, 27), 'yyyy-MM-dd'),
      paymentMethod: 'DBS Visa Debit',
      isTrial: false,
      cancellationNoticePeriod: 7,
      cancellationNotes: 'SPH Subscription hotline 6388-3838 or online subscriber portal.',
      status: 'Active',
      lastUsedDate: format(subDays(today, 12), 'yyyy-MM-dd'),
      remindDaysBefore: 5,
      trialReminder: false,
      cancellationReminder: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub-8',
      name: 'ClassPass 25 Credits',
      category: 'Fitness',
      type: 'Digital',
      cost: 59.00,
      currency: 'SGD',
      billingCycle: 'monthly',
      startDate: format(subDays(today, 150), 'yyyy-MM-dd'),
      nextRenewalDate: format(addDays(today, 29), 'yyyy-MM-dd'),
      paymentMethod: 'DBS Visa Debit',
      isTrial: false,
      cancellationNoticePeriod: 0,
      cancellationNotes: 'Pause or cancel via ClassPass app under Account > Membership.',
      status: 'Paused',
      lastUsedDate: format(subDays(today, 45), 'yyyy-MM-dd'),
      remindDaysBefore: 3,
      trialReminder: false,
      cancellationReminder: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// Generate lovable assistant notifications from initial subscriptions
export function generateInitialNotifications(subscriptions: Subscription[]): AppNotification[] {
  const notifications: AppNotification[] = [
    {
      id: 'notif-trial-1',
      subscriptionId: 'sub-2',
      subscriptionName: 'Superhuman AI Mail',
      title: 'Free Trial Ending in 2 Days',
      message: 'Heads up! Your Superhuman free trial ends in 2 days. After that, your DBS Visa Debit will be billed S$38.00/mo. Still enjoying the keyboard shortcuts?',
      type: 'trial_end',
      daysRemaining: 2,
      cost: 38.00,
      currency: 'SGD',
      read: false,
      dismissed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-renew-1',
      subscriptionId: 'sub-1',
      subscriptionName: 'Netflix Premium (4K)',
      title: 'Netflix Renews in 3 Days',
      message: 'Heads up! Netflix renews in 3 days (S$22.98). Still watching your watchlist?',
      type: 'renewal',
      daysRemaining: 3,
      cost: 22.98,
      currency: 'SGD',
      read: false,
      dismissed: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'notif-leak-1',
      subscriptionId: 'sub-3',
      subscriptionName: 'Equinox Gym / Fitness Club',
      title: 'Unused for 42 Days (S$185.00/mo)',
      message: "Hey friend, we noticed you haven't logged a gym visit in 42 days. That's S$185.00 each month! Would you like to pause, resume, or mark this for cancellation?",
      type: 'leakage_unused',
      daysRemaining: 14,
      cost: 185.00,
      currency: 'SGD',
      read: false,
      dismissed: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'notif-delivery-1',
      subscriptionId: 'sub-4',
      subscriptionName: 'Nespresso Master Coffee Pods',
      title: 'Coffee Pod Delivery in 6 Days',
      message: 'Nespresso recurring order of S$64.50 will be charged in 6 days. Stocked up already or ready for fresh beans?',
      type: 'renewal',
      daysRemaining: 6,
      cost: 64.50,
      currency: 'SGD',
      read: true,
      dismissed: false,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];

  return notifications;
}

export const StorageService = {
  getSubscriptions(): Subscription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      if (!data) {
        const initial = getInitialMockSubscriptions();
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch (err) {
      console.warn('Failed to read subscriptions from localStorage, returning defaults', err);
      return getInitialMockSubscriptions();
    }
  },

  saveSubscriptions(subscriptions: Subscription[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
    } catch (err) {
      console.error('Failed to save subscriptions to localStorage', err);
    }
  },

  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) {
        const initialSubs = this.getSubscriptions();
        const initialNotifs = generateInitialNotifications(initialSubs);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
        return initialNotifs;
      }
      return JSON.parse(data);
    } catch (err) {
      console.warn('Failed to read notifications from localStorage', err);
      return [];
    }
  },

  saveNotifications(notifications: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (err) {
      console.error('Failed to save notifications to localStorage', err);
    }
  },

  resetToDemo(): { subscriptions: Subscription[]; notifications: AppNotification[] } {
    const freshSubs = getInitialMockSubscriptions();
    const freshNotifs = generateInitialNotifications(freshSubs);
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(freshSubs));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(freshNotifs));
    return { subscriptions: freshSubs, notifications: freshNotifs };
  },

  exportBackupJson(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subscriptions: this.getSubscriptions(),
      notifications: this.getNotifications(),
    };
    return JSON.stringify(data, null, 2);
  },

  importBackupJson(jsonString: string): { success: boolean; message: string; count?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.subscriptions)) {
        return { success: false, message: 'Invalid JSON format: missing subscriptions array.' };
      }
      this.saveSubscriptions(parsed.subscriptions);
      if (Array.isArray(parsed.notifications)) {
        this.saveNotifications(parsed.notifications);
      }
      return {
        success: true,
        message: `Successfully imported ${parsed.subscriptions.length} subscriptions.`,
        count: parsed.subscriptions.length,
      };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err?.message || 'Invalid JSON'}` };
    }
  },
};
