'use client';

import { Listing } from '@/lib/types';
import PriceDisplay from './PriceDisplay';
import { MapPin, Calendar, CheckCircle2, Heart, ShoppingBag, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/i18n';
import { basePath } from '@/lib/config';

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

export default function ListingCard({ listing, onClick, onDelete }: ListingCardProps) {
  const { user, isFavorite, toggleFavorite } = useAuth();
  const { isInCart, addToCart, openCart } = useCart();
  const { t } = useLanguage();

  const favorited = isFavorite(listing.id);
  const inCart = isInCart(listing.id);
  const isOwner = Boolean(user && (listing.id.startsWith('usr-') || listing.seller.name === user.name));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(listing.id);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCart) {
      openCart();
    } else {
      addToCart(listing);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(t.confirmDelete)) {
      onDelete(listing.id);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={listing.cover.startsWith('data:') || listing.cover.startsWith('http') ? listing.cover : `${basePath}${listing.cover}`}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Condition Badge (Top Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {listing.condition}
          </span>
        </div>

        {/* Favorite Button (Top Right) */}
        <div className="absolute top-3 right-3">
          <button
            onClick={handleFavoriteClick}
            aria-label={favorited ? t.removeFromFavorites : t.addToFavorites}
            className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-sm ${
              favorited 
                ? 'bg-red-500/90 text-white hover:bg-red-600 scale-105' 
                : 'bg-black/60 text-white hover:bg-black/80 hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Date Meta Row */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <div className="flex items-center gap-1 truncate max-w-[170px]">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{listing.date}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {listing.title}
          </h3>

          {/* Quick Specs chips if available */}
          {listing.specs && Object.keys(listing.specs).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {Object.entries(listing.specs).slice(0, 2).map(([key, val]) => (
                <span 
                  key={key}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300"
                >
                  {val}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Bar: Price on Left, Single-line Actions on Right */}
        <div className="pt-3.5 mt-3.5 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          {/* Prominent Price Display */}
          <PriceDisplay 
            usd={listing.price.usd} 
            tryPrice={listing.price.try} 
            className="font-black text-lg text-blue-600 dark:text-blue-400 tracking-tight"
          />

          {/* Actions: Delete (if owner) and Add to Cart */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isOwner && onDelete && (
              <button
                onClick={handleDeleteClick}
                title={t.deleteListing}
                className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleCartClick}
              title={inCart ? t.inCart : t.quickAddToCart}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all shadow-sm ${
                inCart
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.inCartBadge}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t.quickAddToCart}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
