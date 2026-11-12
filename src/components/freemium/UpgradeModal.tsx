import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Shield,
  Zap,
  Lock,
  Mail,
  Bell,
  Users,
  CreditCard,
} from 'lucide-react';
import { FREE_TIER_LIMIT, useSubscriptions } from '../../context/SubscriptionContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { activeCount } = useSubscriptions();
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  if (!isOpen) return null;

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail) {
      setJoinedWaitlist(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Banner with soft emerald background */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 text-emerald-100">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-300/30 text-[11px] font-semibold text-emerald-100 uppercase tracking-wider mb-2">
            Free Tier Limit Reached
          </div>

          <h3 className="text-2xl font-bold tracking-tight">
            Upgrade to MyBestSPA Pro
          </h3>
          <p className="text-emerald-100/90 text-xs mt-1 leading-relaxed">
            You&apos;ve reached the free tier limit of {FREE_TIER_LIMIT} active subscriptions ({activeCount} tracked).
            Unlock unlimited subscriptions and automated personal assistant channels.
          </p>
        </div>

        {/* Pro Plan Details & Comparison */}
        <div className="p-6 space-y-6">
          {/* Plan price banner */}
          <div className="flex items-baseline justify-between p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <div>
              <span className="font-bold text-slate-900 text-sm block">Pro Plan</span>
              <span className="text-xs text-slate-500">Billed annually or S$4.90/month</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl font-bold text-emerald-800 tabular-nums">
                S$3.90
              </span>
              <span className="text-xs text-emerald-700"> /month</span>
            </div>
          </div>

          {/* Perks list */}
          <div className="space-y-3 text-xs">
            <span className="font-semibold text-slate-900 block text-xs">
              Everything in Free, plus:
            </span>

            <div className="flex items-start gap-2.5 text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-slate-900 font-semibold">Unlimited Subscriptions</strong>
                <p className="text-slate-500 text-[11px]">
                  Track 20, 50, or 100+ services across software, gym, utilities, streaming, and deliveries.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-slate-900 font-semibold">WhatsApp & Telegram P.A. Alerts</strong>
                <p className="text-slate-500 text-[11px]">
                  Get direct chat notifications 3 days before renewal with one-tap cancellation advice.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-slate-900 font-semibold">Household & Family Sharing</strong>
                <p className="text-slate-500 text-[11px]">
                  Split costs and manage joint Netflix, Spotify Family, and utility accounts together.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-slate-900 font-semibold">Auto Bank Statement Sync</strong>
                <p className="text-slate-500 text-[11px]">
                  Automatically detect recurring merchant charges from DBS, OCBC, UOB, or GrabPay.
                </p>
              </div>
            </div>
          </div>

          {/* Action / Coming Soon Button */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            {!joinedWaitlist ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed border border-slate-200 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Coming soon</span>
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Payment gateway integration is currently in beta. Free tier includes up to {FREE_TIER_LIMIT} active subscriptions.
                </p>

                {/* VIP early access signup */}
                <form onSubmit={handleJoinWaitlist} className="flex gap-2 pt-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter email for Pro launch invite"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors shrink-0"
                  >
                    Notify Me
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <span className="font-semibold text-xs text-emerald-900 block">
                  🎉 You are on the Pro Priority List!
                </span>
                <p className="text-[11px] text-emerald-700">
                  We&apos;ll email <span className="font-medium">{waitlistEmail}</span> as soon as Pro tier opens.
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition-colors py-1 block"
            >
              Continue using Free Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
