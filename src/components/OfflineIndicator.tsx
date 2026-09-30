import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  language: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  language,
}) => {
  const t = getTranslation(language);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-40 flex items-center gap-2.5 rounded-2xl bg-gray-900/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-2xl border border-gray-700/80 animate-bounce-short">
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span className="leading-snug">{t.offlineBannerText}</span>
    </div>
  );
};
