'use client';

import { Listing } from '@/lib/types';
import PriceDisplay from './PriceDisplay';
import { MapPin, Calendar, CheckCircle2 } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
}

export default function ListingCard({ listing, onClick }: ListingCardProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={`${basePath}${listing.cover}`}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Condition Badge (Top Left) */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {listing.condition}
          </span>
        </div>

        {/* Price Tag (Top Right) */}
        <div className="absolute top-3 right-3">
          <PriceDisplay usd={listing.price.usd} tryPrice={listing.price.try} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
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

        {/* Footer Meta */}
        <div className="pt-3 mt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1 truncate max-w-[150px]">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{listing.date}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
