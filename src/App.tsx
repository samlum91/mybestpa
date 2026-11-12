import React, { useState } from 'react';
import {
  SubscriptionProvider,
  useSubscriptions,
} from './context/SubscriptionContext';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { SubscriptionList } from './components/subscriptions/SubscriptionList';
import { NotificationCenter } from './components/layout/NotificationCenter';
import { LeakageView } from './components/leakage/LeakageView';
import { SubscriptionFormModal } from './components/subscriptions/SubscriptionFormModal';
import { SubscriptionDetailModal } from './components/subscriptions/SubscriptionDetailModal';
import { UpgradeModal } from './components/freemium/UpgradeModal';
import { DataManagementModal } from './components/backup/DataManagementModal';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'subscriptions' | 'alerts' | 'leakage'>('dashboard');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  const {
    isFormModalOpen,
    subscriptionToEdit,
    closeFormModal,
    addSubscription,
    updateSubscription,
    selectedSubscriptionForDetail,
    setDetailModal,
    deleteSubscription,
    toggleStatus,
    logUsageToday,
    openEditModal,
    isUpgradeModalOpen,
    setUpgradeModalOpen,
  } = useSubscriptions();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf8] text-slate-800">
      {/* Top Header conforming to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            onNavigateToSubscriptions={() => setCurrentTab('subscriptions')}
            onNavigateToLeakage={() => setCurrentTab('leakage')}
          />
        )}

        {currentTab === 'subscriptions' && <SubscriptionList />}

        {currentTab === 'alerts' && <NotificationCenter />}

        {currentTab === 'leakage' && <LeakageView />}
      </main>

      {/* Modals */}
      <SubscriptionFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onSubmit={(data) => {
          if (subscriptionToEdit) {
            updateSubscription({
              ...data,
              id: subscriptionToEdit.id,
              createdAt: subscriptionToEdit.createdAt,
              updatedAt: new Date().toISOString(),
            });
          } else {
            addSubscription(data);
          }
        }}
        initialData={subscriptionToEdit}
      />

      <SubscriptionDetailModal
        subscription={selectedSubscriptionForDetail}
        onClose={() => setDetailModal(null)}
        onEdit={(sub) => {
          setDetailModal(null);
          openEditModal(sub);
        }}
        onDelete={(id) => {
          deleteSubscription(id);
          setDetailModal(null);
        }}
        onToggleStatus={toggleStatus}
        onLogUsage={logUsageToday}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />

      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />

      {/* Quiet, Clean Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">MyBestSPA</span>
            <span>·</span>
            <span>Subscription Personal Assistant</span>
            <span>·</span>
            <span>Online & Offline Expense Tracking</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="hover:text-emerald-700 transition-colors"
            >
              Export / Import Data
            </button>
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="hover:text-emerald-700 transition-colors"
            >
              Freemium Details
            </button>
            <span>SGD Default Currency</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SubscriptionProvider>
      <AppContent />
    </SubscriptionProvider>
  );
}
