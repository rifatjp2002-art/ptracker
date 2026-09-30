import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { Heart, Sparkles, WifiOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  language: Language;
  onLogin: () => void;
  onGuestLogin: () => void;
  isLoading: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  language,
  onLogin,
  onGuestLogin,
  isLoading,
}) => {
  const t = getTranslation(language);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/60 border border-pink-100/80 text-center space-y-6"
      >
        {/* Top Decorative Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-400 p-1 shadow-lg shadow-pink-300/50 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-pink-600 fill-pink-50 animate-pulse" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {t.welcomeTitle}
          </h2>
          <p className="text-sm text-gray-600 font-normal leading-relaxed">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 gap-2.5 text-left pt-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-pink-50/70 border border-pink-100">
            <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                {language === 'bn' ? 'স্মার্ট এআই পূর্বাভাস' : 'Smart AI Predictions'}
              </p>
              <p className="text-[11px] text-gray-600">
                {language === 'bn' ? 'আপনার আগের রেটিং দিয়ে গাণিতিক নিখুঁত দিন হিসাব' : 'Automatic average cycle calculation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                {language === 'bn' ? 'সম্পূর্ণ অফলাইন সুবিধা' : '100% Offline Capability'}
              </p>
              <p className="text-[11px] text-gray-600">
                {language === 'bn' ? 'ইন্টারনেট ছাড়াই সেভ করুন, অনলাইনে স্বয়ংক্রিয় সিঙ্ক' : 'Save offline, auto-sync when online'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                {language === 'bn' ? 'নিরাপদ গুগল ক্লাউড' : 'Secure Firebase Cloud'}
              </p>
              <p className="text-[11px] text-gray-600">
                {language === 'bn' ? 'আপনার ডাটা শুধু আপনার একাউন্টেই সংরক্ষিত' : 'Private to your individual account'}
              </p>
            </div>
          </div>
        </div>

        {/* Google Sign In Button */}
        <div className="pt-2 space-y-2.5">
          <button
            onClick={onLogin}
            disabled={isLoading}
            className="w-full min-h-[52px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-base shadow-lg shadow-pink-500/25 flex items-center justify-center gap-3 transition-all transform active:scale-98 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t.loginWithGoogle}</span>
              </>
            )}
          </button>

          {/* Continue as Guest Button */}
          <button
            onClick={onGuestLogin}
            type="button"
            className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs border border-gray-200 transition-colors cursor-pointer active:scale-98"
          >
            👤 {t.continueAsGuest}
          </button>
        </div>

        {/* Offline Note */}
        <p className="text-xs text-gray-500 font-medium leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
          💡 {t.loginOfflineNote}
        </p>
      </motion.div>
    </div>
  );
};
