'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { Category, Listing } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newListing: Listing) => void;
}

export default function CreateListingModal({ isOpen, onClose, onSubmit }: CreateListingModalProps) {
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('gpu');
  const [priceTry, setPriceTry] = useState<number>(12500);
  const [condition, setCondition] = useState('Kutulu / Faturalı');
  const [location, setLocation] = useState('İstanbul / Kadıköy');
  const [description, setDescription] = useState('');
  const [selectedPhotoKey, setSelectedPhotoKey] = useState('gpu-rtx3070ti');

  const samplePhotoOptions = [
    { key: 'gpu-rtx3070ti', label: 'Ekran Kartı Fotoğraf Seti', cover: '/images/listings/gpu-rtx3070ti/cover.jpg' },
    { key: 'cpu-ryzen5800x', label: 'İşlemci Fotoğraf Seti', cover: '/images/listings/cpu-ryzen5800x/cover.jpg' },
    { key: 'laptop-legion5', label: 'Laptop Fotoğraf Seti', cover: '/images/listings/laptop-legion5/cover.jpg' },
    { key: 'phone-iphone13pro', label: 'Telefon Fotoğraf Seti', cover: '/images/listings/phone-iphone13pro/cover.jpg' },
    { key: 'monitor-odyssey27', label: 'Monitör Fotoğraf Seti', cover: '/images/listings/monitor-odyssey27/cover.jpg' },
    { key: 'ram-corsair32gb', label: 'RAM Fotoğraf Seti', cover: '/images/listings/ram-corsair32gb/cover.jpg' },
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const usdPrice = Math.round((priceTry || 1000) / 34.5);
    const newListing: Listing = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      title,
      category,
      price: {
        try: priceTry || 1000,
        usd: usdPrice
      },
      location: location || 'İstanbul / Kadıköy',
      condition,
      date: 'Az önce',
      cover: `/images/listings/${selectedPhotoKey}/cover.jpg`,
      images: [
        `/images/listings/${selectedPhotoKey}/cover.jpg`,
        `/images/listings/${selectedPhotoKey}/shot_1.jpg`
      ],
      description: description || 'Kullanıcı tarafından canlı test önizlemesinde oluşturulmuş ikinci el bilgisayar parçası ilanı.',
      specs: {
        'Durum': condition,
        'Yayın': 'Önizleme İlanı'
      },
      seller: {
        name: 'Siz (Önizleme Kullanıcısı)',
        rating: 5.0,
        dealsCount: 1,
        memberSince: 'Bugün'
      }
    };

    onSubmit(newListing);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 z-10 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {t.createModalTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                {t.titleInput} *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: MSI Gaming X Trio RTX 4070 12GB - 3 Aylık"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Category & Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.categorySelect}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="gpu">{t.gpu}</option>
                  <option value="cpu">{t.cpu}</option>
                  <option value="laptop">{t.laptop}</option>
                  <option value="ram">{t.ram}</option>
                  <option value="motherboard">{t.motherboard}</option>
                  <option value="monitor">{t.monitor}</option>
                  <option value="phone">{t.phone}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.priceInput} *
                </label>
                <input
                  type="number"
                  required
                  value={priceTry}
                  onChange={(e) => setPriceTry(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Condition & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.conditionInput}
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="Kutulu / Faturalı">{t.boxed}</option>
                  <option value="Temiz / İkinci El">{t.cleanUsed}</option>
                  <option value="Sıfır">{t.allConditions === 'Tümü' ? 'Sıfır / Kapalı Kutu' : 'Brand New'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.locationInput}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Photo Preset Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Fotoğraf Paketi Seçimi
              </label>
              <select
                value={selectedPhotoKey}
                onChange={(e) => setSelectedPhotoKey(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
              >
                {samplePhotoOptions.map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                {t.descInput}
              </label>
              <textarea
                rows={3}
                placeholder="Ürünün kozmetik durumu, termal macun durumu, kutu ve fatura bilgisi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>{t.submitListing}</span>
              </button>
            </div>

          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
