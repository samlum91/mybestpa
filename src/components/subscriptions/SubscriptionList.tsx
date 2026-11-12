import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  ArrowUpDown,
  Sparkles,
  X,
  Layers,
} from 'lucide-react';
import { Subscription, SubscriptionCategory, SubscriptionType, SubscriptionStatus } from '../../types/subscription';
import { useSubscriptions, FREE_TIER_LIMIT } from '../../context/SubscriptionContext';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionTable } from './SubscriptionTable';
import { getDaysUntil } from '../../utils/dateCalculations';

const CATEGORIES: Array<SubscriptionCategory | 'All'> = [
  'All',
  'Streaming',
  'Software',
  'Fitness',
  'News',
  'Utilities',
  'Physical Product',
  'Membership',
  'Other',
];

const TYPES: Array<SubscriptionType | 'All'> = ['All', 'Digital', 'Physical', 'Contract'];

const STATUSES: Array<SubscriptionStatus | 'All'> = ['All', 'Active', 'Paused', 'Cancelled'];

type SortOption =
  | 'renewal_soonest'
  | 'cost_desc'
  | 'cost_asc'
  | 'name_asc'
  | 'last_used_oldest';

export const SubscriptionList: React.FC = () => {
  const {
    subscriptions,
    activeCount,
    openAddModal,
    openEditModal,
    deleteSubscription,
    toggleStatus,
    logUsageToday,
    setDetailModal,
    setUpgradeModalOpen,
  } = useSubscriptions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubscriptionCategory | 'All'>('All');
  const [selectedType, setSelectedType] = useState<SubscriptionType | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<SubscriptionStatus | 'All'>('All');
  const [quickFilter, setQuickFilter] = useState<'all' | 'renewing_soon' | 'trial' | 'unused' | 'physical_contract'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('renewal_soonest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter & sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = sub.name.toLowerCase().includes(q);
          const matchMethod = (sub.paymentMethod || '').toLowerCase().includes(q);
          const matchCategory = sub.category.toLowerCase().includes(q);
          const matchNotes = (sub.cancellationNotes || '').toLowerCase().includes(q);
          if (!matchName && !matchMethod && !matchCategory && !matchNotes) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && sub.category !== selectedCategory) {
          return false;
        }

        // Type filter
        if (selectedType !== 'All' && sub.type !== selectedType) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'All' && sub.status !== selectedStatus) {
          return false;
        }

        // Quick filter
        if (quickFilter === 'renewing_soon') {
          const days = getDaysUntil(sub.nextRenewalDate);
          if (sub.status !== 'Active' || days < 0 || days > 7) return false;
        } else if (quickFilter === 'trial') {
          if (!sub.isTrial) return false;
        } else if (quickFilter === 'unused') {
          if (!sub.lastUsedDate || getDaysUntil(sub.lastUsedDate) > -30) return false;
        } else if (quickFilter === 'physical_contract') {
          if (sub.type === 'Digital') return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'renewal_soonest': {
            const daysA = getDaysUntil(a.nextRenewalDate);
            const daysB = getDaysUntil(b.nextRenewalDate);
            return daysA - daysB;
          }
          case 'cost_desc':
            return b.cost - a.cost;
          case 'cost_asc':
            return a.cost - b.cost;
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'last_used_oldest': {
            const dateA = a.lastUsedDate ? new Date(a.lastUsedDate).getTime() : 0;
            const dateB = b.lastUsedDate ? new Date(b.lastUsedDate).getTime() : 0;
            return dateA - dateB;
          }
          default:
            return 0;
        }
      });
  }, [
    subscriptions,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedStatus,
    quickFilter,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'All' ||
    selectedType !== 'All' ||
    selectedStatus !== 'All' ||
    quickFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedStatus('All');
    setQuickFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Subscriptions Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Managing {subscriptions.length} recurring expenses ({activeCount} active · {FREE_TIER_LIMIT - activeCount} free slots remaining)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-200/60 p-1 rounded-xl text-slate-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
              title="Grid card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
              title="Compact table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-700/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Live Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, bank card, category, notes..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  Type: {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
            >
              <option value="renewal_soonest">Renewal: Soonest</option>
              <option value="cost_desc">Cost: High to Low</option>
              <option value="cost_asc">Cost: Low to High</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="last_used_oldest">Last Used: Oldest</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Segmented Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Quick:</span>
            <button
              onClick={() => setQuickFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                quickFilter === 'all'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({subscriptions.length})
            </button>
            <button
              onClick={() => setQuickFilter('renewing_soon')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                quickFilter === 'renewing_soon'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Renewing Soon (&le;7d)
            </button>
            <button
              onClick={() => setQuickFilter('trial')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                quickFilter === 'trial'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Free Trials
            </button>
            <button
              onClick={() => setQuickFilter('unused')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                quickFilter === 'unused'
                  ? 'bg-rose-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unused (&gt;30d)
            </button>
            <button
              onClick={() => setQuickFilter('physical_contract')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                quickFilter === 'physical_contract'
                  ? 'bg-emerald-700 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Physical / Contracts
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content View (Grid or Table) */}
      {filteredSubscriptions.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            No subscriptions found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search criteria, or add your recurring expense.
          </p>
          <div className="flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            )}
            <button
              onClick={openAddModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Add New Subscription
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={openEditModal}
              onDelete={deleteSubscription}
              onToggleStatus={toggleStatus}
              onLogUsage={logUsageToday}
              onViewDetails={setDetailModal}
            />
          ))}
        </div>
      ) : (
        <SubscriptionTable
          subscriptions={filteredSubscriptions}
          onEdit={openEditModal}
          onDelete={deleteSubscription}
          onToggleStatus={toggleStatus}
          onLogUsage={logUsageToday}
          onViewDetails={setDetailModal}
        />
      )}
    </div>
  );
};
