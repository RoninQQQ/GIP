'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Listing, Order } from './types';
import { isPreviewMode } from './config';
import { useAuth } from './auth-context';

interface CartPriceBreakdown {
  try: number;
  usd: number;
}

interface CartContextType {
  items: Listing[];
  itemCount: number;
  subtotal: CartPriceBreakdown;
  buyerProtectionFee: CartPriceBreakdown;
  total: CartPriceBreakdown;
  addToCart: (listing: Listing) => boolean;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  isInCart: (listingId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  // Orders
  orders: Order[];
  orderCount: number;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: 'escrow_held' | 'completed') => void;
  isOrdersModalOpen: boolean;
  setIsOrdersModalOpen: (open: boolean) => void;
  openOrdersModal: () => void;
  closeOrdersModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dp_cart';
const ORDERS_STORAGE_KEY = 'dp_orders';

const INITIAL_DEMO_ORDER: Order = {
  id: 'DP-739201',
  date: '28 Ekim 2024',
  items: [
    {
      id: 'ram-corsair32gb',
      title: 'Corsair Vengeance RGB Pro 32GB (2x16) DDR4 3600MHz CL18',
      category: 'ram',
      price: { try: 2850, usd: 83 },
      location: 'İstanbul / Ümraniye',
      condition: 'Kutulu / Faturalı',
      date: '2 gün önce',
      cover: '/images/listings/ram-corsair32gb/cover.jpg',
      images: ['/images/listings/ram-corsair32gb/cover.jpg'],
      description: 'Sorunsuz tertemiz RAM kiti.',
      seller: {
        name: 'Volkan K.',
        rating: 4.8,
        dealsCount: 9,
        memberSince: '2023',
        verified: true,
      },
    },
  ],
  total: { try: 2993, usd: 87 },
  address: 'İstanbul / Kadıköy, Caferağa Mah. Moda Cad. No: 42',
  status: 'escrow_held',
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to parse cart items from localStorage', e);
    }

    try {
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        // Sadece önizleme modunda demo sipariş tohumla, gerçek ortamda temiz başlat
        const initialOrders = isPreviewMode ? [INITIAL_DEMO_ORDER] : [];
        setOrders(initialOrders);
        if (initialOrders.length > 0) {
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(initialOrders));
        }
      }
    } catch (e) {
      console.error('Failed to parse orders from localStorage', e);
    }
  }, []);

  // In real production mode, sync cart items from SQL
  useEffect(() => {
    if (!user || user.id === 'guest' || isPreviewMode) return;

    let isMounted = true;
    async function syncCartFromSql() {
      try {
        const res = await fetch(`/api/cart?userId=${encodeURIComponent(user!.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && isMounted) {
            setItems(data.items);
            try {
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data.items));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Failed to sync cart from SQL', err);
      }
    }

    syncCartFromSql();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const saveItems = useCallback((newItems: Listing[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save cart items to localStorage', e);
    }
  }, []);

  const saveOrders = useCallback((newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(newOrders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const openOrdersModal = useCallback(() => setIsOrdersModalOpen(true), []);
  const closeOrdersModal = useCallback(() => setIsOrdersModalOpen(false), []);

  const isInCart = useCallback((listingId: string) => {
    return items.some((item) => item.id === listingId);
  }, [items]);

  const addToCart = useCallback((listing: Listing) => {
    const existingIndex = items.findIndex((item) => item.id === listing.id);
    let updated: Listing[];
    if (existingIndex >= 0) {
      // Update with new terms (e.g. negotiated price)
      updated = [...items];
      updated[existingIndex] = listing;
    } else {
      updated = [...items, listing];
    }
    saveItems(updated);
    setIsCartOpen(true);

    if (user && user.id !== 'guest' && !isPreviewMode) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          listingId: listing.id,
          customPriceTry: listing.price.try,
          customPriceUsd: listing.price.usd,
        }),
      }).catch(() => {});
    }

    return true;
  }, [items, saveItems, user]);

  const removeFromCart = useCallback((listingId: string) => {
    const updated = items.filter((item) => item.id !== listingId);
    saveItems(updated);

    if (user && user.id !== 'guest' && !isPreviewMode) {
      fetch(`/api/cart?userId=${encodeURIComponent(user.id)}&listingId=${encodeURIComponent(listingId)}`, {
        method: 'DELETE',
      }).catch(() => {});
    }
  }, [items, saveItems, user]);

  const clearCart = useCallback(() => {
    saveItems([]);

    if (user && user.id !== 'guest' && !isPreviewMode) {
      fetch(`/api/cart?userId=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
      }).catch(() => {});
    }
  }, [saveItems, user]);

  const addOrder = useCallback((order: Order) => {
    const updated = [order, ...orders];
    saveOrders(updated);
  }, [orders, saveOrders]);

  const updateOrderStatus = useCallback((orderId: string, status: 'escrow_held' | 'completed') => {
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status };
      }
      return order;
    });
    saveOrders(updated);
  }, [orders, saveOrders]);

  const subtotal = useMemo(() => {
    const trySum = items.reduce((acc, curr) => acc + (curr.price?.try || 0), 0);
    const usdSum = items.reduce((acc, curr) => acc + (curr.price?.usd || 0), 0);
    return { try: trySum, usd: usdSum };
  }, [items]);

  const buyerProtectionFee = useMemo(() => {
    // 5% buyer protection fee
    const feeTry = Math.round(subtotal.try * 0.05);
    const feeUsd = Math.round(subtotal.usd * 0.05);
    return { try: feeTry, usd: feeUsd };
  }, [subtotal]);

  const total = useMemo(() => {
    return {
      try: subtotal.try + buyerProtectionFee.try,
      usd: subtotal.usd + buyerProtectionFee.usd,
    };
  }, [subtotal, buyerProtectionFee]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.length,
        subtotal,
        buyerProtectionFee,
        total,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        orders,
        orderCount: orders.length,
        addOrder,
        updateOrderStatus,
        isOrdersModalOpen,
        setIsOrdersModalOpen,
        openOrdersModal,
        closeOrdersModal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
