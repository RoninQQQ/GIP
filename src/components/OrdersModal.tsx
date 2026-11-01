'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  ShoppingBag,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/i18n';
import { basePath } from '@/lib/config';

interface OrdersModalProps {
  onShowToast?: (msg: string) => void;
}

export default function OrdersModal({ onShowToast }: OrdersModalProps) {
  const { isOrdersModalOpen, closeOrdersModal, orders, updateOrderStatus } = useCart();
  const { t, currency } = useLanguage();

  const handleConfirmDelivery = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    if (onShowToast) {
      onShowToast(t.deliveryConfirmed);
    }
  };

  const formatPrice = (val: { try: number; usd: number }) => {
    if (currency === 'USD') {
      return `$${val.usd.toLocaleString('en-US')}`;
    }
    return `${val.try.toLocaleString('tr-TR')} ₺`;
  };

  return (
    <AnimatePresence>
      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOrdersModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transform-gpu"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden z-10 flex flex-col max-h-[90vh] transform-gpu"
          >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{t.myOrders}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                    {orders.length}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Güvenli Havuz Hesap & Teslimat Takibi
                </p>
              </div>
            </div>

            <button
              onClick={closeOrdersModal}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Orders List / Body */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
            {orders.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  {t.noOrdersYet}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-5">
                  {t.noOrdersDesc}
                </p>
                <button
                  onClick={closeOrdersModal}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  {t.continueShopping}
                </button>
              </div>
            ) : (
              orders.map((order) => {
                const isHeld = order.status === 'escrow_held';

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-4 transition-all"
                  >
                    {/* Order Meta Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200/80 dark:border-zinc-700/60 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                          {order.id}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{order.date}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isHeld ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold text-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                            <span>{t.orderStatusEscrow}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{t.orderStatusCompleted}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 dark:bg-zinc-800 shrink-0 border border-gray-200 dark:border-zinc-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.cover.startsWith('data:') || item.cover.startsWith('http') ? item.cover : `${basePath}${item.cover}`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h5>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                              <span>{item.condition}</span>
                              <span>•</span>
                              <span className="text-blue-600 dark:text-blue-400">{item.seller.name}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Details & Escrow Confirmation Action */}
                    <div className="pt-3 border-t border-gray-200/80 dark:border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 truncate max-w-sm">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{order.address}</span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-gray-500 dark:text-gray-400 block text-[11px]">{t.total}</span>
                          <span className="font-black text-sm text-gray-900 dark:text-white">
                            {formatPrice(order.total)}
                          </span>
                        </div>

                        {/* Release Escrow Button if Held */}
                        {isHeld && (
                          <button
                            onClick={() => handleConfirmDelivery(order.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{t.confirmDelivery}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
