import React from 'react';
import {
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  Check,
  Pause,
  Play,
  ArrowRight,
} from 'lucide-react';
import { Subscription } from '../../types/subscription';
import {
  formatCurrency,
  formatDisplayDate,
  formatDaysCountdown,
  getDaysUntil,
} from '../../utils/dateCalculations';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: Subscription['status']) => void;
  onLogUsage: (id: string) => void;
  onViewDetails: (sub: Subscription) => void;
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  onEdit,
  onDelete,
  onToggleStatus,
  onLogUsage,
  onViewDetails,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Subscription</th>
              <th className="py-3 px-4">Category & Type</th>
              <th className="py-3 px-4 text-right">Cost</th>
              <th className="py-3 px-4">Billing Cycle</th>
              <th className="py-3 px-4">Next Renewal</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscriptions.map((sub) => {
              const daysUntil = getDaysUntil(sub.nextRenewalDate);
              const { label: countdownLabel, isUrgent } = formatDaysCountdown(daysUntil);
              const isZombie = sub.lastUsedDate
                ? getDaysUntil(sub.lastUsedDate) <= -30
                : false;

              return (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Name & Trial / Unused indicator */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onViewDetails(sub)}
                      className="font-bold text-slate-900 hover:text-emerald-700 transition-colors text-left block text-sm"
                    >
                      {sub.name}
                    </button>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {sub.isTrial && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-1 rounded">
                          Trial
                        </span>
                      )}
                      {isZombie && sub.status === 'Active' && (
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-100/70 px-1 rounded">
                          Unused &gt;30d
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category & Type */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{sub.category}</div>
                    <div className="text-[11px] text-slate-400">{sub.type}</div>
                  </td>

                  {/* Cost */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums text-sm">
                    {formatCurrency(sub.cost, sub.currency)}
                  </td>

                  {/* Billing Cycle */}
                  <td className="py-3.5 px-4 text-slate-600 capitalize">
                    {sub.billingCycle === 'custom' ? `${sub.customDays}d` : sub.billingCycle}
                  </td>

                  {/* Next Renewal */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800">
                      {formatDisplayDate(sub.nextRenewalDate)}
                    </div>
                    <div
                      className={`text-[11px] font-semibold ${
                        isUrgent ? 'text-amber-700' : 'text-slate-400'
                      }`}
                    >
                      {countdownLabel}
                    </div>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 text-slate-600 max-w-[130px] truncate" title={sub.paymentMethod}>
                    {sub.paymentMethod || '—'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        sub.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                          : sub.status === 'Paused'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => onLogUsage(sub.id)}
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Mark used today"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      {sub.status === 'Active' ? (
                        <button
                          onClick={() => onToggleStatus(sub.id, 'Paused')}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                          title="Pause subscription"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleStatus(sub.id, 'Active')}
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Resume subscription"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onEdit(sub)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        title="Edit subscription"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDelete(sub.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete subscription"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
