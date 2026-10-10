'use client';

import GameGrid from '@/components/GameGrid';
import gamesData from '@/data/games.json';
import { useLanguage } from '@/lib/i18n';

export default function Home() {
  const { t, lang, setLang } = useLanguage();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Language Switcher */}
        <div className="flex justify-end mb-8">
          <button 
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="px-4 py-2 rounded-full border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors font-medium text-sm"
          >
            {lang === 'tr' ? '🇬🇧 English' : '🇹🇷 Türkçe'}
          </button>
        </div>

        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.description}
          </p>
        </header>

        {gamesData.length > 0 ? (
          <GameGrid games={gamesData} />
        ) : (
          <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-300 dark:border-zinc-800 rounded-xl">
            <p className="text-xl">{t.empty}</p>
            <p className="mt-2 text-sm">{t.addCommand}: <code>npm run add-game "STEAM_LINKI"</code></p>
          </div>
        )}
      </div>
    </main>
  );
}
