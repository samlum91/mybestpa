import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Ban,
  Check,
  Calendar,
  Zap,
  TrendingDown,
  Info,
} from 'lucide-react';
import { useSubscriptions } from '../../context/SubscriptionContext';
import { formatCurrency, formatDisplayDate } from '../../utils/dateCalculations';

export const LeakageView: React.FC = () => {
  const {
    leakages,
    logUsageToday,
    toggleStatus,
    setDetailModal,
    subscriptions,
    totalMonthlySpend,
  } = useSubscriptions();

  const totalLeakageSavings = leakages.reduce((sum, item) => sum + item.potentialSavings, 0);
  const percentLeakage =
    totalMonthlySpend > 0 ? Math.round((totalLeakageSavings / totalMonthlySpend) * 100) : 0;

  const trialLeakages = leakages.filter((l) => l.reason === 'trial_ending');
  const zombieLeakages = leakages.filter((l) => l.reason === 'unused_zombie');
  const noticeLeakages = leakages.filter((l) => l.reason === 'cancellation_deadline');

  return (
    <div className="space-y-6">
      {/* Top Banner / Analysis Card */}
      <div className="bg-gradient-to-r from-rose-50 via-amber-50/50 to-emerald-50/40 border border-rose-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider bg-rose-100/80 px-2 py-0.5 rounded">
                  Leakage Audit
                </span>
                <span className="text-xs text-slate-500">
                  Automated Personal Assistant Scan
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {leakages.length === 0
                  ? 'No Financial Leakage Found'
                  : `${leakages.length} Subscription ${leakages.length === 1 ? 'Leak' : 'Leaks'} Detected`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                We continuously scan for trials about to bill your card, subscriptions you haven&apos;t opened in over 30 days, and contractual notice deadlines.
              </p>
            </div>
          </div>

          {/* Savings Metric Box */}
          <div className="bg-white/90 backdrop-blur-sm border border-rose-200 rounded-2xl p-4.5 shrink-0 shadow-xs text-center md:text-right min-w-[200px]">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Recoverable Spend
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-rose-700 tabular-nums mt-0.5">
              {formatCurrency(totalLeakageSavings, 'SGD')}
              <span className="text-xs font-sans text-slate-500 font-normal"> /mo</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              {formatCurrency(totalLeakageSavings * 12, 'SGD')}/yr · ~{percentLeakage}% of monthly budget
            </span>
          </div>
        </div>
      </div>

      {/* 3 Pillars Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Free Trials */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Free Trials (&le;3d)
            </span>
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center font-mono">
              {trialLeakages.length}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Trials scheduled to convert into paid subscriptions in 3 days or fewer.
          </p>
        </div>

        {/* Pillar 2: Zombie Unused */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Zombie Unused (&gt;30d)
            </span>
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center font-mono">
              {zombieLeakages.length}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Active services where last logged usage was more than a month ago.
          </p>
        </div>

        {/* Pillar 3: Cancellation Deadlines */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              Notice Window (&le;5d)
            </span>
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center font-mono">
              {noticeLeakages.length}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Upcoming renewal where the required cancellation notice deadline is near.
          </p>
        </div>
      </div>

      {/* Detailed Leakage List */}
      {leakages.length === 0 ? (
        <div className="bg-white border border-emerald-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Clean Financial Bill of Health
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You are actively using all services, have no runaway trials, and no impending notice deadlines. We will automatically alert you if anything requires attention.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Actionable Leakage Items
          </h3>

          <div className="space-y-3">
            {leakages.map((item, idx) => {
              const sub = item.subscription;

              return (
                <div
                  key={`leak-view-${sub.id}-${idx}`}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
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
                            : 'Zombie Unused'}
                        </span>
                        <span className="font-bold text-slate-900 text-base">
                          {sub.name}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {sub.paymentMethod}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {item.description}
                      </p>

                      {sub.cancellationNotes && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mt-1">
                          <strong className="text-slate-800">How to cancel:</strong> {sub.cancellationNotes}
                        </div>
                      )}
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="font-mono text-base font-bold text-rose-700 tabular-nums block">
                        {formatCurrency(item.potentialSavings, 'SGD')}/mo
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatCurrency(item.potentialSavings * 12, 'SGD')}/year
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.reason === 'unused_zombie' && (
                        <button
                          onClick={() => logUsageToday(sub.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>I used this today (Keep active)</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleStatus(sub.id, 'Cancelled')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel Subscription</span>
                      </button>

                      <button
                        onClick={() => toggleStatus(sub.id, 'Paused')}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Pause Temporarily
                      </button>
                    </div>

                    <button
                      onClick={() => setDetailModal(sub)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
                    >
                      <span>View Cancellation Policy</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
