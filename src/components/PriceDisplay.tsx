'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

export default function PriceDisplay({ usd, tryPrice }: { usd: number, tryPrice: number }) {
  const [showUsd, setShowUsd] = useState(false);
  const { t } = useLanguage();

  return (
    <div 
      className="cursor-pointer font-bold text-lg bg-black/50 text-white px-3 py-1 rounded-md hover:bg-black/70 transition-colors"
      onClick={(e) => {
        e.stopPropagation(); // prevent modal triggering if clicking on card
        setShowUsd(!showUsd);
      }}
      title={t.priceToggle}
    >
      {showUsd ? `$${usd.toFixed(2)}` : `${tryPrice} ₺`}
    </div>
  );
}
