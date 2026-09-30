import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';
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
  Monitor,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap
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
  const { isInstallable, isInstalled, isIOS, isInAppBrowser, browserType, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc'>(
    isIOS ? 'ios' : 'android'
  );
  const isBn = language === 'bn';

  // If already running as standalone installed app, do not show install prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res.success && res.outcome !== 'dismissed') {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleCopyCurrentLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // 1. Banner Variant (Shown on Dashboard top)
  if (variant === 'banner' && !dismissed) {
    return (
      <>
        <div className={`relative overflow-hidden bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white p-3.5 sm:p-4 rounded-3xl shadow-lg shadow-pink-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-white/15 ${className}`}>
          {/* Background decorative glow */}
          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <Download className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base leading-tight text-white">
                  {isBn ? '📱 অ্যাপ হিসেবে ফোনে ইনস্টল করুন' : '📱 Install as Mobile App'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-extrabold tracking-wide uppercase shadow-xs">
                  {isBn ? '১০০% অফলাইন' : '100% Offline'}
                </span>
              </div>
              <p className="text-xs text-pink-100/90 mt-0.5 leading-snug">
                {isBn 
                  ? 'প্লে-স্টোর ছাড়াই সরাসরি স্ক্রিনে রাখুন। ইন্টারনেট ছাড়া যেকোনো সময় দ্রুত খুলবে।' 
                  : 'Add to home screen without Play Store. Instant offline access anytime.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0">
            <button
              onClick={handleInstallClick}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-rose-600 hover:text-rose-700 font-extrabold text-xs rounded-2xl shadow-md hover:bg-rose-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
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
          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer ${className}`}
        >
          <span className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>{isBn ? '📱 হোম স্ক্রিনে অ্যাপ ইনস্টল' : '📱 Install App to Home Screen'}</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
            {isBn ? 'অফলাইন' : 'Offline'}
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
        className={`px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-500/20 transition-all cursor-pointer active:scale-95 ${className}`}
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1a1924] p-5 sm:p-6 shadow-2xl border border-rose-100 dark:border-rose-900/40 text-gray-800 dark:text-gray-100 space-y-4 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 leading-tight">
                  {isBn ? '📱 ফোনে অ্যাপ ইনস্টল করার নিয়ম' : '📱 How to Install Web App'}
                </h3>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                  {isBn ? 'কোনো প্লে-স্টোর ছাড়াই ইনস্ট্যান্ট ইনস্টল' : 'Direct Progressive Web App (PWA)'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuideModal(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* In-App Browser Warning Alert if opened inside FB / Messenger */}
          {isInAppBrowser && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <span>⚠️</span>
                <span>{isBn ? 'আপনি মেসেঞ্জার বা ফেসবুক ব্রাউজারে আছেন!' : 'In-App Browser Detected!'}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {isBn 
                  ? 'মেসেঞ্জার বা ফেসবুক অ্যাপ থেকে সরাসরি ইনস্টল করা যায় না। নিচের বাটনে লিংক কপি করে আপনার ফোনের Chrome অথবা Safari ব্রাউজারে পেস্ট করুন।' 
                  : 'In-app browsers do not support installing apps. Please copy the link and open it in Google Chrome or Safari.'}
              </p>
              <button
                onClick={handleCopyCurrentLink}
                className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (isBn ? 'লিংক কপি হয়েছে!' : 'Link Copied!') : (isBn ? 'লিংক কপি করুন' : 'Copy App Link')}</span>
              </button>
            </div>
          )}

          {/* 1-Click Native Install Prompt if Supported/Available */}
          {isInstallable && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50 border-2 border-rose-300 dark:border-rose-800 flex items-center justify-between gap-3 shadow-inner">
              <div className="text-xs">
                <div className="flex items-center gap-1 text-rose-950 dark:text-rose-200 font-extrabold">
                  <Zap className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>{isBn ? '১-ক্লিকে সরাসরি ইনস্টল:' : 'Direct 1-Click Install:'}</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                  {isBn ? 'নিচের বাটনে চাপ দিন ও Add দিন' : 'Tap button & confirm prompt'}
                </p>
              </div>
              <button
                onClick={async () => {
                  const res = await install();
                  if (res.success) {
                    setShowGuideModal(false);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{isBn ? 'এখনই ইনস্টল করুন' : 'Install Now'}</span>
              </button>
            </div>
          )}

          {/* Device Tabs Selector */}
          <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-800/80 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-white dark:bg-[#201e2b] text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-white dark:bg-[#201e2b] text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>iPhone / iOS</span>
            </button>
            <button
              onClick={() => setActiveTab('pc')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'pc'
                  ? 'bg-white dark:bg-[#201e2b] text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC / Laptop</span>
            </button>
          </div>

          {/* Tab Contents with Visual Steps */}
          <div className="space-y-3">
            {/* ANDROID TAB */}
            {activeTab === 'android' && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-200/80 dark:border-gray-800 space-y-3">
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{isBn ? '🤖 Android (Google Chrome বা Samsung Internet)' : '🤖 Android (Chrome / Edge)'}</span>
                </div>

                <div className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-[#161520] border border-gray-100 dark:border-gray-800">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-extrabold flex items-center justify-center shrink-0 text-xs">
                      ১
                    </div>
                    <div className="text-[12px] leading-tight">
                      <span>ব্রাউজারের একদম উপরে ডানে </span>
                      <strong className="text-rose-600 dark:text-rose-400 inline-flex items-center gap-0.5 bg-rose-50 dark:bg-rose-950/50 px-1 py-0.5 rounded">
                        <MoreVertical className="w-3.5 h-3.5 inline" /> ৩-ডট মেনু
                      </strong>
                      <span>-তে চাপ দিন।</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-[#161520] border border-gray-100 dark:border-gray-800">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-extrabold flex items-center justify-center shrink-0 text-xs">
                      ২
                    </div>
                    <div className="text-[12px] leading-tight">
                      <span>মেনু তালিকা থেকে </span>
                      <strong className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded inline-flex items-center gap-1">
                        <Download className="w-3.5 h-3.5 text-rose-500" /> "Install app"
                      </strong>
                      <span> অথবা </span>
                      <strong className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                        "Add to Home screen"
                      </strong>
                      <span> সিলেক্ট করুন।</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-[#161520] border border-gray-100 dark:border-gray-800">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-extrabold flex items-center justify-center shrink-0 text-xs">
                      ৩
                    </div>
                    <div className="text-[12px] leading-tight">
                      <span>পপআপে <strong>"Install"</strong> বা <strong>"Add"</strong> চাপলেই ফোনের অ্যাপ লিস্টে যুক্ত হয়ে যাবে! 🎉</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* IOS TAB */}
            {activeTab === 'ios' && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-200/80 dark:border-gray-800 space-y-3">
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>{isBn ? '🍎 iPhone / iPad (Safari Browser)' : '🍎 iPhone / iPad (Safari Browser)'}</span>
                </div>

                <div className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-[#161520] border border-gray-100 dark:border-gray-800">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center shrink-0 text-xs">
                      ১
                    </div>
                    <div className="text-[12px] leading-tight">
                      <span>সাফারি ব্রাউজারের নিচে থাকা </span>
                      <strong className="text-blue-600 dark:text-blue-400 inline-flex items-center gap-0.5 bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded">
                        <Share2 className="w-3.5 h-3.5 inline" /> Share
                      </strong>
                      <span> বাটনে ট্যাপ করুন।</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-[#161520] border border-gray-100 dark:border-gray-800">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center shrink-0 text-xs">
                      ২
                    </div>
                    <div className="text-[12px] leading-tight">
                      <span>নিচের দিকে স্ক্রোল করে </span>
                      <strong className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded inline-flex items-center gap-1">
                        <PlusSquare className="w-3.5 h-3.5 text-blue-500" /> "Add to Home Screen"
                      </strong>
                      <span> সিলেক্ট করুন।</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-[#161520] border border-gray-100 dark:border-gray-800">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center shrink-0 text-xs">
                      ৩
                    </div>
                    <div className="text-[12px] leading-tight">
                      <span>উপরে ডানে <strong>"Add"</strong> বাটনে ক্লিক করলেই হোমস্ক্রিনে অ্যাপ আইকন চলে আসবে!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PC TAB */}
            {activeTab === 'pc' && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-200/80 dark:border-gray-800 space-y-3">
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>{isBn ? '💻 Computer (Chrome / Edge)' : '💻 Desktop (Chrome / Edge)'}</span>
                </div>

                <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300 text-[12px]">
                  <p className="flex items-center gap-1.5">
                    <span className="font-bold text-purple-600">১.</span>
                    <span>ব্রাউজারের অ্যাড্রেস বারের (URL bar) ডানপাশে থাকা <strong>Install Icon (⤓)</strong>-এ ক্লিক করুন।</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="font-bold text-purple-600">২.</span>
                    <span><strong>"Install"</strong> বাটনে ক্লিক করলেই ডেস্কটপ উইন্ডো হিসেবে চালু হয়ে যাবে।</span>
                  </p>
                </div>
              </div>
            )}

            {/* Offline & Privacy guarantee */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-2.5 text-[11px] text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">{isBn ? '🔒 ১০০% অফলাইন ও নিরাপদ প্রাইভেসি:' : '🔒 100% Offline & Private:'}</p>
                <p className="opacity-90 leading-tight mt-0.5">
                  {isBn 
                    ? 'অ্যাপটি সম্পূর্ণ অফলাইনে কাজ করে। ইন্টারনেট কানেকশন ছাড়াও আপনার সকল ডাটা ও ক্যালেন্ডার সুরক্ষিত থাকে।' 
                    : 'Works seamlessly offline. Your health records and cycle data stay safe on your device.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopyCurrentLink}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'লিংক কপি করুন' : 'Copy Link')}</span>
            </button>

            <button
              onClick={() => setShowGuideModal(false)}
              className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              {isBn ? 'বুঝেছি (Close)' : 'Got it (Close)'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
};
