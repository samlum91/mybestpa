import {
  parseISO,
  format,
  differenceInCalendarDays,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  startOfDay,
  isValid,
} from 'date-fns';
import { BillingCycle, Subscription, LeakageItem } from '../types/subscription';

/**
 * Calculates the next renewal date starting from startDate and cycling forward
 * until it is >= today (or specified anchor).
 */
export function calculateNextRenewal(
  startDateStr: string,
  cycle: BillingCycle,
  customDays?: number,
  today: Date = new Date()
): string {
  if (!startDateStr) return format(new Date(), 'yyyy-MM-dd');
  
  const parsedStart = parseISO(startDateStr);
  if (!isValid(parsedStart)) return format(new Date(), 'yyyy-MM-dd');

  let currentRenewal = startOfDay(parsedStart);
  const normalizedToday = startOfDay(today);

  // If start date is already in the future, that is the first renewal date
  if (!isBefore(currentRenewal, normalizedToday)) {
    return format(currentRenewal, 'yyyy-MM-dd');
  }

  // Otherwise, advance by cycle increments until >= today
  let guard = 0;
  while (isBefore(currentRenewal, normalizedToday) && guard < 1000) {
    guard++;
    switch (cycle) {
      case 'weekly':
        currentRenewal = addWeeks(currentRenewal, 1);
        break;
      case 'monthly':
        currentRenewal = addMonths(currentRenewal, 1);
        break;
      case 'quarterly':
        currentRenewal = addMonths(currentRenewal, 3);
        break;
      case 'yearly':
        currentRenewal = addYears(currentRenewal, 1);
        break;
      case 'custom':
        currentRenewal = addDays(currentRenewal, Math.max(1, customDays || 30));
        break;
      default:
        currentRenewal = addMonths(currentRenewal, 1);
    }
  }

  return format(currentRenewal, 'yyyy-MM-dd');
}

/**
 * Normalizes cost into monthly equivalent for uniform spend calculation
 */
export function calculateMonthlyEquivalent(
  cost: number,
  cycle: BillingCycle,
  customDays?: number
): number {
  if (isNaN(cost) || cost < 0) return 0;
  switch (cycle) {
    case 'weekly':
      return cost * (52 / 12);
    case 'monthly':
      return cost;
    case 'quarterly':
      return cost / 3;
    case 'yearly':
      return cost / 12;
    case 'custom': {
      const days = Math.max(1, customDays || 30);
      return (cost / days) * 30.4375;
    }
    default:
      return cost;
  }
}

/**
 * Annualized spend calculation
 */
export function calculateYearlyEquivalent(
  cost: number,
  cycle: BillingCycle,
  customDays?: number
): number {
  return calculateMonthlyEquivalent(cost, cycle, customDays) * 12;
}

/**
 * Days remaining until a target date string (e.g. renewal date or trial end)
 */
export function getDaysUntil(targetDateStr: string, today: Date = new Date()): number {
  if (!targetDateStr) return 999;
  const target = parseISO(targetDateStr);
  if (!isValid(target)) return 999;
  return differenceInCalendarDays(startOfDay(target), startOfDay(today));
}

/**
 * Formats countdown nicely: "Today", "Tomorrow", "In 3 days", "3 days ago"
 */
export function formatDaysCountdown(days: number): { label: string; isUrgent: boolean; isPast: boolean } {
  if (days === 0) {
    return { label: 'Renews today', isUrgent: true, isPast: false };
  }
  if (days === 1) {
    return { label: 'Tomorrow', isUrgent: true, isPast: false };
  }
  if (days > 1 && days <= 3) {
    return { label: `In ${days} days`, isUrgent: true, isPast: false };
  }
  if (days > 3 && days <= 7) {
    return { label: `In ${days} days`, isUrgent: false, isPast: false };
  }
  if (days > 7) {
    return { label: `In ${days} days`, isUrgent: false, isPast: false };
  }
  return { label: `${Math.abs(days)}d ago`, isUrgent: true, isPast: true };
}

/**
 * Format currency nicely
 */
