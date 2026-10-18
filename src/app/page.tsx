'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ListingCard from '@/components/ListingCard';
import ListingModal from '@/components/ListingModal';
import CreateListingModal from '@/components/CreateListingModal';
import initialListingsData from '@/data/listings.json';
import { Listing, FilterState } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { Sparkles, FilterX } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { t } = useLanguage();

  // All listings (initial from JSON + user-created mock listings)
  const [listings, setListings] = useState<Listing[]>(initialListingsData as unknown as Listing[]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    search: '',
    condition: '',
    minPrice: null,
    maxPrice: null,
    location: '',
  });

  // Modal & Interactive states
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filter listings based on active filters
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }
      // Search filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesLocation = item.location.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesLocation) {
          return false;
        }
      }
      // Condition filter
      if (filters.condition && item.condition !== filters.condition) {
        return false;
      }
      // Location filter
      if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      // Min price filter
      if (filters.minPrice !== null && item.price.try < filters.minPrice) {
        return false;
      }
      // Max price filter
      if (filters.maxPrice !== null && item.price.try > filters.maxPrice) {
        return false;
      }
      return true;
    });
  }, [listings, filters]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [listings]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      search: '',
      condition: '',
      minPrice: null,
      maxPrice: null,
      location: '',
    });
  };

  const handleAddNewListing = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
    showToast(t.listingSuccess);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex flex-col">
      
      {/* Top Navigation with Preview Division */}
      <Header
        searchQuery={filters.search}
        onSearchChange={(q) => handleFilterChange({ search: q })}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* Left Panel / Sidebar */}
          <Sidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            categoryCounts={categoryCounts}
            totalCount={listings.length}
          />

          {/* Right Area: Listings Grid */}
          <div className="flex-1 w-full">
            
            {/* Feed Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  {filters.category === 'all' 
                    ? (t.siteTagline) 
                    : (t[filters.category as keyof typeof t] || t.allCategories)}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Toplam {filteredListings.length} ilan listeleniyor
                </p>
              </div>

              {/* Quick condition indicator */}
              {filters.condition && (
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                  {filters.condition}
                </span>
              )}
            </div>

            {/* Grid of 3 columns */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((item) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    onClick={() => setSelectedListing(item)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20 px-4 rounded-3xl bg-white dark:bg-zinc-900/50 border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center">
                <div className="p-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-400 mb-4">
                  <FilterX className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {t.noResults}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-5">
                  {t.resetSearch}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  {t.clearFilters}
                </button>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Listing Detail Modal */}
      <ListingModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onShowToast={showToast}
      />

      {/* Create Listing Modal (Preview Mode) */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleAddNewListing}
      />

      {/* Interactive Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-zinc-700 dark:border-zinc-200 text-sm font-semibold max-w-md"
          >
            <Sparkles className="w-4 h-4 text-blue-400 dark:text-blue-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
