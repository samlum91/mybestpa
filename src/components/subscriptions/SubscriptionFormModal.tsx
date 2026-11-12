import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  CreditCard,
  Bell,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  Subscription,
  SubscriptionCategory,
  SubscriptionType,
  BillingCycle,
  SubscriptionStatus,
} from '../../types/subscription';
import { calculateNextRenewal } from '../../utils/dateCalculations';
import { format } from 'date-fns';

interface SubscriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Subscription | null;
}

const CATEGORIES: SubscriptionCategory[] = [
  'Streaming',
  'Software',
  'Fitness',
  'News',
  'Utilities',
  'Physical Product',
  'Membership',
  'Other',
];

const CURRENCIES = ['SGD', 'USD', 'EUR', 'GBP', 'MYR', 'AUD', 'JPY'];

export const SubscriptionFormModal: React.FC<SubscriptionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = !!initialData;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<SubscriptionCategory>('Streaming');
  const [type, setType] = useState<SubscriptionType>('Digital');
  const [cost, setCost] = useState<string>('');
  const [currency, setCurrency] = useState('SGD');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [customDays, setCustomDays] = useState<number>(30);
  const [startDate, setStartDate] = useState(todayStr);
  const [nextRenewalDate, setNextRenewalDate] = useState(todayStr);
  const [isOverrideRenewal, setIsOverrideRenewal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState('');
  const [cancellationNoticePeriod, setCancellationNoticePeriod] = useState<number>(0);
  const [cancellationNotes, setCancellationNotes] = useState('');
  const [status, setStatus] = useState<SubscriptionStatus>('Active');
  const [lastUsedDate, setLastUsedDate] = useState('');
  
  // Alert settings
  const [remindDaysBefore, setRemindDaysBefore] = useState(3);
  const [trialReminder, setTrialReminder] = useState(true);
  const [cancellationReminder, setCancellationReminder] = useState(true);

  const [validationError, setValidationError] = useState('');

  // Populate on open/edit
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setType(initialData.type);
      setCost(initialData.cost.toString());
      setCurrency(initialData.currency || 'SGD');
      setBillingCycle(initialData.billingCycle);
      setCustomDays(initialData.customDays || 30);
      setStartDate(initialData.startDate || todayStr);
      setNextRenewalDate(initialData.nextRenewalDate || todayStr);
      setIsOverrideRenewal(!!initialData.renewalDateManuallyOverridden);
      setPaymentMethod(initialData.paymentMethod || '');
      setIsTrial(!!initialData.isTrial);
      setTrialEndDate(initialData.trialEndDate || '');
      setCancellationNoticePeriod(initialData.cancellationNoticePeriod || 0);
      setCancellationNotes(initialData.cancellationNotes || '');
      setStatus(initialData.status);
      setLastUsedDate(initialData.lastUsedDate || '');
      setRemindDaysBefore(initialData.remindDaysBefore ?? 3);
      setTrialReminder(initialData.trialReminder ?? true);
      setCancellationReminder(initialData.cancellationReminder ?? true);
    } else {
      setName('');
      setCategory('Streaming');
      setType('Digital');
      setCost('');
      setCurrency('SGD');
      setBillingCycle('monthly');
      setCustomDays(30);
      setStartDate(todayStr);
      setNextRenewalDate(calculateNextRenewal(todayStr, 'monthly'));
      setIsOverrideRenewal(false);
      setPaymentMethod('DBS Visa');
      setIsTrial(false);
      setTrialEndDate('');
      setCancellationNoticePeriod(0);
      setCancellationNotes('');
      setStatus('Active');
      setLastUsedDate(todayStr);
      setRemindDaysBefore(3);
      setTrialReminder(true);
      setCancellationReminder(true);
    }
    setValidationError('');
  }, [initialData, isOpen, todayStr]);

  // Auto-calculate renewal date when start date or cycle changes (unless manually overridden)
  useEffect(() => {
    if (!isOverrideRenewal && startDate) {
      const calculated = calculateNextRenewal(startDate, billingCycle, customDays);
      setNextRenewalDate(calculated);
    }
  }, [startDate, billingCycle, customDays, isOverrideRenewal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setValidationError('Please enter a subscription name.');
      return;
    }

    const numericCost = parseFloat(cost);
    if (isNaN(numericCost) || numericCost < 0) {
      setValidationError('Please enter a valid cost amount (0 or greater).');
      return;
    }

    if (!nextRenewalDate) {
      setValidationError('Please specify the next renewal date.');
      return;
    }

    onSubmit({
      name: name.trim(),
      category,
      type,
      cost: numericCost,
      currency,
      billingCycle,
      customDays: billingCycle === 'custom' ? Number(customDays) : undefined,
      startDate,
      nextRenewalDate,
      renewalDateManuallyOverridden: isOverrideRenewal,
      paymentMethod: paymentMethod.trim() || 'Unassigned',
      isTrial,
      trialEndDate: isTrial ? trialEndDate : undefined,
      cancellationNoticePeriod: Number(cancellationNoticePeriod) || 0,
      cancellationNotes: cancellationNotes.trim(),
      status,
      lastUsedDate: lastUsedDate || undefined,
      remindDaysBefore: Number(remindDaysBefore) || 3,
      trialReminder,
      cancellationReminder,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {isEditing ? 'Edit Subscription' : 'Add New Subscription'}
            </h3>
            <p className="text-xs text-slate-500">
              Track online tools, offline memberships, or contracts in one place
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subscription Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Netflix, Virgin Active, Figma"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SubscriptionCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Type & Cost/Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            {/* Type */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SubscriptionType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              >
                <option value="Digital">Digital (App/SaaS)</option>
                <option value="Physical">Physical (Gym/Delivery)</option>
                <option value="Contract">Contract (Telco/Lease)</option>
              </select>
            </div>

            {/* Currency */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>

            {/* Cost */}
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-3 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 3. Billing Cycle & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly (3 months)</option>
                <option value="yearly">Yearly (Annual)</option>
                <option value="custom">Custom interval</option>
              </select>

              {billingCycle === 'custom' && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className="w-20 px-2.5 py-1 text-xs border rounded-lg"
                  />
                  <span className="text-xs text-slate-500">days per cycle</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          {/* 4. Next Renewal Date & Manual Override */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next Renewal Date *</span>
              </label>

              <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOverrideRenewal}
                  onChange={(e) => setIsOverrideRenewal(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                />
                <span>Manual override</span>
              </label>
            </div>

            <input
              type="date"
              required
              disabled={!isOverrideRenewal}
              value={nextRenewalDate}
              onChange={(e) => setNextRenewalDate(e.target.value)}
              className={`w-full px-3 py-2 text-xs border rounded-xl font-medium ${
                isOverrideRenewal
                  ? 'bg-white border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-slate-900'
                  : 'bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed'
              }`}
            />
            {!isOverrideRenewal && (
              <p className="text-[11px] text-slate-500">
                Auto-calculated from start date + {billingCycle} cycle. Check &ldquo;Manual override&rdquo; to set a custom date.
              </p>
            )}
          </div>

          {/* 5. Payment Method Label & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method Label
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g. DBS Visa, OCBC 365, GIRO"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Friendly label only. Never enter actual card numbers.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* 6. Free Trial Section */}
          <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-900">
              <input
                type="checkbox"
                checked={isTrial}
                onChange={(e) => setIsTrial(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <span>This is currently a Free Trial</span>
            </label>

            {isTrial && (
              <div className="pt-1 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Trial End Date
                </label>
                <input
                  type="date"
                  value={trialEndDate}
                  onChange={(e) => setTrialEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <p className="text-[11px] text-amber-800">
                  We&apos;ll alert you before the trial expires so you can cancel before being charged.
                </p>
              </div>
            )}
          </div>

          {/* 7. Cancellation Notice & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cancellation Notice (Days)
              </label>
              <input
                type="number"
                min="0"
                value={cancellationNoticePeriod}
                onChange={(e) => setCancellationNoticePeriod(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                e.g. 30 days for gym or broadband contracts.
              </span>
            </div>

            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Used Date (Optional)
              </label>
              <input
                type="date"
                value={lastUsedDate}
                onChange={(e) => setLastUsedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Helps detect zombie unused services (&gt;30 days).
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cancellation Link or Instructions
            </label>
            <textarea
              rows={2}
              value={cancellationNotes}
              onChange={(e) => setCancellationNotes(e.target.value)}
              placeholder="e.g. https://account.netflix.com/cancel, or 'Submit physical form to gym front desk by 15th'"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 resize-none"
            />
          </div>

          {/* 8. Personal Assistant Alert Settings */}
          <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 space-y-2.5">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-700" />
              <span>Personal Assistant Alert Settings</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-700">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Remind before renewal:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={remindDaysBefore}
                    onChange={(e) => setRemindDaysBefore(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border rounded-lg bg-white"
                  />
                  <span>days</span>
                </div>
              </div>

              <div className="flex items-center pt-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium">
                  <input
                    type="checkbox"
                    checked={trialReminder}
                    onChange={(e) => setTrialReminder(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Trial expiry alert</span>
                </label>
              </div>

              <div className="flex items-center pt-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium">
                  <input
                    type="checkbox"
                    checked={cancellationReminder}
                    onChange={(e) => setCancellationReminder(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Notice deadline alert</span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-all"
            >
              {isEditing ? 'Save Changes' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
