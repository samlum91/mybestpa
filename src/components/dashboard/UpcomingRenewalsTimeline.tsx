import React from 'react';
import {
  Calendar,
  CreditCard,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { Subscription } from '../../types/subscription';
import {
  formatDaysCountdown,
  formatDisplayDate,
  formatCurrency,
  getDaysUntil,
} from '../../utils/dateCalculations';

interface UpcomingRenewalsTimelineProps {
  renewals: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
  onLogUsage: (id: string) => void;
}

export const UpcomingRenewalsTimeline: React.FC<UpcomingRenewalsTimelineProps> = ({
  renewals,
  onSelectSubscription,
  onLogUsage,
}) => {
  if (renewals.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-2">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No renewals in the next 30 days</h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Your scheduled subscriptions are spaced out safely.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {renewals.map((sub, index) => {
        const daysUntil = getDaysUntil(sub.nextRenewalDate);
        const { label, isUrgent, isPast } = formatDaysCountdown(daysUntil);

        return (
          <div
            key={sub.id}
            className={`group relative rounded-xl border p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isUrgent && !isPast
                ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Left: Timing indicator & name */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-center shrink-0 border ${
                  isUrgent && !isPast
                    ? 'bg-amber-100 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-[10px] font-bold uppercase leading-none">
                  {daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TMRW' : `${daysUntil}d`}
                </span>
                <span className="text-[9px] text-slate-500 font-medium">
                  left
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {sub.name}
                  </span>
                  {sub.isTrial && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded">
                      Trial
                    </span>
                  )}
                  {sub.type !== 'Digital' && (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {sub.type}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDisplayDate(sub.nextRenewalDate)}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sub.paymentMethod || 'No card tagged'}</span>
                  </span>
                  <span>·</span>
                  <span className="capitalize">{sub.billingCycle}</span>
                </div>
              </div>
            </div>

            {/* Right: Cost & Quick Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-left sm:text-right">
                <span className="font-mono text-sm sm:text-base font-bold text-slate-900 tabular-nums block">
                  {formatCurrency(sub.cost, sub.currency)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {label}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectSubscription(sub)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                  title="View details & cancellation policy"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
