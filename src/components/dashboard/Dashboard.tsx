import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Layers,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  Tv,
  Package,
  FileText,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useSubscriptions } from '../../context/SubscriptionContext';
import { formatCurrency } from '../../utils/dateCalculations';
import { CategorySpendChart } from './CategorySpendChart';
import { UpcomingRenewalsTimeline } from './UpcomingRenewalsTimeline';
import { LeakagePanel } from './LeakagePanel';

interface DashboardProps {
  onNavigateToSubscriptions: () => void;
  onNavigateToLeakage: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToSubscriptions,
  onNavigateToLeakage,
}) => {
  const {
    subscriptions,
    activeCount,
    totalMonthlySpend,
    totalYearlySpend,
    renewalsNext7Days,
    upcomingRenewals30Days,
    leakages,
    openAddModal,
    setDetailModal,
    logUsageToday,
  } = useSubscriptions();

  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const digitalCount = activeSubs.filter((s) => s.type === 'Digital').length;
  const physicalCount = activeSubs.filter((s) => s.type === 'Physical').length;
  const contractCount = activeSubs.filter((s) => s.type === 'Contract').length;

  return (
    <div className="space-y-7">
      {/* 4 Summary Cards (Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Monthly Spend */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              Total Monthly Spend
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalMonthlySpend, 'SGD')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span className="text-emerald-700 font-medium">All billing normalized</span>
            <span>·</span>
            <span>Monthly avg</span>
          </div>
        </div>

        {/* Card 2: Projected Yearly Spend */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              Projected Yearly Spend
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalYearlySpend, 'SGD')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>Annual commitment</span>
            <span>·</span>
            <span className="font-mono tabular-nums">~{formatCurrency(totalMonthlySpend * 12, 'SGD')}</span>
          </div>
        </div>

        {/* Card 3: Active Subscriptions */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              Active Subscriptions
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums flex items-baseline gap-2">
            <span>{activeCount}</span>
            <span className="text-xs font-sans text-slate-400 font-normal">
              ({subscriptions.length} total tracked)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span title="Digital apps">{digitalCount} Digital</span>
            <span>·</span>
            <span title="Physical delivery / gym">{physicalCount} Physical</span>
            <span>·</span>
            <span title="Contract utilities / telco">{contractCount} Contract</span>
          </div>
        </div>

        {/* Card 4: Renewals in next 7 days */}
        <div
          className={`border rounded-2xl p-5 shadow-xs transition-all ${
            renewalsNext7Days.count > 0
              ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
              : 'bg-white border-slate-200/90 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-semibold tracking-wide uppercase ${
                renewalsNext7Days.count > 0 ? 'text-amber-800' : 'text-slate-500'
              }`}
            >
              Renewals Next 7 Days
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                renewalsNext7Days.count > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums flex items-baseline gap-2">
            <span>{renewalsNext7Days.count}</span>
            <span className="text-xs font-sans font-medium text-slate-600">
              ({formatCurrency(renewalsNext7Days.totalCost, 'SGD')} due)
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {renewalsNext7Days.count > 0 ? (
              <span className="text-amber-800 font-medium">
                {renewalsNext7Days.items.map((i) => i.name).slice(0, 2).join(', ')}
                {renewalsNext7Days.items.length > 2 ? ` +${renewalsNext7Days.items.length - 2} more` : ''}
              </span>
            ) : (
              <span>No renewals due this week</span>
            )}
          </div>
        </div>
      </div>

      {/* Leakage Prevention Panel */}
      <LeakagePanel onViewSubscription={(id) => {
        const sub = subscriptions.find((s) => s.id === id);
        if (sub) setDetailModal(sub);
      }} />

      {/* Main Grid: Upcoming Renewals (Left 7 cols) & Category Breakdown (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Upcoming Renewals Timeline (Next 30 Days) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Upcoming Renewals
              </h3>
              <p className="text-xs text-slate-500">
                Sorted chronologically for the next 30 days
              </p>
            </div>
            <button
              onClick={onNavigateToSubscriptions}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
            >
              <span>View all subscriptions</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <UpcomingRenewalsTimeline
            renewals={upcomingRenewals30Days}
            onSelectSubscription={(sub) => setDetailModal(sub)}
            onLogUsage={(id) => logUsageToday(id)}
          />
        </div>

        {/* Right Column: Spend by Category Chart */}
        <div className="lg:col-span-5 space-y-3.5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Spend by Category
            </h3>
            <p className="text-xs text-slate-500">
              Normalized monthly expense distribution
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <CategorySpendChart subscriptions={subscriptions} />
          </div>

          {/* Quick Tip Assistant Card */}
          <div className="bg-stone-100/80 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800 block mb-1">
              Personal Assistant Tip:
            </span>
            Physical memberships and utility contracts often have 30-day notice requirements. We track both online software and offline gym/contracts so you never miss cancellation windows.
          </div>
        </div>
      </div>
    </div>
  );
};
