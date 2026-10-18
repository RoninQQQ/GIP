'use client';

import { useLanguage } from '@/lib/i18n';
import { Category, FilterState } from '@/lib/types';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Cpu, 
  Layers, 
  Laptop, 
  Monitor, 
  Smartphone, 
  HardDrive,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export default function Sidebar({
  filters,
  onFilterChange,
  onResetFilters,
  categoryCounts,
  totalCount
}: SidebarProps) {
  const { t } = useLanguage();

  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t.allCategories, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'gpu', label: t.gpu, icon: <Layers className="w-4 h-4" /> },
    { id: 'cpu', label: t.cpu, icon: <Cpu className="w-4 h-4" /> },
    { id: 'motherboard', label: t.motherboard, icon: <HardDrive className="w-4 h-4" /> },
    { id: 'ram', label: t.ram, icon: <HardDrive className="w-4 h-4" /> },
    { id: 'laptop', label: t.laptop, icon: <Laptop className="w-4 h-4" /> },
    { id: 'monitor', label: t.monitor, icon: <Monitor className="w-4 h-4" /> },
    { id: 'phone', label: t.phone, icon: <Smartphone className="w-4 h-4" /> },
  ];

  const conditions = [
    { id: '', label: t.allConditions },
    { id: 'Kutulu / Faturalı', label: t.boxed },
    { id: 'Temiz / İkinci El', label: t.cleanUsed },
  ];

  const locations = [
    { id: '', label: t.allLocations },
    { id: 'İstanbul', label: 'İstanbul' },
    { id: 'Ankara', label: 'Ankara' },
    { id: 'İzmir', label: 'İzmir' },
    { id: 'Bursa', label: 'Bursa' },
    { id: 'Kocaeli', label: 'Kocaeli' },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      
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

        {/* Location Filter */}
        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            {t.location}
          </label>
          <select
            value={filters.location}
            onChange={(e) => onFilterChange({ location: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-white dark:bg-zinc-900">
                {loc.label}
              </option>
            ))}
          </select>
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
          onClick={onResetFilters}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-600 dark:text-gray-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.clearFilters}</span>
        </button>

      </div>

    </aside>
  );
}
