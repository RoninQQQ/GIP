'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { isPreviewMode } from '@/lib/config';
import { 
  Cpu, 
  Search, 
  Globe, 
  DollarSign, 
  X, 
  ExternalLink, 
  ShoppingBag, 
  Plus, 
  User as UserIcon, 
  LogOut, 
  Heart, 
  ShieldCheck, 
  ChevronDown, 
  Lock,
  Sun,
  Moon,
  Package,
  Tag
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateListing?: () => void;
  onlyFavorites?: boolean;
  onToggleFavorites?: () => void;
  onlyMyListings?: boolean;
  onToggleMyListings?: () => void;
  myListingsCount?: number;
}

export default function Header({ 
  searchQuery, 
  onSearchChange,
  onOpenCreateListing,
  onlyFavorites = false,
  onToggleFavorites,
  onlyMyListings = false,
  onToggleMyListings,
  myListingsCount
}: HeaderProps) {
  const { t, lang, setLang, currency, toggleCurrency } = useLanguage();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { openCart, itemCount, openOrdersModal, orderCount } = useCart();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync theme on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const isNowDark = document.documentElement.classList.toggle('dark');
    setIsDark(isNowDark);
    try {
      localStorage.setItem('dp_theme', isNowDark ? 'dark' : 'light');
    } catch (_) {}
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePostListingClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (onOpenCreateListing) {
      onOpenCreateListing();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-gray-200 dark:border-zinc-800 transition-colors shadow-sm">
      
      {/* Top Header Division: Sadece Önizleme Modunda Gösterilir */}
      {isPreviewMode && (
        <div className="bg-zinc-950 text-zinc-300 border-b border-zinc-800/80 text-xs py-2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="font-bold text-white tracking-wide flex items-center gap-2">
                <span className="text-xs sm:text-sm">{t.topBarTitle}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-emerald-400 border border-zinc-700 font-mono font-normal hidden sm:inline">
                  Live Preview
                </span>
              </div>
              <span className="hidden md:inline text-zinc-600">•</span>
              <span className="hidden md:inline text-zinc-400 text-xs">
                {t.topBarDesc}
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a 
                href="https://github.com/RoninQQQ/GIP" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors bg-zinc-800/90 hover:bg-zinc-700 px-2.5 py-1 rounded-md font-medium text-[11px] border border-zinc-700/60"
              >
                <ExternalLink className="w-3 h-3 text-blue-400" />
                <span>{t.repoLink}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>{t.siteName}</span>
              {/* Only show Preview Badge when in preview mode */}
              {isPreviewMode && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold tracking-wide">
                  {t.previewBadge}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {t.siteTagline}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-1 sm:mx-2">
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
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

          {/* Post Listing Button */}
          <button
            onClick={handlePostListingClick}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.postListing}</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center p-2 rounded-full border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title={t.cart}
          >
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </button>

          {/* Currency Toggle */}
          <button 
            onClick={toggleCurrency}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title={t.priceToggle}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>{currency}</span>
          </button>

          {/* Language Toggle */}
          <button 
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">{lang === 'tr' ? 'TR' : 'EN'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-full border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title={isDark ? t.themeLight : t.themeDark}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-blue-500" />
            )}
          </button>

          {/* User Account / Auth Section */}
          {!isAuthenticated ? (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-semibold transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t.login}</span>
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white max-w-[90px] sm:max-w-[120px] truncate hidden sm:inline">
                  {user?.name}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl p-2 z-50 text-xs space-y-1">
                  {/* User Profile Header */}
                  <div className="px-3 py-2.5 border-b border-gray-100 dark:border-zinc-800">
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>{user?.name}</span>
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-gray-500 text-[11px] truncate mt-0.5">
                      {user?.email}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                      <span>⭐ {user?.rating}</span>
                      <span>•</span>
                      <span>{user?.dealsCount} {t.dealsCount}</span>
                    </div>
                  </div>

                  {/* Favorites Filter Switch */}
                  {onToggleFavorites && (
                    <button
                      onClick={() => {
                        onToggleFavorites();
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                        onlyFavorites 
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                        <span>{t.myFavorites}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                        {user?.favorites?.length || 0}
                      </span>
                    </button>
                  )}

                  {/* My Orders Button */}
                  <button
                    onClick={() => {
                      openOrdersModal();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-500" />
                      <span>{t.myOrders}</span>
                    </div>
                    {orderCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                        {orderCount}
                      </span>
                    )}
                  </button>

                  {/* My Listings Filter */}
                  {onToggleMyListings && (
                    <button
                      onClick={() => {
                        onToggleMyListings();
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                        onlyMyListings 
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-indigo-500" />
                        <span>{t.myListings}</span>
                      </div>
                      {myListingsCount !== undefined && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                          {myListingsCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Create Listing Shortcut */}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenCreateListing) onOpenCreateListing();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-blue-500" />
                    <span>{t.postListing}</span>
                  </button>

                  {/* Logout Button */}
                  <div className="pt-1 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
