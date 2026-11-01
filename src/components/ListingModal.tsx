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
  CheckCircle2,
  Heart,
  ShoppingBag,
  Check,
  Lock,
  Tag,
  Sparkles,
  Trash2,
  Send
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useState } from 'react';
import PriceDisplay from './PriceDisplay';
import { Listing } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { basePath } from '@/lib/config';

interface ListingModalProps {
  listing: Listing | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onDeleteListing?: (id: string) => void;
}

export default function ListingModal({ listing, onClose, onShowToast, onDeleteListing }: ListingModalProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showOfferBox, setShowOfferBox] = useState(false);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  const { t } = useLanguage();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const { isInCart, addToCart, openCart } = useCart();

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

  const favorited = listing ? isFavorite(listing.id) : false;
  const inCart = listing ? isInCart(listing.id) : false;
  const isOwner = Boolean(listing && user && (listing.id.startsWith('usr-') || listing.seller.name === user.name));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!listing) return;
    const nowFavorited = toggleFavorite(listing.id);
    onShowToast(nowFavorited ? t.favoriteAdded : t.favoriteRemoved);
  };

  const handleCartAction = () => {
    if (!listing) return;
    if (inCart) {
      openCart();
    } else {
      addToCart(listing);
      onShowToast(t.addedToCart);
    }
  };

  const handleOpenOffer = () => {
    if (!listing) return;
    if (!showOfferBox) {
      setOfferAmount(Math.round(listing.price.try * 0.9));
    }
    setShowOfferBox(!showOfferBox);
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    if (!offerAmount || offerAmount <= 0) {
      onShowToast(t.invalidOffer);
      return;
    }

    setOfferSubmitting(true);
    setTimeout(() => {
      const discountedUsd = Math.round(offerAmount / 34.5);
      const discountedListing: Listing = {
        ...listing,
        price: {
          try: offerAmount,
          usd: discountedUsd,
        },
      };

      addToCart(discountedListing);
      onShowToast(t.offerAccepted);
      setOfferSubmitting(false);
      setShowOfferBox(false);
    }, 600);
  };

  const handleDelete = () => {
    if (listing && onDeleteListing && confirm(t.confirmDelete)) {
      onDeleteListing(listing.id);
      onClose();
    }
  };

  const discount5 = listing ? Math.round(listing.price.try * 0.95) : 0;
  const discount10 = listing ? Math.round(listing.price.try * 0.9) : 0;

  return (
    <AnimatePresence>
      {listing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transform-gpu"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-200 dark:border-zinc-800 z-10 transform-gpu"
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
            
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <PriceDisplay usd={listing.price.usd} tryPrice={listing.price.try} />

              {/* Owner Delete Button */}
              {isOwner && onDeleteListing && (
                <button
                  onClick={handleDelete}
                  title={t.deleteListing}
                  className="p-2 rounded-full border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Favorite Button */}
              <button
                onClick={handleFavoriteClick}
                title={favorited ? t.removeFromFavorites : t.addToFavorites}
                className={`p-2 rounded-full border transition-colors ${
                  favorited
                    ? 'border-red-200 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                    : 'border-gray-200 dark:border-zinc-800 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
              </button>

              {/* Close Button */}
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
                          src={src.startsWith('data:') || src.startsWith('http') ? src : `${basePath}${src}`} 
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
                  {t.photosCount.replace('{count}', String(listing.images.length))}
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
                        src={src.startsWith('data:') || src.startsWith('http') ? src : `${basePath}${src}`} 
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

              {/* Primary Actions: Cart & Offer */}
              <div className="space-y-2.5">
                {/* Add to Cart Button */}
                <button
                  onClick={handleCartAction}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-sm shadow-lg transition-all ${
                    inCart
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/25 hover:scale-[1.01]'
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t.inCart}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t.addToCart}</span>
                    </>
                  )}
                </button>

                {/* Make an Offer Button */}
                <button
                  onClick={handleOpenOffer}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{showOfferBox ? t.closeOffer : t.makeOffer}</span>
                </button>

                {/* Offer Interactive Box */}
                <AnimatePresence>
                  {showOfferBox && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleSendOffer}
                      className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-zinc-800/70 border border-indigo-200/80 dark:border-zinc-700 space-y-3 overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Hızlı Teklif Seçenekleri</span>
                        </span>
                      </div>

                      {/* Quick Chips */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setOfferAmount(discount5)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                            offerAmount === discount5
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:border-indigo-400'
                          }`}
                        >
                          <div className="text-[10px] opacity-80">{t.quickOffer5}</div>
                          <div>{discount5.toLocaleString('tr-TR')} ₺</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOfferAmount(discount10)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                            offerAmount === discount10
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:border-indigo-400'
                          }`}
                        >
                          <div className="text-[10px] opacity-80">{t.quickOffer10}</div>
                          <div>{discount10.toLocaleString('tr-TR')} ₺</div>
                        </button>
                      </div>

                      {/* Custom Amount Input */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          {t.customOffer}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min={1}
                            max={listing.price.try}
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Submit Offer Button */}
                      <button
                        type="submit"
                        disabled={offerSubmitting}
                        className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{offerSubmitting ? t.processing : t.sendOffer}</span>
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
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
                        <span title={t.verifiedSeller}>
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
                    onClick={() => onShowToast(`${listing.seller.name} için mesaj kutusu açıldı. (Güvenli Mesajlaşma)`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>{t.sendMessage}</span>
                  </button>
                  <button
                    onClick={() => onShowToast(`Satıcı Tel: 0532 *** ** 12 (Güvenli Arama Koruması)`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-500" />
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
      )}
    </AnimatePresence>
  );
}
