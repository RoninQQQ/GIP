'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
import PriceDisplay from './PriceDisplay';

type Game = {
  id: string;
  name: string;
  short_description: string;
  banner: string;
  screenshots: string[];
  price: { usd: number; try: number };
};

export default function GameModal({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!game) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{game.name}</h2>
            <div className="flex items-center gap-4">
              <PriceDisplay usd={game.price.usd} tryPrice={game.price.try} />
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            {/* Description */}
            <div 
              className="text-gray-700 dark:text-gray-300 text-lg mb-8 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: game.short_description }}
            />

            {/* Screenshots Carousel */}
            {game.screenshots && game.screenshots.length > 0 && (
              <div className="relative group">
                <div className="overflow-hidden rounded-lg" ref={emblaRef}>
                  <div className="flex">
                    {game.screenshots.map((src, idx) => (
                      <div className="flex-[0_0_100%] min-w-0" key={idx}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={`${basePath}${src}`} 
                          alt={`${game.name} screenshot ${idx + 1}`} 
                          className="w-full h-auto aspect-video object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel Controls */}
                <button
                  onClick={scrollPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
