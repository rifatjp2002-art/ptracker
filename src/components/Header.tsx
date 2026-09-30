import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { 
  Heart, 
  LogOut, 
  Bell, 
  BellRing, 
  User as UserIcon, 
  Check, 
  X, 
  Languages, 
  Cloud, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Smartphone,
  Moon,
  Sun,
  Lock
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  isGuest: boolean;
  language: Language;
  onLanguageToggle: () => void;
  onSelectLanguage?: (lang: Language) => void;
  isOnline: boolean;
  onLogout: () => void;
  onPromptLogin: () => void;
  onToggleReminders: () => void;
  remindersActive: boolean;
  themeMode?: 'system' | 'dark' | 'light';
  onSelectTheme?: (mode: 'system' | 'dark' | 'light') => void;
  isPinActive?: boolean;
  onOpenPinLockModal?: () => void;
  onTriggerLockNow?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isGuest,
  language,
  onLanguageToggle,
  onSelectLanguage,
  isOnline,
  onLogout,
  onPromptLogin,
  onToggleReminders,
  remindersActive,
  themeMode = 'system',
  onSelectTheme,
  isPinActive = false,
  onOpenPinLockModal,
  onTriggerLockNow,
}) => {
  const t = getTranslation(language);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleSelectLang = (lang: Language) => {
    if (onSelectLanguage) {
      onSelectLanguage(lang);
    } else if (language !== lang) {
      onLanguageToggle();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#16151e]/95 backdrop-blur-md border-b border-pink-100/70 dark:border-pink-950/40 shadow-xs transition-colors pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-2xl mx-auto px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Compact App Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-xs shadow-pink-500/25 shrink-0 transition-transform active:scale-95">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base leading-tight tracking-tight truncate">
              {language === 'bn' ? t.bengaliName : t.appTitle}
            </h1>
            <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 leading-none mt-0.5 flex items-center gap-1">
              <span>{isGuest ? (language === 'bn' ? 'অফলাইন মোড' : 'Local Mode') : (language === 'bn' ? 'স্মার্ট ট্র্যাকার' : 'Smart Tracker')}</span>
            </p>
          </div>
        </div>

        {/* Right Action Icons: Notification Bell & Google Avatar Profile Button */}
        <div className="flex items-center gap-2 relative shrink-0" ref={menuRef}>
          {/* Notification Reminder Bell Icon */}
          <button
            onClick={onToggleReminders}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 border ${
              remindersActive
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60 shadow-xs'
                : 'bg-gray-50 dark:bg-[#201e2b] text-gray-400 dark:text-gray-400 border-gray-200/70 dark:border-gray-800 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
            title={remindersActive ? t.remindersActive : t.enableReminders}
            aria-label="Toggle Reminders"
          >
            {remindersActive ? (
              <BellRing className="w-4 h-4 fill-rose-500/20" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </button>

          {/* Google Profile Photo / User Avatar Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-full ring-2 ring-pink-300 dark:ring-pink-700/60 hover:ring-pink-500 transition-all cursor-pointer active:scale-95 relative flex items-center justify-center bg-gradient-to-tr from-pink-100 to-rose-50 dark:from-pink-950/50 dark:to-rose-900/40 shadow-xs"
            title={user ? (user.displayName || user.email || 'Profile Settings') : (language === 'bn' ? 'সেটিংস ও প্রোফাইল' : 'Settings & Profile')}
            aria-label="Open Account and Language Settings"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Google Profile'}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            )}

            {/* Small Google / Sync badge on bottom right of avatar */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-[#16151e] shadow-xs flex items-center justify-center p-0.5 border border-pink-200 dark:border-pink-800">
              {user ? (
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.15C3.25 21.37 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.2.01 10.05.01 12s.45 3.8 1.25 5.39l4.01-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </span>
          </button>

          {/* Interactive Profile & Language Settings Dropdown Popup */}
          {isMenuOpen && (
            <>
              {/* Dim backdrop on mobile to prevent accidental outside clicks */}
              <div 
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] sm:hidden"
                onClick={() => setIsMenuOpen(false)}
              />

              <div className="absolute right-0 top-11 mt-1 w-[290px] sm:w-[320px] bg-white dark:bg-[#1a1924] rounded-3xl shadow-2xl border border-pink-100 dark:border-pink-900/40 p-4 z-50 text-gray-800 dark:text-gray-100 transition-all">
                {/* Header inside popup */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {language === 'bn' ? 'প্রোফাইল ও সেটিংস' : 'Profile & Settings'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Account / Google User Info Card */}
                <div className="bg-pink-50/60 dark:bg-pink-950/30 rounded-2xl p-3 border border-pink-100/70 dark:border-pink-900/30 mb-3">
                  {user ? (
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="User"
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-pink-400 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                          {user.displayName?.[0] || 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                          {user.displayName || (language === 'bn' ? 'গুগল ব্যবহারকারী' : 'Google User')}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{language === 'bn' ? 'ক্লাউড ব্যাকআপ সক্রিয়' : 'Cloud Backup Active'}</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                            {language === 'bn' ? 'গেস্ট মোড (লোকাল সেভ)' : 'Guest Mode (Local Only)'}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {language === 'bn' ? 'ডাটা শুধুমাত্র আপনার ডিভাইসে আছে' : 'Data stored on this device'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onPromptLogin();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"/>
                          <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.15C3.25 21.37 7.33 24 12 24z"/>
                          <path fill="#ffffff" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.2.01 10.05.01 12s.45 3.8 1.25 5.39l4.01-3.15z"/>
                          <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
                        </svg>
                        <span>{language === 'bn' ? 'গুগল সাইন ইন ও ব্যাকআপ' : 'Google Sign-In & Backup'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Language Selection Setting (ভাষা পরিবর্তন সেটিং) */}
                <div className="mb-3">
                  <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <Languages className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                    <span>{language === 'bn' ? 'ভাষা পরিবর্তন (Language)' : 'Language Selection'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Bengali Option */}
                    <button
                      onClick={() => handleSelectLang('bn')}
                      className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        language === 'bn'
                          ? 'bg-pink-500 text-white border-pink-500 shadow-xs shadow-pink-500/20'
                          : 'bg-gray-50 dark:bg-[#201e2b] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-pink-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-sm">🇧🇩</span>
                        <span>বাংলা</span>
                      </span>
                      {language === 'bn' && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    {/* English Option */}
                    <button
                      onClick={() => handleSelectLang('en')}
                      className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-pink-500 text-white border-pink-500 shadow-xs shadow-pink-500/20'
                          : 'bg-gray-50 dark:bg-[#201e2b] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-pink-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-sm">🇺🇸</span>
                        <span>English</span>
                      </span>
                      {language === 'en' && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  </div>
                </div>

                {/* Theme Selector (থিম সেটিংস - ডিভাইস / ডার্ক / লাইট) */}
                <div className="mb-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                      <span>{language === 'bn' ? 'থিম মুড' : 'Theme Mode'}</span>
                    </span>
                    <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold normal-case">
                      {themeMode === 'system' ? (language === 'bn' ? 'ডিভাইস অটো' : 'Device Auto') : themeMode === 'dark' ? (language === 'bn' ? 'ডার্ক' : 'Dark') : (language === 'bn' ? 'লাইট' : 'Light')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectTheme?.('system')}
                      className={`py-2 px-1 rounded-2xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        themeMode === 'system'
                          ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                          : 'bg-gray-50 dark:bg-[#201e2b] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-pink-300'
                      }`}
                      title={language === 'bn' ? 'ডিভাইসের সেটিংস এর সাথে মিল রাখবে' : 'Match device settings'}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>{language === 'bn' ? 'ডিভাইস' : 'Device'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTheme?.('dark')}
                      className={`py-2 px-1 rounded-2xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        themeMode === 'dark'
                          ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                          : 'bg-gray-50 dark:bg-[#201e2b] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-pink-300'
                      }`}
                      title={language === 'bn' ? 'ডার্ক মোড' : 'Dark mode'}
                    >
                      <Moon className="w-4 h-4" />
                      <span>{language === 'bn' ? 'ডার্ক' : 'Dark'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTheme?.('light')}
                      className={`py-2 px-1 rounded-2xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        themeMode === 'light'
                          ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                          : 'bg-gray-50 dark:bg-[#201e2b] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-pink-300'
                      }`}
                      title={language === 'bn' ? 'লাইট মোড' : 'Light mode'}
                    >
                      <Sun className="w-4 h-4" />
                      <span>{language === 'bn' ? 'লাইট' : 'Light'}</span>
                    </button>
                  </div>
                </div>

                {/* App Privacy PIN Lock Option */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs py-1.5">
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
                    <Lock className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                    <span>{language === 'bn' ? 'প্রাইভেসি পিন লক' : 'App Privacy Lock'}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isPinActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onTriggerLockNow?.();
                        }}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/60 transition-colors cursor-pointer"
                        title={language === 'bn' ? 'এখনই লক করুন' : 'Lock Now'}
                      >
                        {language === 'bn' ? 'লক' : 'Lock'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenPinLockModal?.();
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                        isPinActive
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-950/30'
                      }`}
                    >
                      {isPinActive 
                        ? (language === 'bn' ? 'সক্রিয়' : 'Active') 
                        : (language === 'bn' ? 'সেট করুন' : 'Setup')}
                    </button>
                  </div>
                </div>

                {/* Quick Reminders Option */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs py-1.5">
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
                    <Bell className="w-3.5 h-3.5 text-rose-500" />
                    <span>{language === 'bn' ? 'প্রতিদিনের রিমাইন্ডার' : 'Daily Reminders'}</span>
                  </span>
                  <button
                    onClick={onToggleReminders}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                      remindersActive
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}
                  >
                    {remindersActive ? (language === 'bn' ? 'চালু' : 'ON') : (language === 'bn' ? 'বন্ধ' : 'OFF')}
                  </button>
                </div>

                {/* Logout Button if Logged In */}
                {user && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full mt-2.5 py-2 px-3 rounded-xl bg-gray-50 dark:bg-[#201e2b] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 font-semibold text-xs border border-gray-200/80 dark:border-gray-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'লগ আউট করুন' : 'Log Out'}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
