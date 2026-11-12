import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Ban,
  Sparkles,
  AlertTriangle,
  Info,
  Calendar,
  Check,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { useSubscriptions } from '../../context/SubscriptionContext';
import { formatDisplayDate, formatCurrency } from '../../utils/dateCalculations';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadNotifCount,
    markNotificationRead,
    markAllNotificationsRead,
    handleNotificationAction,
    notificationPermission,
    requestNotificationPermission,
    sendTestBrowserNotification,
    setDetailModal,
    subscriptions,
  } = useSubscriptions();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'actioned'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'actioned') return !!n.actionTaken;
    return true;
  });

  const getSub = (subId: string) => subscriptions.find((s) => s.id === subId);

  return (
    <div className="space-y-6">
      {/* Top Banner / Assistant Intro */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50/30 border border-emerald-200/70 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Your Subscription Personal Assistant
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                I keep an eye on all your renewals, expiring trials, and cancellation deadlines so you never get hit with surprise charges.
              </p>
            </div>
          </div>

          {/* Browser Notification Permissions */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {notificationPermission === 'granted' ? (
              <button
                onClick={sendTestBrowserNotification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Send a sample desktop push alert"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Test Desktop Alert</span>
              </button>
            ) : notificationPermission === 'default' ? (
              <button
                onClick={requestNotificationPermission}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Browser Alerts</span>
              </button>
            ) : (
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                In-app alerts active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control bar: Filters & Mark all read */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Segmented filter */}
        <div className="flex items-center p-1 bg-slate-200/60 rounded-xl text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === 'unread'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Unread</span>
            {unreadNotifCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unreadNotifCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('actioned')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'actioned'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Resolved
          </button>
        </div>

        {unreadNotifCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-medium text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">All clear!</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            {activeFilter === 'unread'
              ? 'You have caught up with all assistant alerts. No pending renewals require your attention.'
              : 'No alerts match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredNotifications.map((notif) => {
            const sub = getSub(notif.subscriptionId);
            const isResolved = !!notif.actionTaken;

            return (
              <div
                key={notif.id}
                className={`group relative rounded-2xl border transition-all p-5 ${
                  !notif.read
                    ? 'bg-white border-emerald-300/80 shadow-sm'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Indicator & Content */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === 'trial_end'
                          ? 'bg-amber-100 text-amber-800'
                          : notif.type === 'leakage_unused'
                          ? 'bg-rose-100 text-rose-800'
                          : notif.type === 'cancellation_deadline'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {notif.type === 'trial_end' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : notif.type === 'leakage_unused' ? (
                        <Ban className="w-4 h-4" />
                      ) : notif.type === 'cancellation_deadline' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Calendar className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" title="Unread" />
                        )}
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {notif.subscriptionName}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-mono font-medium text-slate-700 tabular-nums">
                          {formatCurrency(notif.cost, notif.currency)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>

                      {/* If action already taken, show confirmation note */}
                      {isResolved && (
                        <div className="pt-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {notif.actionTaken === 'kept'
                              ? 'Marked as kept'
                              : notif.actionTaken === 'snoozed'
                              ? 'Snoozed for 24h'
                              : 'Marked for cancellation'}
                          </span>
                          {notif.snoozedUntil && (
                            <span className="text-slate-400">
                              (Reminding again tomorrow)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side / Timestamp */}
                  <div className="sm:text-right shrink-0">
                    <span className="text-xs text-slate-400 block">
                      {formatDisplayDate(notif.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Personal Assistant Action Buttons (The Lovable UX) */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        handleNotificationAction(notif.id, 'kept', notif.subscriptionId)
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        notif.actionTaken === 'kept'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Keep Subscription</span>
                    </button>

                    <button
                      onClick={() =>
                        handleNotificationAction(notif.id, 'snoozed', notif.subscriptionId)
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        notif.actionTaken === 'snoozed'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Remind Me Later</span>
                    </button>

                    <button
                      onClick={() =>
                        handleNotificationAction(notif.id, 'cancelled', notif.subscriptionId)
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        notif.actionTaken === 'cancelled'
                          ? 'bg-rose-100 text-rose-800 font-semibold'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Mark to Cancel</span>
                    </button>
                  </div>

                  {sub && (
                    <button
                      onClick={() => setDetailModal(sub)}
                      className="text-xs font-medium text-slate-500 hover:text-emerald-700 hover:underline transition-colors ml-auto"
                    >
                      View Subscription Details →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
