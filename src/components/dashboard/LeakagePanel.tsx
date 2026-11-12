import React from 'react';
import {
  AlertOctagon,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Ban,
  Check,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useSubscriptions } from '../../context/SubscriptionContext';
import { formatCurrency, formatDisplayDate } from '../../utils/dateCalculations';
import { LeakageItem } from '../../types/subscription';

interface LeakagePanelProps {
  onViewSubscription: (subId: string) => void;
}

export const LeakagePanel: React.FC<LeakagePanelProps> = ({ onViewSubscription }) => {
  const {
    leakages,
    logUsageToday,
    toggleStatus,
    setDetailModal,
    subscriptions,
  } = useSubscriptions();

  const totalLeakageSavings = leakages.reduce((sum, item) => sum + item.potentialSavings, 0);

  if (leakages.length === 0) {
    return (
      <div className="bg-white border border-emerald-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Zero Leakage Detected</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                100% Efficient
              </span>
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              All active subscriptions are frequently used, within safe trial windows, and have no urgent cancellation notice deadlines.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-rose-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Leakage Radar</span>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 tabular-nums">
                {leakages.length} {leakages.length === 1 ? 'risk' : 'risks'} found
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Expiring trials, zombie unused apps, or urgent cancellation notice deadlines.
            </p>
          </div>
        </div>

        {/* Potential Savings Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-rose-50/70 border border-rose-200/70 px-3 py-1.5 rounded-xl">
          <span className="text-xs font-medium text-rose-800">Potential monthly savings:</span>
          <span className="text-sm font-bold font-mono text-rose-700 tabular-nums">
            {formatCurrency(totalLeakageSavings, 'SGD')}/mo
          </span>
        </div>
      </div>

      {/* List of leakage items */}
      <div className="grid grid-cols-1 gap-3">
        {leakages.map((item, idx) => {
          const sub = item.subscription;

          return (
            <div
              key={`${sub.id}-${item.reason}-${idx}`}
              className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-4 border border-slate-200/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Item Info */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      item.reason === 'trial_ending'
                        ? 'bg-amber-100 text-amber-900'
                        : item.reason === 'cancellation_deadline'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {item.reason === 'trial_ending'
                      ? 'Free Trial Ending'
                      : item.reason === 'cancellation_deadline'
                      ? 'Notice Window'
                      : 'Zombie / Unused'}
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {sub.name}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-mono font-medium text-slate-700 tabular-nums">
                    {formatCurrency(sub.cost, sub.currency)} / {sub.billingCycle}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {sub.cancellationNotes && (
                  <p className="text-[11px] text-slate-500 bg-white/80 p-2 rounded border border-slate-200/60 font-mono">
                    <span className="font-sans font-semibold text-slate-700">Cancel note:</span>{' '}
                    {sub.cancellationNotes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {item.reason === 'unused_zombie' && (
                  <button
                    onClick={() => logUsageToday(sub.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
                    title="Click if you used this subscription recently"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>I used this today</span>
                  </button>
                )}

                <button
                  onClick={() => toggleStatus(sub.id, 'Cancelled')}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100/70 hover:bg-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Mark this subscription as cancelled"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Mark Cancelled</span>
                </button>

                <button
                  onClick={() => setDetailModal(sub)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
