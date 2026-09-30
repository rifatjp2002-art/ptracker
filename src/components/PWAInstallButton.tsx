import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { 
  Download, 
  Share2, 
  PlusSquare, 
  X, 
  Smartphone, 
  Sparkles, 
  WifiOff, 
  CheckCircle2, 
  MoreVertical, 
  ArrowRight,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAInstallButtonProps {
  language: Language;
  className?: string;
  variant?: 'header' | 'banner' | 'card' | 'menu-item';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language,
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isBn = language === 'bn';
  const t = getTranslation(language);

  // If already running as standalone installed app, do not show install prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installedSuccess = await install();
      if (!installedSuccess) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // 1. Banner Variant (Shown on Dashboard top)
  if (variant === 'banner' && !dismissed) {
    return (
      <>
        <div className={`relative overflow-hidden bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white p-3.5 sm:p-4 rounded-3xl shadow-lg shadow-pink-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}>
          {/* Background decorative glow */}
          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <Download className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base leading-tight text-white">
                  {isBn ? '📱 অ্যাপ হিসেবে ইনস্টল করুন' : '📱 Install as Web App'}
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-[10px] font-bold tracking-wide uppercase">
                  {isBn ? '১০০% অফলাইন' : 'Offline Ready'}
                </span>
              </div>
              <p className="text-xs text-pink-100/90 mt-0.5 leading-snug">
                {isBn 
                  ? 'ইন্টারনেট ছাড়াই সরাসরি মোবাইল স্ক্রিন থেকে অ্যাপের মতো দ্রুত ব্যবহার করুন।' 
                  : 'Install to your home screen for instant offline access and fast experience.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0">
            <button
              onClick={handleInstallClick}
              className="flex-1 sm:flex-none px-4 py-2 bg-white text-pink-600 font-extrabold text-xs rounded-2xl shadow-md hover:bg-pink-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'ইনস্টল বা গাইড' : 'Install / Guide'}</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              aria-label="Dismiss banner"
              title={isBn ? 'লুকান' : 'Dismiss'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instructions Modal */}
        {renderGuideModal()}
      </>
    );
  }

  // 2. Menu Item Variant (Inside Profile / Settings dropdown)
  if (variant === 'menu-item') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-colors cursor-pointer ${className}`}
        >
          <span className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>{isBn ? 'হোম স্ক্রিনে অ্যাপ ইনস্টল' : 'Install App to Home Screen'}</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300">
            {isBn ? 'ফ্রি' : 'PWA'}
          </span>
        </button>

        {renderGuideModal()}
      </>
    );
  }

  // 3. Header Variant (Standard compact button in navigation)
  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-pink-500/20 transition-all cursor-pointer active:scale-95 ${className}`}
        title={isBn ? 'অ্যাপ হিসেবে ফোনে ইনস্টল করুন' : 'Install App to Phone'}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{isBn ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
        <span className="sm:hidden">{isBn ? 'ইনস্টল' : 'Install'}</span>
      </button>

      {renderGuideModal()}
    </>
  );

  function renderGuideModal() {
    if (!showGuideModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fade-in">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1a1924] p-5 sm:p-6 shadow-2xl border border-pink-100 dark:border-pink-900/40 text-gray-800 dark:text-gray-100 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-sm">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100 leading-tight">
                  {isBn ? '📱 অ্যাপ হিসেবে ব্যবহারের নিয়ম' : '📱 How to Install App'}
                </h3>
                <p className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
                  {isBn ? 'কোনো প্লে-স্টোর ছাড়াই ইনস্টল করুন' : 'Progressive Web App (PWA)'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuideModal(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* If native install is ready, offer 1-click button */}
          {isInstallable && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/40 border border-pink-200 dark:border-pink-900/50 flex items-center justify-between gap-2">
              <div className="text-xs">
                <p className="font-bold text-pink-950 dark:text-pink-200">
                  {isBn ? 'সরাসরি ১-ক্লিকে ইনস্টল:' : 'Direct 1-Click Install:'}
                </p>
                <p className="text-[11px] text-pink-700 dark:text-pink-400">
                  {isBn ? 'নিচের বাটনে চাপ দিন' : 'Tap button to install'}
                </p>
              </div>
              <button
                onClick={async () => {
                  await install();
                  setShowGuideModal(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isBn ? 'ইনস্টল করুন' : 'Install'}</span>
              </button>
            </div>
          )}

          {/* Step by step device guides */}
          <div className="space-y-3 text-xs">
            {/* Android Guide */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-200/80 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isBn ? '🤖 Android (Chrome / Brave / Samsung):' : '🤖 Android (Chrome / Edge):'}</span>
              </div>
              <div className="space-y-1.5 pl-4 text-gray-600 dark:text-gray-300 text-[11px]">
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-pink-600 dark:text-pink-400">১.</span>
                  <span>ব্রাউজারের উপরের বা নিচের <strong>৩-ডট (⋮) মেনু</strong>-তে ট্যাপ করুন।</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-pink-600 dark:text-pink-400">২.</span>
                  <span><strong>"Install app"</strong> বা <strong>"Add to Home screen"</strong> চাপুন।</span>
                </p>
              </div>
            </div>

            {/* iOS Guide */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-200/80 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{isBn ? '🍎 iPhone / iPad (Safari):' : '🍎 iPhone / iPad (Safari):'}</span>
              </div>
              <div className="space-y-1.5 pl-4 text-gray-600 dark:text-gray-300 text-[11px]">
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-pink-600 dark:text-pink-400">১.</span>
                  <span>সাফারি ব্রাউজারের নিচে থাকা <strong>Share (⎋)</strong> বাটনে ট্যাপ করুন।</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-pink-600 dark:text-pink-400">২.</span>
                  <span><strong>"Add to Home Screen" (+)</strong> সিলেক্ট করে উপরে <strong>Add</strong> দিন।</span>
                </p>
              </div>
            </div>

            {/* Offline features benefit banner */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-[11px] text-emerald-900 dark:text-emerald-200">
              <WifiOff className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{isBn ? '১০০% অফলাইন সুবিধা:' : '100% Offline Capability:'}</p>
                <p className="opacity-90">
                  {isBn 
                    ? 'একবার ইনস্টল করলে কোনো ইন্টারনেট কানেকশন ছাড়াই সকল ফিচার ও ডাটা সবসময় কাজ করবে।' 
                    : 'Works seamlessly without any internet connection. All data stored securely on your phone.'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowGuideModal(false)}
            className="w-full py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {isBn ? 'ঠিক আছে (Close)' : 'Got it (Close)'}
          </button>
        </motion.div>
      </div>
    );
  }
};
