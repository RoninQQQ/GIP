'use client';

import { useLanguage } from '@/lib/i18n';
import { Cpu, Search, Plus, Globe, DollarSign, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
}

export default function Header({ searchQuery, onSearchChange, onOpenCreateModal }: HeaderProps) {
  const { t, lang, setLang, currency, toggleCurrency } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-gray-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>{t.siteName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold tracking-wide">
                {t.previewBadge}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {t.siteTagline}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-9 py-2 rounded-full bg-gray-100 dark:bg-zinc-900 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-black text-sm text-gray-900 dark:text-white placeholder-gray-500 transition-all outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Currency Toggle */}
          <button 
            onClick={toggleCurrency}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title={t.priceToggle}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>{currency}</span>
          </button>

          {/* Language Toggle */}
          <button 
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">{lang === 'tr' ? 'TR' : 'EN'}</span>
          </button>

          {/* Post Listing Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">{t.postListing}</span>
          </button>

        </div>

      </div>
    </header>
  );
}
