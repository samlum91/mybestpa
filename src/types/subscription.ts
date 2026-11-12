export type SubscriptionCategory =
  | 'Streaming'
  | 'Software'
  | 'Fitness'
  | 'News'
  | 'Utilities'
  | 'Physical Product'
  | 'Membership'
  | 'Other';

export type SubscriptionType = 'Digital' | 'Physical' | 'Contract';

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export type SubscriptionStatus = 'Active' | 'Paused' | 'Cancelled';

export type Currency = 'SGD' | 'USD' | 'EUR' | 'GBP' | 'MYR' | 'AUD' | 'JPY';

export interface AlertSettings {
  remindDaysBefore: number; // default 3
  trialReminder: boolean;
  cancellationReminder: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  type: SubscriptionType;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  customDays?: number;
  startDate: string; // YYYY-MM-DD
  nextRenewalDate: string; // YYYY-MM-DD
  renewalDateManuallyOverridden?: boolean;
  paymentMethod: string; // Free text label e.g. "DBS Visa", "OCBC 365"
  isTrial: boolean;
  trialEndDate?: string; // YYYY-MM-DD
  cancellationNoticePeriod: number; // in days
  cancellationNotes?: string; // link or instructions e.g. "Call 1800-xxx before 15th"
  status: SubscriptionStatus;
  lastUsedDate?: string; // YYYY-MM-DD
  remindDaysBefore: number;
  trialReminder: boolean;
  cancellationReminder: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'renewal'
  | 'trial_end'
  | 'leakage_unused'
  | 'cancellation_deadline';

export interface AppNotification {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  title: string;
  message: string;
  type: NotificationType;
  daysRemaining: number;
  cost: number;
  currency: string;
  read: boolean;
  dismissed: boolean;
  snoozedUntil?: string; // ISO string
  actionTaken?: 'kept' | 'snoozed' | 'cancelled';
  createdAt: string;
}

export interface LeakageItem {
  subscription: Subscription;
  reason: 'trial_ending' | 'unused_zombie' | 'cancellation_deadline';
  urgency: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  daysRemainingOrUnused: number;
  potentialSavings: number; // Monthly equivalent
}
