'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  Star,
  CheckCircle2
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useState } from 'react';
import PriceDisplay from './PriceDisplay';
import { Listing } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

interface ListingModalProps {
  listing: Listing | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export default function ListingModal({ listing, onClose, onShowToast }: ListingModalProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const { t } = useLanguage();

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      setActivePhotoIdx(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      setActivePhotoIdx(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  if (!listing) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-200 dark:border-zinc-800 z-10"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                #{listing.id.toUpperCase()}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate max-w-md sm:max-w-xl">
                {listing.title}
              </h2>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <PriceDisplay usd={listing.price.usd} tryPrice={listing.price.try} />
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body: Scrollable */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Image Carousel (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Main Carousel */}
              <div className="relative group rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-950 aspect-[16/10] border border-gray-200 dark:border-zinc-800">
                <div className="overflow-hidden h-full" ref={emblaRef}>
                  <div className="flex h-full">
                    {listing.images.map((src, idx) => (
                      <div className="flex-[0_0_100%] min-w-0 h-full relative" key={idx}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={`${basePath}${src}`} 
                          alt={`${listing.title} - ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel Controls */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={scrollPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-90 transition-all backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={scrollNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-90 transition-all backdrop-blur-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Photo Counter */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
                  {listing.images.length} Fotoğraf
                </div>
              </div>

              {/* Thumbnail Strip */}
              {listing.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {listing.images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => emblaApi && emblaApi.scrollTo(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activePhotoIdx === idx 
                          ? 'border-blue-600 shadow-md scale-95' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`${basePath}${src}`} 
                        alt="thumb" 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Description Section */}
              <div className="pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  {t.description}
                </h3>
                <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
                  {listing.description}
                </p>
              </div>

            </div>

            {/* Right Column: Listing Details & Seller Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Pricing & Condition Card */}
              <div className="bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    {t.priceInput}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {listing.condition}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <PriceDisplay usd={listing.price.usd} tryPrice={listing.price.try} large />
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-zinc-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{listing.date}</span>
                  </div>
                </div>
              </div>

              {/* Seller Profile Card */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {listing.seller.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span>{listing.seller.name}</span>
                        <span title="Doğrulanmış Satıcı">
                          <ShieldCheck className="w-4 h-4 text-blue-500" />
                        </span>
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center text-amber-500 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                          <span>{listing.seller.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{listing.seller.dealsCount} {t.dealsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t.memberSince} {listing.seller.memberSince}
                </div>

                {/* Seller Contact Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onShowToast(`${listing.seller.name} için mesaj kutusu açıldı. (Önizleme Modu)`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t.sendMessage}</span>
                  </button>
                  <button
                    onClick={() => onShowToast(`Satıcı Tel: 0532 *** ** 12 (Önizleme Modu)`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{t.callSeller}</span>
                  </button>
                </div>
              </div>

              {/* Technical Specs List */}
              {listing.specs && Object.keys(listing.specs).length > 0 && (
                <div className="bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    {t.specs}
                  </h4>
                  <dl className="space-y-2 text-xs sm:text-sm">
                    {Object.entries(listing.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-gray-200/60 dark:border-zinc-700/40 last:border-0">
                        <dt className="text-gray-500 dark:text-gray-400 font-medium">{key}</dt>
                        <dd className="text-gray-900 dark:text-white font-semibold text-right">{val}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
