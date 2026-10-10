'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  tr: {
    title: "Oyun Koleksiyonu",
    description: "Küratörlüğünü yaptığımız en iyi oyunlar. Fiyatları dolar veya TL cinsinden görmek için kartların üzerindeki fiyata tıklayabilirsiniz.",
    empty: "Henüz oyun eklenmemiş.",
    addCommand: "Terminalden oyun ekleyebilirsiniz",
    close: "Kapat",
    priceToggle: "Para birimini değiştirmek için tıklayın"
  },
  en: {
    title: "Game Collection",
    description: "Curated collection of the best games. Click the price on the cards to toggle between USD and TRY.",
    empty: "No games added yet.",
    addCommand: "You can add games from the terminal",
    close: "Close",
    priceToggle: "Click to toggle currency"
  }
};

type Language = 'tr' | 'en';
type Translations = typeof translations.tr;

interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('tr');

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

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang: changeLang }}>
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
