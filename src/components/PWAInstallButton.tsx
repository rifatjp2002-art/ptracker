import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  language: Language;
  className?: string;
  variant?: 'header' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language,
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const t = getTranslation(language);

  // If already in standalone mode, hide
  if (isInstalled || dismissed) {
    return null;
  }

  // When installable via Chromium / Android / Edge prompt
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className={`bg-gradient-to-r from-pink-500 to-rose-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-sm leading-snug">{t.installApp}</p>
              <p className="text-xs text-pink-100 opacity-90">{t.installTooltip}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={install}
              className="px-3.5 py-1.5 bg-white text-pink-600 font-bold text-xs rounded-xl shadow hover:bg-pink-50 active:scale-95 transition-all cursor-pointer"
            >
              {t.installApp}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-white/70 hover:text-white rounded-lg cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className={`min-h-[44px] px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-pink-200 transition-all cursor-pointer active:scale-95 ${className}`}
        title={t.installTooltip}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t.installApp}</span>
        <span className="sm:hidden">{language === 'bn' ? 'ইনস্টল' : 'Install'}</span>
      </button>
    );
  }

  // When on iOS Safari
  if (isIOS) {
    return (
      <>
        {variant === 'banner' ? (
          <div className={`bg-gradient-to-r from-pink-500 to-rose-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between gap-3 ${className}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm leading-snug">{t.installOnIos}</p>
                <p className="text-xs text-pink-100 opacity-90">{t.installTooltip}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowIOSModal(true)}
                className="px-3.5 py-1.5 bg-white text-pink-600 font-bold text-xs rounded-xl shadow hover:bg-pink-50 active:scale-95 transition-all cursor-pointer"
              >
                {t.installOnIos}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 text-white/70 hover:text-white rounded-lg cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowIOSModal(true)}
            className={`min-h-[44px] px-3 py-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-xs flex items-center gap-1.5 border border-pink-200 transition-all cursor-pointer active:scale-95 ${className}`}
            title={t.installTooltip}
          >
            <Smartphone className="w-3.5 h-3.5 text-pink-600" />
            <span className="hidden sm:inline">{t.installOnIos}</span>
            <span className="sm:hidden">iOS</span>
          </button>
        )}

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1a1924] p-6 shadow-2xl border border-pink-100 dark:border-pink-900/40 text-gray-800 dark:text-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center text-pink-600 dark:text-pink-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{t.iosInstallTitle}</h3>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/30">
                  <div className="p-2 rounded-xl bg-white dark:bg-[#201e2b] text-blue-500 shadow-sm shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">ধাপ ১ / Step 1</p>
                    <p className="mt-0.5 text-gray-600 dark:text-gray-400">{t.iosStep1}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/30">
                  <div className="p-2 rounded-xl bg-white dark:bg-[#201e2b] text-pink-600 dark:text-pink-400 shadow-sm shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">ধাপ ২ / Step 2</p>
                    <p className="mt-0.5 text-gray-600 dark:text-gray-400">{t.iosStep2}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full rounded-2xl bg-pink-600 py-3 text-sm font-bold text-white shadow-md shadow-pink-200 dark:shadow-none hover:bg-pink-700 active:scale-95 transition-all cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
