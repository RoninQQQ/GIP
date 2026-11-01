'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, UploadCloud } from 'lucide-react';
import { Category, Listing } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { useLocations } from '@/lib/use-locations';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newListing: Listing) => void;
}

export default function CreateListingModal({ isOpen, onClose, onSubmit }: CreateListingModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('gpu');
  const [priceTry, setPriceTry] = useState<number>(12500);
  const [condition, setCondition] = useState('Kutulu / Faturalı');

  // Province and District states
  const [province, setProvince] = useState(() => {
    if (user?.province) return user.province;
    return 'İstanbul';
  });
  const [district, setDistrict] = useState(() => {
    if (user?.district) return user.district;
    return 'Kadıköy';
  });

  const { provinces, districts } = useLocations(province);

  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    setDistrict('');
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const remainingSlots = 6 - photos.length;
    const filesToRead = fileArray.slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setPhotos((prev) => (prev.length < 6 ? [...prev, result] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const usdPrice = Math.round((priceTry || 1000) / 34);
    const fullLocation = `${province} / ${district}`;

    const defaultCover = '/images/listings/test-item/cover.svg';
    const finalCover = photos.length > 0 ? photos[0] : defaultCover;
    const finalImages = photos.length > 0 ? photos : [defaultCover];

    const newListingId = `dp_item_${Date.now()}`;
    const newListing: Listing = {
      id: newListingId,
      title: title.trim(),
      category,
      price: {
        try: priceTry || 1000,
        usd: usdPrice,
      },
      location: fullLocation,
      condition,
      date: 'Bugün',
      cover: finalCover,
      images: finalImages,
      description: description.trim() || 'İkinci el PC donanım parçası. Param Güvende ile güvenle satın alınabilir.',
      specs: {
        'Durum': condition,
        'Yayın': 'Aktif İlan',
        'Kargo': 'Ücretsiz Kargo',
      },
      seller: {
        name: user?.name || 'Doğrulanmış Üye',
        rating: user?.rating || 5.0,
        dealsCount: user?.dealsCount || 1,
        memberSince: user?.memberSince || '2024',
        verified: user?.verified ?? true,
      },
    };

    try {
      // Send to server SQLite API
      await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newListing,
          province,
          district,
          sellerId: user?.id,
          isTestListing: Boolean(user?.isTestAccount),
        }),
      });
    } catch {
      // In static preview mode, fetch might fail, fallback to client state
    }

    onSubmit(newListing);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop without conflicting transition-opacity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transform-gpu"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 z-10 p-6 sm:p-8 transform-gpu"
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
                  placeholder="Örn: ASUS ROG Strix RTX 4070 Ti 12GB OC - Kutulu"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="gpu">{t.gpu}</option>
                    <option value="cpu">{t.cpu}</option>
                    <option value="motherboard">{t.motherboard}</option>
                    <option value="ram">{t.ram}</option>
                    <option value="storage">{t.storage}</option>
                    <option value="psu">{t.psu}</option>
                    <option value="case">{t.case}</option>
                    <option value="cooler">{t.cooler}</option>
                    <option value="monitor">{t.monitor}</option>
                    <option value="laptop">{t.laptop}</option>
                    <option value="desktop">{t.desktop}</option>
                    <option value="peripherals">{t.peripherals}</option>
                    <option value="network_sound">{t.network_sound}</option>
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

              {/* Condition & Province / District Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    {t.province}
                  </label>
                  <select
                    value={province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    {provinces.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    {t.district}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
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

              {/* Real Photo Upload Area (File Input + Drag & Drop, 1-6 Photos) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.photos}
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-zinc-700 hover:border-blue-400 bg-gray-50/50 dark:bg-zinc-800/40'
                  }`}
                >
                  <UploadCloud className="w-8 h-8 mx-auto mb-2 text-blue-500 opacity-80" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t.dragDropPhotos}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    JPG, PNG, WebP (Maks. 6 fotoğraf — Yüklendikçe ilk fotoğraf kapak olur)
                  </p>
                </div>

                {/* Photo Previews */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mt-3">
                    {photos.map((photoUrl, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
                      >
                        <img
                          src={photoUrl}
                          alt={`Önizleme ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* First photo cover indicator */}
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            {t.coverPhoto}
                          </div>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(index);
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors"
                          title={t.removePhoto}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.descInput}
                </label>
                <textarea
                  rows={2}
                  placeholder="Ürünün kozmetik durumu, termal macun durumu, kutu ve fatura bilgisi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>{isSubmitting ? 'Kaydediliyor...' : t.submitListing}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
