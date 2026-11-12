import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Subscription } from '../../types/subscription';
import { calculateMonthlyEquivalent, formatCurrency } from '../../utils/dateCalculations';

interface CategorySpendChartProps {
  subscriptions: Subscription[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: '#10b981', // emerald-500
  Software: '#0d9488', // teal-600
  Fitness: '#059669', // emerald-600
  News: '#3b82f6', // blue-500
  Utilities: '#6366f1', // indigo-500
  'Physical Product': '#f59e0b', // amber-500
  Membership: '#8b5cf6', // purple-500
  Other: '#64748b', // slate-500
};

export const CategorySpendChart: React.FC<CategorySpendChartProps> = ({ subscriptions }) => {
  const activeSubs = subscriptions.filter((s) => s.status === 'Active');

  // Group monthly spend by category
  const categoryTotals: Record<string, { total: number; count: number }> = {};

  activeSubs.forEach((sub) => {
    const monthly = calculateMonthlyEquivalent(sub.cost, sub.billingCycle, sub.customDays);
    if (!categoryTotals[sub.category]) {
      categoryTotals[sub.category] = { total: 0, count: 0 };
    }
    categoryTotals[sub.category].total += monthly;
    categoryTotals[sub.category].count += 1;
  });

  const chartData = Object.entries(categoryTotals)
    .map(([name, data]) => ({
      name,
      value: Math.round(data.total * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  const totalMonthly = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>No active subscriptions to chart yet.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = totalMonthly > 0 ? ((data.value / totalMonthly) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-md text-xs">
          <div className="font-semibold text-slate-800">{data.name}</div>
          <div className="font-mono text-emerald-700 font-bold mt-0.5 tabular-nums">
            {formatCurrency(data.value, 'SGD')}/mo
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5">
            {percent}% of monthly spend · {data.count} {data.count === 1 ? 'sub' : 'subs'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      {/* Donut Chart Container */}
      <div className="md:col-span-6 h-64 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Monthly
          </span>
          <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalMonthly, 'SGD')}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="md:col-span-6 space-y-2 max-h-64 overflow-y-auto pr-1">
        {chartData.map((item) => {
          const percent = totalMonthly > 0 ? Math.round((item.value / totalMonthly) * 100) : 0;
          return (
            <div
              key={item.name}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#94a3b8' }}
                />
                <span className="font-medium text-slate-800">{item.name}</span>
                <span className="text-slate-400">({item.count})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 tabular-nums">{percent}%</span>
                <span className="font-mono font-semibold text-slate-800 tabular-nums">
                  {formatCurrency(item.value, 'SGD')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
