import React from 'react';
import {
  Calendar,
  CreditCard,
  MoreVertical,
  Check,
  Edit2,
  Trash2,
  Pause,
  Play,
  Clock,
  Sparkles,
  ExternalLink,
  Ban,
} from 'lucide-react';
import { Subscription } from '../../types/subscription';
import {
  formatCurrency,
  formatDisplayDate,
  formatDaysCountdown,
  getDaysUntil,
} from '../../utils/dateCalculations';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: Subscription['status']) => void;
  onLogUsage: (id: string) => void;
  onViewDetails: (sub: Subscription) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription: sub,
  onEdit,
  onDelete,
  onToggleStatus,
  onLogUsage,
  onViewDetails,
}) => {
  const daysUntil = getDaysUntil(sub.nextRenewalDate);
  const { label: countdownLabel, isUrgent } = formatDaysCountdown(daysUntil);

  const isZombie = sub.lastUsedDate
    ? getDaysUntil(sub.lastUsedDate) <= -30
    : false;

  const isRenewingSoon = sub.status === 'Active' && daysUntil >= 0 && daysUntil <= 7;

  return (
    <div
      className={`group relative bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md ${
        sub.status === 'Paused'
          ? 'border-slate-200 bg-slate-50/50 opacity-80'
          : sub.status === 'Cancelled'
          ? 'border-slate-200 bg-slate-100/50 opacity-60'
          : isUrgent
          ? 'border-amber-300/80 hover:border-amber-400'
          : 'border-slate-200/90 hover:border-emerald-300'
      }`}
    >
      {/* Top Header: Category & Visual Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-medium text-slate-500">
            {sub.category}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-medium">
            {sub.type}
          </span>

          {/* Badges */}
          {sub.isTrial && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
              Trial
            </span>
          )}

          {isRenewingSoon && (
            <span className="text-[10px] font-bold text-orange-800 bg-orange-100/80 px-1.5 py-0.5 rounded">
              Renewing soon
            </span>
          )}

          {isZombie && sub.status === 'Active' && (
            <span className="text-[10px] font-bold text-rose-800 bg-rose-100/80 px-1.5 py-0.5 rounded">
              Unused &gt;30d
            </span>
          )}

          {sub.status === 'Paused' && (
            <span className="text-[10px] font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">
              Paused
            </span>
          )}

          {sub.status === 'Cancelled' && (
            <span className="text-[10px] font-bold text-rose-800 bg-rose-100/80 px-1.5 py-0.5 rounded">
              Cancelled
            </span>
          )}
        </div>

        {/* Card Actions Menu */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(sub)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
      </div>

      {/* Main Content: Title & Cost */}
      <div className="space-y-1 mb-4">
        <button
          onClick={() => onViewDetails(sub)}
          className="text-left font-bold text-slate-900 hover:text-emerald-700 text-base leading-snug line-clamp-1 transition-colors block w-full"
        >
          {sub.name}
        </button>

        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(sub.cost, sub.currency)}
          </span>
          <span className="text-xs text-slate-500 capitalize">
            / {sub.billingCycle === 'custom' ? `${sub.customDays} days` : sub.billingCycle}
          </span>
        </div>
      </div>

      {/* Info List: Renewal Date, Payment Method, Last Used */}
      <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Next Renewal</span>
          </span>
          <div className="text-right">
            <span className="font-medium text-slate-800 block">
              {formatDisplayDate(sub.nextRenewalDate)}
            </span>
            <span
              className={`text-[11px] font-semibold ${
                isUrgent ? 'text-amber-700' : 'text-slate-400'
              }`}
            >
              {countdownLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-500">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <span>Payment Method</span>
          </span>
          <span className="font-medium text-slate-800 truncate max-w-[130px]" title={sub.paymentMethod}>
            {sub.paymentMethod || 'None tagged'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Last used:</span>
          <span className={`font-medium ${isZombie ? 'text-rose-600' : 'text-slate-700'}`}>
            {formatDisplayDate(sub.lastUsedDate)}
          </span>
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onLogUsage(sub.id)}
          className="px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
          title="Mark that you used this today"
        >
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Used today</span>
        </button>

        <div className="flex items-center gap-1">
          {sub.status === 'Active' ? (
            <button
              onClick={() => onToggleStatus(sub.id, 'Paused')}
              className="px-2 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
              title="Pause subscription"
            >
              <Pause className="w-3 h-3" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={() => onToggleStatus(sub.id, 'Active')}
              className="px-2 py-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
              title="Reactivate subscription"
            >
              <Play className="w-3 h-3" />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={() => onViewDetails(sub)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
