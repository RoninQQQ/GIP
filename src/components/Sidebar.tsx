'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Category, FilterState } from '@/lib/types';
import { useLocations } from '@/lib/use-locations';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Cpu, 
  Layers, 
  Laptop, 
  Monitor, 
  HardDrive, 
  Database,
  Zap,
  Box,
  Fan,
  Keyboard,
  Wifi,
  Sparkles, 
  Heart,
  Tag,
  MapPin
} from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  favoritesCount?: number;
  myListingsCount?: number;
}

export default function Sidebar({
  filters,
  onFilterChange,
  onResetFilters,
  categoryCounts,
  totalCount,
  favoritesCount = 0,
  myListingsCount = 0
}: SidebarProps) {
  const { t } = useLanguage();

  const [selectedProvince, setSelectedProvince] = useState<string>(() => {
    if (!filters.location) return '';
    return filters.location.split('/')[0]?.trim() || '';
  });

  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    if (!filters.location || !filters.location.includes('/')) return '';
    return filters.location.split('/')[1]?.trim() || '';
  });

  const { provinces, districts } = useLocations(selectedProvince);

  const handleProvinceChange = (provinceName: string) => {
    setSelectedProvince(provinceName);
    setSelectedDistrict('');
    onFilterChange({ location: provinceName });
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    if (districtName) {
      onFilterChange({ location: `${selectedProvince} / ${districtName}` });
    } else {
      onFilterChange({ location: selectedProvince });
    }
  };

  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t.allCategories, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'gpu', label: t.gpu, icon: <Layers className="w-4 h-4" /> },
    { id: 'cpu', label: t.cpu, icon: <Cpu className="w-4 h-4" /> },
    { id: 'motherboard', label: t.motherboard, icon: <HardDrive className="w-4 h-4" /> },
    { id: 'ram', label: t.ram, icon: <HardDrive className="w-4 h-4" /> },
    { id: 'storage', label: t.storage, icon: <Database className="w-4 h-4" /> },
    { id: 'psu', label: t.psu, icon: <Zap className="w-4 h-4" /> },
    { id: 'case', label: t.case, icon: <Box className="w-4 h-4" /> },
    { id: 'cooler', label: t.cooler, icon: <Fan className="w-4 h-4" /> },
    { id: 'monitor', label: t.monitor, icon: <Monitor className="w-4 h-4" /> },
    { id: 'laptop', label: t.laptop, icon: <Laptop className="w-4 h-4" /> },
    { id: 'desktop', label: t.desktop, icon: <Box className="w-4 h-4" /> },
    { id: 'peripherals', label: t.peripherals, icon: <Keyboard className="w-4 h-4" /> },
    { id: 'network_sound', label: t.network_sound, icon: <Wifi className="w-4 h-4" /> },
  ];

  const conditions = [
    { id: '', label: t.allConditions },
    { id: 'Kutulu / Faturalı', label: t.boxed },
    { id: 'Temiz / İkinci El', label: t.cleanUsed },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4">
      
      {/* Quick Favorites Filter Button */}
      {favoritesCount > 0 && (
        <button
          onClick={() => onFilterChange({ onlyFavorites: !filters.onlyFavorites })}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-semibold transition-all shadow-sm ${
            filters.onlyFavorites
              ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
              : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:border-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className={`w-4 h-4 ${filters.onlyFavorites ? 'fill-current text-red-500' : 'text-gray-400'}`} />
            <span>{t.myFavorites}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            filters.onlyFavorites ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
          }`}>
            {favoritesCount}
          </span>
        </button>
      )}

      {/* Quick My Listings Filter Button */}
      {myListingsCount > 0 && (
        <button
          onClick={() => onFilterChange({ onlyMyListings: !filters.onlyMyListings })}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-semibold transition-all shadow-sm ${
            filters.onlyMyListings
              ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400'
              : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Tag className={`w-4 h-4 ${filters.onlyMyListings ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
            <span>{t.myListings}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            filters.onlyMyListings ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
          }`}>
            {myListingsCount}
          </span>
        </button>
      )}

      {/* Categories Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t.categories}
          </h2>
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        </div>

        <nav className="space-y-1">
          {categories.map((cat) => {
            const isActive = filters.category === cat.id;
            const count = cat.id === 'all' ? totalCount : (categoryCounts[cat.id] || 0);

            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ category: cat.id })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-blue-500'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filter Options Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-5">
        
        {/* Condition Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            {t.condition}
          </label>
          <div className="space-y-1.5">
            {conditions.map((cond) => (
              <label 
                key={cond.id} 
                className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 py-0.5"
              >
                <input
                  type="radio"
                  name="condition"
                  checked={filters.condition === cond.id}
                  onChange={() => onFilterChange({ condition: cond.id })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-zinc-700 rounded-full dark:bg-zinc-800"
                />
                <span>{cond.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Filter: Province -> District */}
        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t.location}
          </label>
          <div className="space-y-2">
            <select
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500"
            >
              <option value="" className="bg-white dark:bg-zinc-900">{t.allProvinces}</option>
              {provinces.map((loc) => (
                <option key={loc.id} value={loc.name} className="bg-white dark:bg-zinc-900">
                  {loc.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={!selectedProvince}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" className="bg-white dark:bg-zinc-900">{t.allDistricts}</option>
              {districts.map((dist) => (
                <option key={dist} value={dist} className="bg-white dark:bg-zinc-900">
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            {t.priceRange} (₺)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder={t.min}
              value={filters.minPrice ?? ''}
              onChange={(e) => onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder={t.max}
              value={filters.maxPrice ?? ''}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={() => {
            setSelectedProvince('');
            setSelectedDistrict('');
            onResetFilters();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-600 dark:text-gray-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.clearFilters}</span>
        </button>

      </div>

    </aside>
  );
}
