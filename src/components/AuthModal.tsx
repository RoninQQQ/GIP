'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Mail, Lock, User as UserIcon, Zap, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/i18n';
import { isPreviewMode } from '@/lib/config';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalView, 
    setAuthModalView, 
    login, 
    register, 
    demoLogin,
    authError,
    clearAuthError
  } = useAuth();
  
  const { openCart } = useCart();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePostAuthSuccess = () => {
    try {
      const pending = sessionStorage.getItem('dp_pending_checkout');
      if (pending === 'true') {
        sessionStorage.removeItem('dp_pending_checkout');
        openCart();
      }
    } catch (_) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let success = false;
      if (authModalView === 'login') {
        success = await login(email, password);
      } else {
        success = await register(name, email, password);
      }
      if (success) {
        handlePostAuthSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = () => {
    demoLogin();
    handlePostAuthSuccess();
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transform-gpu"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden z-10 transform-gpu"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {authModalView === 'login' ? t.login : t.register}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.siteName}
                  </p>
                </div>
              </div>
              <button
                onClick={closeAuthModal}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* View Tabs */}
            <div className="p-4 pt-3 pb-0">
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-gray-100 dark:bg-zinc-800/80 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView('login');
                    clearAuthError();
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    authModalView === 'login'
                      ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t.login}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView('register');
                    clearAuthError();
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    authModalView === 'register'
                      ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t.register}
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error Message Alert */}
              {authError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/80 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="leading-snug">{authError}</span>
                </div>
              )}

              {authModalView === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    {t.fullName}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (authError) clearAuthError();
                      }}
                      placeholder="Ad Soyad"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (authError) clearAuthError();
                    }}
                    placeholder="ornek@donanimpazar.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authError) clearAuthError();
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'İşleniyor...' : authModalView === 'login' ? t.login : t.register}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Sadece Önizleme Modunda Gösterilen Demo Hesap Girişi */}
            {isPreviewMode && (
              <>
                {/* Divider */}
                <div className="px-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200 dark:border-zinc-800" />
                  <span className="text-xs uppercase font-medium text-gray-400">{t.or}</span>
                  <div className="flex-1 h-px bg-gray-200 dark:border-zinc-800" />
                </div>

                {/* One-click Demo Login Button */}
                <div className="p-6 pt-4">
                  <button
                    type="button"
                    onClick={handleDemoClick}
                    className="w-full group relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 hover:from-amber-500/20 hover:via-emerald-500/20 hover:to-blue-500/20 border border-amber-500/30 dark:border-amber-400/30 text-left transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
                          <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                            <span>{t.demoLogin}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                              Önizleme
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Doğrulanmış demo satıcı profili ile anında oturum açın
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
