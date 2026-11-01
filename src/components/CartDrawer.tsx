'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  ChevronLeft,
  MapPin,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import { basePath } from '@/lib/config';
import { useLocations } from '@/lib/use-locations';

export default function CartDrawer() {
  const { 
    isCartOpen, 
    closeCart, 
    items, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    buyerProtectionFee, 
    total
  } = useCart();
  
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { t, currency } = useLanguage();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [province, setProvince] = useState(() => user?.province || 'İstanbul');
  const [district, setDistrict] = useState(() => user?.district || 'Kadıköy');
  const [addressDetail, setAddressDetail] = useState('Caferağa Mah. Moda Cad. No: 42');
  const [gatewayError, setGatewayError] = useState(false);

  const { provinces, districts } = useLocations(province);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    setDistrict('');
  };

  const handleClose = () => {
    closeCart();
    setStep('cart');
    setGatewayError(false);
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      closeCart();
      try {
        sessionStorage.setItem('dp_pending_checkout', 'true');
      } catch (_) {}
      openAuthModal('login');
      return;
    }
    setStep('checkout');
    setGatewayError(false);
  };

  const handleAttemptPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Real gateway unconfigured error
    setGatewayError(true);
  };

  const formatPrice = (val: { try: number; usd: number }) => {
    if (currency === 'USD') {
      return `$${val.usd.toLocaleString('en-US')}`;
    }
    return `${val.try.toLocaleString('tr-TR')} ₺`;
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transform-gpu"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between transform-gpu"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {step === 'checkout' && (
                    <button
                      onClick={() => {
                        setStep('cart');
                        setGatewayError(false);
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors mr-1"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{step === 'checkout' ? t.checkoutTitle : t.cart}</span>
                      {step === 'cart' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                          {items.length}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {t.siteName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* VIEW 1: CART ITEMS */}
                {step === 'cart' && (
                  <>
                    {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center mb-4">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                          {t.cartEmpty}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-6">
                          {t.cartEmptyDesc}
                        </p>
                        <button
                          onClick={handleClose}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                        >
                          {t.close}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/80 dark:border-zinc-800 flex gap-3.5 relative group"
                          >
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-zinc-800 shrink-0 border border-gray-200 dark:border-zinc-700">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.cover.startsWith('data:') || item.cover.startsWith('http') ? item.cover : `${basePath}${item.cover}`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                                  {item.title}
                                </h4>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                                  <span>{item.condition}</span>
                                  <span>•</span>
                                  <span className="text-blue-600 dark:text-blue-400">{item.seller.name}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <span className="font-black text-sm text-gray-900 dark:text-white">
                                  {formatPrice(item.price)}
                                </span>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                  title={t.removeFromCart}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* VIEW 2: CHECKOUT STEP */}
                {step === 'checkout' && (
                  <form id="checkout-form" onSubmit={handleAttemptPayment} className="space-y-5">
                    {/* Delivery Address Form with Province -> District */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{t.deliveryAddress}</span>
                      </label>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            {t.province}
                          </label>
                          <select
                            value={province}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                          >
                            {provinces.map((loc) => (
                              <option key={loc.id} value={loc.name}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            {t.district}
                          </label>
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                          >
                            <option value="">{t.selectDistrict || 'İlçe Seçiniz'}</option>
                            {districts.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                          {t.addressDetail}
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={addressDetail}
                          onChange={(e) => {
                            setAddressDetail(e.target.value);
                            setGatewayError(false);
                          }}
                          placeholder={t.addressPlaceholder}
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Real Payment Gateway Warning Box */}
                    {gatewayError && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2 text-left"
                      >
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm">
                          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>{t.errPaymentGatewayTitle}</span>
                        </div>
                        <div className="inline-block px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 font-mono text-[10px] font-bold text-amber-900 dark:text-amber-200">
                          {t.errPaymentGatewayCode}
                        </div>
                        <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                          {t.errPaymentGatewayDesc}
                        </p>
                      </motion.div>
                    )}

                    {/* Payment Info Note */}
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="leading-snug">
                        Sipariş tamamlandığında tutar Sanal POS altyapınız üzerinden güvenli havuz hesaba aktarılır.
                      </p>
                    </div>
                  </form>
                )}

              </div>

              {/* Footer with totals and action buttons */}
              {items.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 space-y-3">
                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>{t.subtotal}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t.buyerProtection}</span>
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(buyerProtectionFee)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-blue-500" />
                        <span>{t.shipping}</span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {t.freeShipping}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex justify-between text-sm sm:text-base font-black text-gray-900 dark:text-white">
                      <span>{t.total}</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {step === 'cart' ? (
                    <button
                      onClick={handleProceedToCheckout}
                      className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                    >
                      <span>{t.proceedToCheckout}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      form="checkout-form"
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Güvenli Ödemeye Geç</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
