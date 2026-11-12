import React, { useState } from 'react';
import {
  X,
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  Check,
  Pause,
  Play,
  ExternalLink,
  Copy,
  Clock,
  ShieldAlert,
  Info,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { Subscription } from '../../types/subscription';
import {
  formatCurrency,
  formatDisplayDate,
  formatDaysCountdown,
  getDaysUntil,
  calculateMonthlyEquivalent,
  calculateYearlyEquivalent,
} from '../../utils/dateCalculations';

interface SubscriptionDetailModalProps {
  subscription: Subscription | null;
  onClose: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: Subscription['status']) => void;
  onLogUsage: (id: string) => void;
}

export const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  subscription: sub,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  onLogUsage,
}) => {
  const [copiedNote, setCopiedNote] = useState(false);

  if (!sub) return null;

  const daysUntil = getDaysUntil(sub.nextRenewalDate);
  const { label: countdownLabel, isUrgent } = formatDaysCountdown(daysUntil);
  const monthlyCost = calculateMonthlyEquivalent(sub.cost, sub.billingCycle, sub.customDays);
  const yearlyCost = calculateYearlyEquivalent(sub.cost, sub.billingCycle, sub.customDays);

  const isZombie = sub.lastUsedDate
    ? getDaysUntil(sub.lastUsedDate) <= -30
    : false;

  const handleCopyNotes = () => {
    if (sub.cancellationNotes) {
      navigator.clipboard.writeText(sub.cancellationNotes);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {sub.category}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              {sub.type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Title & Cost banner */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {sub.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    sub.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                      : sub.status === 'Paused'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-rose-50 text-rose-800'
                  }`}
                >
                  {sub.status}
                </span>

                {sub.isTrial && (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Free Trial
                  </span>
                )}

                {isZombie && sub.status === 'Active' && (
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                    Zombie / Unused (&gt;30d)
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums block">
                {formatCurrency(sub.cost, sub.currency)}
              </span>
              <span className="text-xs text-slate-500 capitalize">
                per {sub.billingCycle === 'custom' ? `${sub.customDays} days` : sub.billingCycle}
              </span>
            </div>
          </div>

          {/* Spend normalizations */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500 block">Monthly Equivalent:</span>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                {formatCurrency(monthlyCost, sub.currency)}/mo
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Annual Commitment:</span>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                {formatCurrency(yearlyCost, sub.currency)}/yr
              </span>
            </div>
          </div>

          {/* Key Dates & Details */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Next Renewal</span>
              </span>
              <div className="text-right">
                <span className="font-semibold text-slate-800">
                  {formatDisplayDate(sub.nextRenewalDate)}
                </span>
                <span className="text-slate-400 ml-1.5">({countdownLabel})</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Payment Method</span>
              </span>
              <span className="font-medium text-slate-800">
                {sub.paymentMethod || 'None specified'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Subscription Started:</span>
              <span className="font-medium text-slate-800">
                {formatDisplayDate(sub.startDate)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Last Used:</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isZombie ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatDisplayDate(sub.lastUsedDate)}
                </span>
                <button
                  onClick={() => onLogUsage(sub.id)}
                  className="px-2 py-0.5 text-[11px] font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
                >
                  Used today
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Cancellation Notice Period:</span>
              <span className="font-medium text-slate-800">
                {sub.cancellationNoticePeriod > 0
                  ? `${sub.cancellationNoticePeriod} days required before renewal`
                  : 'Immediate / No notice required'}
              </span>
            </div>
          </div>

          {/* Cancellation Notes / Link */}
          {sub.cancellationNotes && (
            <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  <span>Cancellation Instructions & Links</span>
                </span>
                <button
                  onClick={handleCopyNotes}
                  className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedNote ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed break-words whitespace-pre-wrap font-sans">
                {sub.cancellationNotes}
              </p>
            </div>
          )}

          {/* Alert Settings Snapshot */}
          <div className="p-3 bg-stone-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
            <span>Alerts: Remind {sub.remindDaysBefore} days before renewal</span>
            <span className="text-slate-400">·</span>
            <span>Trials: {sub.trialReminder ? 'Enabled' : 'Disabled'}</span>
            <span className="text-slate-400">·</span>
            <span>Notice: {sub.cancellationReminder ? 'Enabled' : 'Disabled'}</span>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            <button
              onClick={() => {
                onDelete(sub.id);
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              {sub.status === 'Active' ? (
                <button
                  onClick={() => onToggleStatus(sub.id, 'Paused')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={() => onToggleStatus(sub.id, 'Active')}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Reactivate</span>
                </button>
              )}

              <button
                onClick={() => {
                  onEdit(sub);
                  onClose();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
