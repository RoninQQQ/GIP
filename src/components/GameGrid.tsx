'use client';

import { useState } from 'react';
import GameModal from './GameModal';
import PriceDisplay from './PriceDisplay';

type Game = {
  id: string;
  name: string;
  short_description: string;
  banner: string;
  screenshots: string[];
  price: { usd: number; try: number };
};

export default function GameGrid({ games }: { games: Game[] }) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <div 
            key={game.id} 
            className="group cursor-pointer rounded-xl overflow-hidden shadow-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => setSelectedGame(game)}
          >
            {/* Banner */}
            <div className="relative aspect-[460/215] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`${basePath}${game.banner}`} 
                alt={game.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                 <PriceDisplay usd={game.price.usd} tryPrice={game.price.try} />
              </div>
            </div>
            {/* Title */}
            <div className="p-4">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-1">{game.name}</h3>
            </div>
          </div>
        ))}
      </div>

      <GameModal 
        game={selectedGame} 
        onClose={() => setSelectedGame(null)} 
      />
    </>
  );
}
