'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ListingCard from '@/components/ListingCard';
import ListingModal from '@/components/ListingModal';
import CreateListingModal from '@/components/CreateListingModal';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import OrdersModal from '@/components/OrdersModal';
import initialListingsData from '@/data/listings.json';
import { Listing, FilterState, SortOption } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { isPreviewMode } from '@/lib/config';
import { Sparkles, FilterX, Heart, Tag, ArrowUpDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const CUSTOM_LISTINGS_KEY = 'dp_custom_listings';

const PRODUCTION_TEST_LISTING: Listing = {
  id: 'test-item-1',
  title: 'Test İlanı — Örnek Donanım Ürünü (Test Amaçlıdır)',
  category: 'gpu',
  price: {
    try: 12500,
    usd: 360,
  },
  location: 'İstanbul / Kadıköy',
  condition: 'Kutulu / Faturalı',
  date: 'Bugün',
  cover: '/images/listings/test-item/cover.svg',
  images: [
    '/images/listings/test-item/cover.svg'
  ],
  description: 'Bu ilan gerçek çalışma ortamında sistem ve sepet akışını test etmek için oluşturulmuş örnek bir test ilanıdır.',
  specs: {
    'Durum': 'Kutulu / Faturalı',
    'Garanti': '1 Yıl Kalan',
    'Kargo': 'Ücretsiz Kargo',
  },
  seller: {
    name: 'Test Satıcısı',
    rating: 5.0,
    dealsCount: 1,
    memberSince: '2024',
    verified: true,
  },
};

const defaultBaseListings: Listing[] = isPreviewMode
  ? (initialListingsData as unknown as Listing[])
  : [];

export default function Home() {
  const { t } = useLanguage();
  const { user, isFavorite } = useAuth();

  // All listings state
  const [listings, setListings] = useState<Listing[]>(defaultBaseListings);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    search: '',
    condition: '',
    minPrice: null,
    maxPrice: null,
    location: '',
    onlyFavorites: false,
    onlyMyListings: false,
    sortBy: 'default',
  });

  // Modal & Interactive states
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load listings from API or local fallback
  useEffect(() => {
    let isMounted = true;
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const isTestUser = Boolean(user && user.isTestAccount && isLocalhost);

    if (isPreviewMode) {
      try {
        const stored = localStorage.getItem(CUSTOM_LISTINGS_KEY);
        const customList: Listing[] = stored ? JSON.parse(stored) : [];
        if (isMounted) {
          setListings([...customList, ...(initialListingsData as unknown as Listing[])]);
        }
      } catch {
        if (isMounted) {
          setListings(initialListingsData as unknown as Listing[]);
        }
      }
      return;
    }

    // In real mode, fetch solely from SQL /api/listings (Single Source of Truth)
    async function fetchListings() {
      try {
        const res = await fetch(`/api/listings?isTestUser=${isTestUser ? 'true' : 'false'}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.listings) && isMounted) {
            setListings(data.listings);
            return;
          }
        }
      } catch (err) {
        console.warn('API listings fetch failed', err);
      }
    }

    fetchListings();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCreateListingSubmit = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
    if (isPreviewMode) {
      try {
        const stored = localStorage.getItem(CUSTOM_LISTINGS_KEY);
        const existing: Listing[] = stored ? JSON.parse(stored) : [];
        localStorage.setItem(CUSTOM_LISTINGS_KEY, JSON.stringify([newListing, ...existing]));
      } catch (e) {
        console.error('Failed to save custom listing to localStorage', e);
      }
    }
    showToast(t.listingSuccess);
  };

  const handleDeleteListing = async (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    if (!isPreviewMode) {
      try {
        await fetch(`/api/listings?id=${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to delete listing from API', e);
      }
    } else {
      try {
        const stored = localStorage.getItem(CUSTOM_LISTINGS_KEY);
        if (stored) {
          const existing: Listing[] = JSON.parse(stored);
          const updated = existing.filter((item) => item.id !== id);
          localStorage.setItem(CUSTOM_LISTINGS_KEY, JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Failed to delete custom listing from localStorage', e);
      }
    }
    if (selectedListing?.id === id) {
      setSelectedListing(null);
    }
    showToast(t.listingDeleted);
  };

  // My listings count
  const myListingsCount = useMemo(() => {
    if (!user) return 0;
    return listings.filter((item) => item.id.startsWith('usr-') || item.seller.name === user.name).length;
  }, [listings, user]);

  // Filter listings based on active filters
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Only favorites filter
      if (filters.onlyFavorites && !isFavorite(item.id)) {
        return false;
      }
      // Only my listings filter
      if (filters.onlyMyListings && user) {
        const isOwn = item.id.startsWith('usr-') || item.seller.name === user.name;
        if (!isOwn) return false;
      }
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
  }, [listings, filters, isFavorite, user]);

  // Apply sorting
  const sortedListings = useMemo(() => {
    const list = [...filteredListings];
    if (filters.sortBy === 'price_asc') {
      list.sort((a, b) => a.price.try - b.price.try);
    } else if (filters.sortBy === 'price_desc') {
      list.sort((a, b) => b.price.try - a.price.try);
    }
    return list;
  }, [filteredListings, filters.sortBy]);

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
      onlyFavorites: false,
      onlyMyListings: false,
      sortBy: 'default',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex flex-col">
      
      {/* Top Navigation */}
      <Header
        searchQuery={filters.search}
        onSearchChange={(q) => handleFilterChange({ search: q })}
        onOpenCreateListing={() => setIsCreateListingOpen(true)}
        onlyFavorites={filters.onlyFavorites}
        onToggleFavorites={() => handleFilterChange({ onlyFavorites: !filters.onlyFavorites, onlyMyListings: false })}
        onlyMyListings={filters.onlyMyListings}
        onToggleMyListings={() => handleFilterChange({ onlyMyListings: !filters.onlyMyListings, onlyFavorites: false })}
        myListingsCount={myListingsCount}
      />

      {/* Main Body */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* Left Panel / Sidebar */}
          <Sidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            categoryCounts={categoryCounts}
            totalCount={listings.length}
            favoritesCount={user?.favorites?.length || 0}
            myListingsCount={myListingsCount}
          />

          {/* Right Area: Listings Grid */}
          <div className="flex-1 w-full">
            
            {/* Feed Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  <span>
                    {filters.onlyFavorites
                      ? t.myFavorites
                      : filters.onlyMyListings
                      ? t.myListings
                      : filters.category === 'all' 
                      ? t.siteTagline 
                      : (t[filters.category as keyof typeof t] || t.allCategories)}
                  </span>
                  {filters.onlyFavorites && (
                    <Heart className="w-5 h-5 fill-current text-red-500" />
                  )}
                  {filters.onlyMyListings && (
                    <Tag className="w-5 h-5 text-blue-500" />
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t.totalListingsText.replace('{count}', String(sortedListings.length))}
                </p>
              </div>

              {/* Sorting and quick indicators */}
              <div className="flex items-center gap-3 shrink-0">
                {filters.condition && (
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium hidden sm:inline">
                    {filters.condition}
                  </span>
                )}

                {/* Sorting Select Dropdown */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <select
                    value={filters.sortBy || 'default'}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as SortOption })}
                    className="bg-transparent text-gray-800 dark:text-gray-200 font-semibold outline-none cursor-pointer pr-1"
                  >
                    <option value="default" className="bg-white dark:bg-zinc-900">
                      {t.sortDefault}
                    </option>
                    <option value="price_asc" className="bg-white dark:bg-zinc-900">
                      {t.sortPriceAsc}
                    </option>
                    <option value="price_desc" className="bg-white dark:bg-zinc-900">
                      {t.sortPriceDesc}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid of columns */}
            {sortedListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {sortedListings.map((item) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    onClick={() => setSelectedListing(item)}
                    onDelete={handleDeleteListing}
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
        onDeleteListing={handleDeleteListing}
      />

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onSubmit={handleCreateListingSubmit}
      />

      {/* Authentication Modal */}
      <AuthModal />

      {/* Cart & Checkout Drawer */}
      <CartDrawer />

      {/* Orders History & Escrow Modal */}
      <OrdersModal onShowToast={showToast} />

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
