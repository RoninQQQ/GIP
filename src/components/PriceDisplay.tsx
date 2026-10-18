'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';

export default function PriceDisplay({ 
  usd, 
  tryPrice, 
  className = "font-bold text-lg bg-black/60 text-white px-3 py-1 rounded-lg backdrop-blur-md hover:bg-black/80 transition-colors shadow-sm",
  large = false
}: { 
  usd: number; 
  tryPrice: number;
  className?: string;
  large?: boolean;
}) {
  const { currency, toggleCurrency, t } = useLanguage();
  const [localUsd, setLocalUsd] = useState(currency === 'USD');

  useEffect(() => {
    setLocalUsd(currency === 'USD');
  }, [currency]);

  return (
    <div 
      className={`cursor-pointer inline-flex items-center gap-1 select-none ${className} ${large ? 'text-2xl px-4 py-2' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setLocalUsd(!localUsd);
      }}
      title={t.priceToggle}
    >
      <span>{localUsd ? `$${usd.toLocaleString('en-US')}` : `${tryPrice.toLocaleString('tr-TR')} ₺`}</span>
    </div>
  );
}
