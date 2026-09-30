import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { Heart, Wifi, WifiOff, LogOut, Languages, Bell, BellRing, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  user: User | null;
  isGuest: boolean;
  language: Language;
  onLanguageToggle: () => void;
  isOnline: boolean;
  onLogout: () => void;
  onPromptLogin: () => void;
  onToggleReminders: () => void;
  remindersActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isGuest,
  language,
  onLanguageToggle,
  isOnline,
  onLogout,
  onPromptLogin,
  onToggleReminders,
  remindersActive,
}) => {
  const t = getTranslation(language);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* App Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-200">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight tracking-tight">
              {language === 'bn' ? t.bengaliName : t.appTitle}
            </h1>
            <p className="text-[11px] font-medium text-pink-600 flex items-center gap-1">
              <span>{isGuest ? t.guestModeBadge : (language === 'bn' ? 'স্মার্ট ট্র্যাকার' : 'Smart Cycle Tracker')}</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Online/Offline Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse'
            }`}
            title={isOnline ? t.online : t.offline}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>{t.offline}</span>
              </>
            )}
          </div>

          {/* Notification Reminder Toggle */}
          <button
            onClick={onToggleReminders}
            className={`min-h-[40px] min-w-[40px] p-2 rounded-xl text-xs font-bold flex items-center justify-center border transition-colors cursor-pointer ${
              remindersActive
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-600'
            }`}
            title={remindersActive ? t.remindersActive : t.enableReminders}
            aria-label="Toggle Reminders"
          >
            {remindersActive ? (
              <BellRing className="w-4 h-4 fill-rose-100" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton language={language} variant="header" />

          {/* Language Toggle Pill */}
          <button
            onClick={onLanguageToggle}
            className="min-h-[40px] min-w-[40px] px-2.5 py-1 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center gap-1 border border-pink-200/80 transition-colors cursor-pointer active:scale-95"
            aria-label="Toggle Language"
          >
            <Languages className="w-3.5 h-3.5 text-pink-600" />
            <span>{language === 'en' ? 'বাং' : 'EN'}</span>
          </button>

          {/* If Guest: Login/Backup button */}
          {isGuest && (
            <button
              onClick={onPromptLogin}
              className="min-h-[40px] px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs hover:from-pink-700 hover:to-rose-700 transition-all cursor-pointer"
              title={t.syncGuestToCloud}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'bn' ? 'গুগলে সিঙ্ক' : 'Sync'}</span>
            </button>
          )}

          {/* Logout Button if user authenticated */}
          {user && (
            <button
              onClick={onLogout}
              className="min-h-[40px] min-w-[40px] px-2 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-rose-600 font-medium text-xs flex items-center gap-1 border border-gray-200 transition-colors cursor-pointer active:scale-95"
              title={t.logout}
              aria-label={t.logout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">{t.logout}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
