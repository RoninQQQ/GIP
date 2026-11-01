'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from './types';
import { testAccount, isPreviewMode } from './config';

export const DEMO_USER: User = {
  id: 'demo-user-1',
  name: 'Caner Özkan (Demo)',
  email: 'demo@donanimpazar.com',
  city: 'İstanbul / Kadıköy',
  province: 'İstanbul',
  district: 'Kadıköy',
  rating: 4.9,
  dealsCount: 14,
  memberSince: '2023',
  verified: true,
  isTestAccount: false,
  favorites: ['gpu-rtx3070ti', 'laptop-legion5'],
};

interface RegisteredAccount {
  user: User;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string, city?: string, province?: string, district?: string) => Promise<boolean>;
  demoLogin: () => void;
  logout: () => void;
  toggleFavorite: (listingId: string) => boolean;
  isFavorite: (listingId: string) => boolean;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'register';
  authError: string | null;
  clearAuthError: () => void;
  openAuthModal: (view?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'dp_auth_user';
const REGISTERED_USERS_KEY = 'dp_registered_users';

function isClientLocalhost(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname.toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse auth user from localStorage', e);
    }
  }, []);

  const saveUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save auth user to localStorage', e);
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const openAuthModal = useCallback((view: 'login' | 'register' = 'login') => {
    setAuthModalView(view);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password || '';
    setAuthError(null);

    const isTestEmail = cleanEmail === testAccount.email.toLowerCase();

    // Check localhost restriction for test account on client
    if (isTestEmail && !isClientLocalhost()) {
      setAuthError('Test hesabı yalnızca yerel geliştirme (127.0.0.1) ortamında kullanılabilir');
      return false;
    }

    // Attempt /api/auth in non-preview or hybrid mode
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: cleanEmail, password: cleanPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          saveUser(data.user);
          closeAuthModal();
          return true;
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 403 || res.status === 401 || res.status === 400) {
          setAuthError(errorData.error || 'Giriş başarısız');
          return false;
        }
      }
    } catch {
      // In static preview mode, API might not exist; fallback to local check
    }

    // 1. Check if matching .env testAccount
    if (isTestEmail) {
      if (cleanPassword === testAccount.password) {
        const testUser: User = {
          id: 'usr-test-1',
          name: testAccount.name,
          email: testAccount.email,
          city: testAccount.city,
          province: 'İstanbul',
          district: 'Kadıköy',
          rating: 5.0,
          dealsCount: 5,
          memberSince: '2024',
          verified: true,
          isTestAccount: true,
          favorites: user?.favorites || [],
        };
        saveUser(testUser);
        closeAuthModal();
        return true;
      } else {
        setAuthError('Şifre hatalı. Lütfen test hesabı şifresini kontrol edin.');
        return false;
      }
    }

    // 2. Check registered users in localStorage (dp_registered_users)
    try {
      const rawStored = localStorage.getItem(REGISTERED_USERS_KEY);
      const registeredList: RegisteredAccount[] = rawStored ? JSON.parse(rawStored) : [];
      const matched = registeredList.find((item) => item.user.email.toLowerCase() === cleanEmail);

      if (matched) {
        if (!matched.password || matched.password === cleanPassword) {
          saveUser(matched.user);
          closeAuthModal();
          return true;
        } else {
          setAuthError('Girdiğiniz şifre hatalı.');
          return false;
        }
      }
    } catch (e) {
      console.error('Failed reading registered users', e);
    }

    // 3. User not found
    setAuthError('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.');
    return false;
  }, [user, saveUser, closeAuthModal]);

  const register = useCallback(async (
    name: string,
    email: string,
    password?: string,
    city?: string,
    province?: string,
    district?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    setAuthError(null);

    const resolvedProvince = province || city?.split('/')[0]?.trim() || 'İstanbul';
    const resolvedDistrict = district || city?.split('/')[1]?.trim() || 'Kadıköy';
    const fullCity = `${resolvedProvince} / ${resolvedDistrict}`;

    // Try server API
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name,
          email: cleanEmail,
          password,
          province: resolvedProvince,
          district: resolvedDistrict,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          saveUser(data.user);
          closeAuthModal();
          return true;
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 400) {
          setAuthError(errorData.error || 'Kayıt oluşturulamadı');
          return false;
        }
      }
    } catch {
      // In static preview mode, fallback to localStorage
    }

    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: name.trim() || 'Yeni Kullanıcı',
      email: cleanEmail,
      city: fullCity,
      province: resolvedProvince,
      district: resolvedDistrict,
      rating: 5.0,
      dealsCount: 0,
      memberSince: new Date().getFullYear().toString(),
      verified: true,
      isTestAccount: false,
      favorites: user?.favorites || [],
    };

    // Save to registered users list in localStorage
    try {
      const rawStored = localStorage.getItem(REGISTERED_USERS_KEY);
      const registeredList: RegisteredAccount[] = rawStored ? JSON.parse(rawStored) : [];
      const updatedList = [
        ...registeredList.filter((item) => item.user.email.toLowerCase() !== cleanEmail),
        { user: newUser, password: password || '' },
      ];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed saving registered users', e);
    }

    saveUser(newUser);
    closeAuthModal();
    return true;
  }, [user, saveUser, closeAuthModal]);

  const demoLogin = useCallback(() => {
    saveUser(DEMO_USER);
    closeAuthModal();
  }, [saveUser, closeAuthModal]);

  const logout = useCallback(() => {
    saveUser(null);
  }, [saveUser]);

  // Sync favorites from SQL when user changes and in real production mode
  useEffect(() => {
    if (!user || user.id === 'guest' || isPreviewMode) return;

    let isMounted = true;
    async function syncFavorites() {
      try {
        const res = await fetch(`/api/favorites?userId=${encodeURIComponent(user!.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.favorites) && isMounted) {
            setUser((prev) => {
              if (!prev) return null;
              const updated = { ...prev, favorites: data.favorites };
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        }
      } catch {
        // In case of network error, use cached
      }
    }

    syncFavorites();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const toggleFavorite = useCallback((listingId: string): boolean => {
    if (!user || user.id === 'guest') {
      openAuthModal('login');
      return false;
    }

    const currentFavs = user.favorites || [];
    const exists = currentFavs.includes(listingId);
    const isFavNow = !exists;
    const updatedFavs = exists
      ? currentFavs.filter((id) => id !== listingId)
      : [...currentFavs, listingId];

    const updatedUser: User = {
      ...user,
      favorites: updatedFavs,
    };

    saveUser(updatedUser);

    // Sync with SQL in real mode
    if (!isPreviewMode) {
      if (isFavNow) {
        fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, listingId }),
        }).catch(() => {});
      } else {
        fetch(`/api/favorites?userId=${encodeURIComponent(user.id)}&listingId=${encodeURIComponent(listingId)}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
    }

    return isFavNow;
  }, [user, openAuthModal, saveUser]);

  const isFavorite = useCallback((listingId: string): boolean => {
    return Boolean(user?.favorites?.includes(listingId));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && user.id !== 'guest'),
        login,
        register,
        demoLogin,
        logout,
        toggleFavorite,
        isFavorite,
        isAuthModalOpen,
        authModalView,
        authError,
        clearAuthError,
        openAuthModal,
        closeAuthModal,
        setAuthModalView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
