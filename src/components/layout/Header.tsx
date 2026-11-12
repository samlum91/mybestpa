import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Plus,
  ShieldAlert,
  Sparkles,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useSubscriptions, FREE_TIER_LIMIT } from '../../context/SubscriptionContext';

interface HeaderProps {
  currentTab: 'dashboard' | 'subscriptions' | 'alerts' | 'leakage';
  onSelectTab: (tab: 'dashboard' | 'subscriptions' | 'alerts' | 'leakage') => void;
  onOpenDataModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenDataModal,
}) => {
  const {
    unreadNotifCount,
    activeCount,
    openAddModal,
    setUpgradeModalOpen,
  } = useSubscriptions();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Wordmark (1 line, single element) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  MyBestSPA
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 uppercase tracking-wider">
                    P.A.
                  </span>
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean single-line links with hover/active states) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onSelectTab('subscriptions')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                currentTab === 'subscriptions'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => onSelectTab('leakage')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                currentTab === 'leakage'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Leakage Radar</span>
            </button>
            <button
              onClick={() => onSelectTab('alerts')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                currentTab === 'alerts'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Alerts</span>
              {unreadNotifCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
                  {unreadNotifCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Actions (Free Tier Counter, Alert Bell, Add Subscription) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Free Tier indicator */}
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 bg-stone-100/80 hover:bg-emerald-50/70 border border-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Click to view Pro features"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="tabular-nums font-medium text-slate-700">
                {activeCount}/{FREE_TIER_LIMIT} Free Active
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase">
                Free
              </span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => onSelectTab('alerts')}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-emerald-500"
              aria-label={`Notifications (${unreadNotifCount} unread)`}
              title="Assistant Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Data backup button */}
            <button
              onClick={onOpenDataModal}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex"
              title="Backup, export, or reset demo data"
              aria-label="Backup & Data Options"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm shadow-emerald-700/20 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subscription</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-2 no-scrollbar text-xs font-medium">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              currentTab === 'dashboard' ? 'bg-emerald-100 text-emerald-900 font-semibold' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('subscriptions')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              currentTab === 'subscriptions' ? 'bg-emerald-100 text-emerald-900 font-semibold' : 'text-slate-600'
            }`}
          >
            Subscriptions ({activeCount})
          </button>
          <button
            onClick={() => onSelectTab('leakage')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1 ${
              currentTab === 'leakage' ? 'bg-emerald-100 text-emerald-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Leakage</span>
          </button>
          <button
            onClick={() => onSelectTab('alerts')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1 ${
              currentTab === 'alerts' ? 'bg-emerald-100 text-emerald-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <span>Alerts</span>
            {unreadNotifCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
