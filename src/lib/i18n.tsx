'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  tr: {
    siteName: "DonanımPazar",
    siteTagline: "İkinci El Bilgisayar & Parça Vitrini",
    previewBanner: "🧪 GitHub Pages İnteraktif Önizleme Modu: Sunucu kurulumu yapılana kadar test amaçlı çalışır.",
    searchPlaceholder: "Ekran kartı, işlemci, laptop veya parça ara...",
    postListing: "İlan Ver",
    allCategories: "Tüm Kategoriler",
    gpu: "Ekran Kartı",
    cpu: "İşlemci",
    motherboard: "Anakart",
    ram: "RAM Bellek",
    laptop: "Laptop / Dizüstü",
    monitor: "Monitör",
    phone: "Telefon",
    categories: "Kategoriler",
    filters: "Filtreler",
    condition: "Ürün Durumu",
    allConditions: "Tümü",
    boxed: "Kutulu / Faturalı",
    cleanUsed: "Temiz / İkinci El",
    priceRange: "Fiyat Aralığı",
    min: "Min",
    max: "Max",
    location: "Şehir / Konum",
    allLocations: "Tüm Şehirler",
    clearFilters: "Filtreleri Sıfırla",
    noResults: "Aradığınız kriterlere uygun ilan bulunamadı.",
    resetSearch: "Filtreleri temizleyerek tekrar deneyebilirsiniz.",
    sellerInfo: "Satıcı Bilgileri",
    dealsCount: "Başarılı Satış",
    memberSince: "Üyelik:",
    sendMessage: "Satıcıya Mesaj Gönder",
    callSeller: "İletişim Numarası",
    specs: "Teknik Özellikler",
    description: "İlan Açıklaması",
    close: "Kapat",
    priceToggle: "Para birimini değiştirmek için tıklayın",
    createModalTitle: "Yeni İlan Oluştur (Önizleme Testi)",
    titleInput: "İlan Başlığı",
    categorySelect: "Kategori",
    priceInput: "Fiyat (₺)",
    conditionInput: "Durum",
    locationInput: "Konum (Örn: İstanbul / Kadıköy)",
    descInput: "Açıklama",
    submitListing: "İlanı Yayınla",
    listingSuccess: "İlanınız başarıyla eklendi ve vitrinde yayına alındı!",
    demoNotice: "Bu buton önizleme modundadır."
  },
  en: {
    siteName: "HardwareMarket",
    siteTagline: "Second-Hand PC & Hardware Marketplace",
    previewBanner: "🧪 GitHub Pages Interactive Preview: Runs in demo mode until deployed to a real server.",
    searchPlaceholder: "Search GPU, CPU, laptop or PC parts...",
    postListing: "Post Listing",
    allCategories: "All Categories",
    gpu: "Graphics Card",
    cpu: "Processor",
    motherboard: "Motherboard",
    ram: "RAM Memory",
    laptop: "Laptop / Notebook",
    monitor: "Monitor",
    phone: "Smartphone",
    categories: "Categories",
    filters: "Filters",
    condition: "Item Condition",
    allConditions: "All",
    boxed: "Boxed / With Invoice",
    cleanUsed: "Clean / Used",
    priceRange: "Price Range",
    min: "Min",
    max: "Max",
    location: "City / Location",
    allLocations: "All Cities",
    clearFilters: "Clear Filters",
    noResults: "No listings found matching your criteria.",
    resetSearch: "Try clearing filters or search terms.",
    sellerInfo: "Seller Information",
    dealsCount: "Deals Done",
    memberSince: "Member since:",
    sendMessage: "Send Message",
    callSeller: "Contact Number",
    specs: "Specifications",
    description: "Listing Description",
    close: "Close",
    priceToggle: "Click to toggle currency",
    createModalTitle: "Create New Listing (Preview Test)",
    titleInput: "Listing Title",
    categorySelect: "Category",
    priceInput: "Price (₺)",
    conditionInput: "Condition",
    locationInput: "Location (e.g. Istanbul / Kadikoy)",
    descInput: "Description",
    submitListing: "Publish Listing",
    listingSuccess: "Your listing has been created and published in preview!",
    demoNotice: "This action is in demo preview mode."
  }
};

type Language = 'tr' | 'en';
type Translations = typeof translations.tr;

interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
  currency: 'TRY' | 'USD';
  toggleCurrency: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('tr');
  const [currency, setCurrency] = useState<'TRY' | 'USD'>('TRY');

  useEffect(() => {
    const saved = localStorage.getItem('site-lang') as Language;
    if (saved && (saved === 'tr' || saved === 'en')) {
      setLang(saved);
    }
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('site-lang', newLang);
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'TRY' ? 'USD' : 'TRY');
  };

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang: changeLang, currency, toggleCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