export function formatCurrency(amount: number, currency: string = 'SGD'): string {
  const symbolMap: Record<string, string> = {
    SGD: 'S$',
    USD: '$',
    EUR: '€',
    GBP: '£',
    MYR: 'RM',
    AUD: 'A$',
    JPY: '¥',
  };

  const symbol = symbolMap[currency] || `${currency} `;
  const formattedNum = (Math.round(amount * 100) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formattedNum}`;
}

/**
 * Format date for friendly display e.g. "15 Nov 2026"
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) return dateStr;
  return format(parsed, 'd MMM yyyy');
}

/**
 * Detect financial leakage across subscriptions:
 * 1. Free trial ending within 3 days
 * 2. Unused for > 30 days
 * 3. Cancellation notice deadline is approaching or passed
 */
export function detectLeakages(subscriptions: Subscription[], today: Date = new Date()): LeakageItem[] {
  const leakages: LeakageItem[] = [];
  const normalizedToday = startOfDay(today);

  for (const sub of subscriptions) {
    if (sub.status !== 'Active') continue;

    const monthlyCost = calculateMonthlyEquivalent(sub.cost, sub.billingCycle, sub.customDays);

    // 1. Free Trial Ending Soon (within 3 days or already past)
    if (sub.isTrial && sub.trialEndDate) {
      const trialDaysLeft = differenceInCalendarDays(
        startOfDay(parseISO(sub.trialEndDate)),
        normalizedToday
      );
      if (trialDaysLeft <= 3) {
        leakages.push({
          subscription: sub,
          reason: 'trial_ending',
          urgency: trialDaysLeft <= 1 ? 'high' : 'medium',
          title: `Free Trial Ending ${trialDaysLeft <= 0 ? 'Today/Passed' : `in ${trialDaysLeft} days`}`,
          description: `Trial for ${sub.name} ends on ${formatDisplayDate(sub.trialEndDate)}. You'll be billed ${formatCurrency(sub.cost, sub.currency)} upon renewal.`,
          daysRemainingOrUnused: trialDaysLeft,
          potentialSavings: monthlyCost,
        });
      }
    }

    // 2. Cancellation Notice Deadline Approaching
    // If notice period is 14 days, and renewal is in 16 days, deadline is in 2 days!
    if (sub.cancellationNoticePeriod > 0) {
      const renewalDaysLeft = getDaysUntil(sub.nextRenewalDate, today);
      const daysUntilNoticeDeadline = renewalDaysLeft - sub.cancellationNoticePeriod;

      if (daysUntilNoticeDeadline >= 0 && daysUntilNoticeDeadline <= 5) {
        leakages.push({
          subscription: sub,
          reason: 'cancellation_deadline',
          urgency: daysUntilNoticeDeadline <= 2 ? 'high' : 'medium',
          title: `Cancellation Notice Deadline (${daysUntilNoticeDeadline === 0 ? 'Today' : `in ${daysUntilNoticeDeadline}d`})`,
          description: `${sub.name} requires ${sub.cancellationNoticePeriod} days notice before renewal on ${formatDisplayDate(sub.nextRenewalDate)}. Act now if you plan to cancel.`,
          daysRemainingOrUnused: daysUntilNoticeDeadline,
          potentialSavings: monthlyCost,
        });
      }
    }

    // 3. Unused Zombie Subscription (last used > 30 days ago)
    if (sub.lastUsedDate) {
      const daysSinceUsed = differenceInCalendarDays(
        normalizedToday,
        startOfDay(parseISO(sub.lastUsedDate))
      );
      if (daysSinceUsed >= 30) {
        leakages.push({
          subscription: sub,
          reason: 'unused_zombie',
          urgency: daysSinceUsed >= 60 ? 'high' : 'medium',
          title: `Unused for ${daysSinceUsed} days`,
          description: `Last logged activity was ${formatDisplayDate(sub.lastUsedDate)}. You are paying ${formatCurrency(monthlyCost, sub.currency)}/mo for this.`,
          daysRemainingOrUnused: daysSinceUsed,
          potentialSavings: monthlyCost,
        });
      }
    }
  }

  // Sort by urgency: high first, then by potential savings
  return leakages.sort((a, b) => {
    if (a.urgency === 'high' && b.urgency !== 'high') return -1;
    if (b.urgency === 'high' && a.urgency !== 'high') return 1;
    return b.potentialSavings - a.potentialSavings;
  });
}
