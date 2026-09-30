import React, { useState, useEffect, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

import { CycleRecord, Language, AppMode } from './types';
import { getTranslation } from './translations';
import { calculateCyclePredictions } from './utils/cycleCalculator';
import { 
  requestNotificationPermission, 
  isNotificationEnabled, 
  setNotificationPreference, 
  checkAndTriggerReminders 
} from './utils/notifications';

import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardCard } from './components/DashboardCard';
import { CalendarView } from './components/CalendarView';
import { HistoryList } from './components/HistoryList';
import { CycleFormModal } from './components/CycleFormModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { CycleTrendChart } from './components/CycleTrendChart';
import { LockScreen } from './components/LockScreen';
import { PinLockModal } from './components/PinLockModal';
import { isPinLockEnabled, isAppUnlocked, setAppUnlocked } from './utils/security';

import { 
  LayoutDashboard, 
  Calendar, 
  History, 
  Plus, 
  Heart,
  CheckCircle2,
  AlertCircle,
  Cloud,
  ExternalLink,
  X,
  ShieldCheck,
  Sparkles,
  Loader2,
  LogIn
} from 'lucide-react';

const GUEST_STORAGE_KEY = 'guest_cycle_records';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  // App Focus Mode: 'track' (General Cycle) vs 'conceive' (TTC / Fertility Window)
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('period_tracker_app_mode');
    return (saved === 'conceive' || saved === 'track') ? saved : 'track';
  });

  // Theme Mode: 'system' (device preference) | 'dark' | 'light'
  const [themeMode, setThemeMode] = useState<'system' | 'dark' | 'light'>(() => {
    const saved = localStorage.getItem('period_tracker_theme');
    return (saved === 'dark' || saved === 'light' || saved === 'system') ? saved : 'system';
  });

  // Notification Reminder State
  const [remindersActive, setRemindersActive] = useState<boolean>(() => isNotificationEnabled());

  // Language state (default Bengali or English from browser/localStorage)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('period_tracker_lang');
    return (saved === 'bn' || saved === 'en') ? saved : 'bn';
  });

  // Online / Offline Status State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Cycle Records (from Firestore if logged in, or localStorage if in guest mode)
  const [records, setRecords] = useState<CycleRecord[]>(() => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Active Tab: 'dashboard' | 'calendar' | 'history'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'history'>('dashboard');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<CycleRecord | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Security PIN Lock & Privacy State
  const [isPinActive, setIsPinActive] = useState<boolean>(() => isPinLockEnabled());
  const [isLocked, setIsLocked] = useState<boolean>(() => isPinLockEnabled() && !isAppUnlocked());
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Auto-lock when browser tab/app is minimized or hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isPinLockEnabled()) {
        setAppUnlocked(false);
        setIsLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const t = getTranslation(language);

  // Save Language Preference
  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    setLanguage(newLang);
    localStorage.setItem('period_tracker_lang', newLang);
  };

  // Toggle Mode Preference
  const handleModeChange = (mode: AppMode) => {
    setAppMode(mode);
    localStorage.setItem('period_tracker_app_mode', mode);
  };

  // Toggle Notification Reminders
  const handleToggleReminders = async () => {
    if (remindersActive) {
      setNotificationPreference(false);
      setRemindersActive(false);
      showToast(language === 'bn' ? 'রিমাইন্ডার বন্ধ করা হয়েছে' : 'Reminders disabled');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationPreference(true);
        setRemindersActive(true);
        showToast(language === 'bn' ? 'রিমাইন্ডার সক্রিয় করা হয়েছে' : 'Reminders enabled');
      } else {
        showToast(
          language === 'bn' 
            ? 'ব্রাউজার সেটিংসে গিয়ে নোটিফিকেশন পারমিশন দিন' 
            : 'Please allow notification permission in your browser settings',
          'error'
        );
      }
    }
  };

  // Listen to device settings / user preference for dark/light mode
  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const applyTheme = () => {
        let isDark = false;
        if (themeMode === 'system') {
          isDark = mq.matches;
        } else if (themeMode === 'dark') {
          isDark = true;
        } else {
          isDark = false;
        }

        if (isDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          document.documentElement.style.colorScheme = 'light';
        }

        // Update mobile browser status bar theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]:not([media])');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', isDark ? '#121118' : '#FFF0F4');
        }
      };

      applyTheme();

      const listener = () => {
        if (themeMode === 'system') {
          applyTheme();
        }
      };

      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    } catch {}
  }, [themeMode]);

  const handleSelectTheme = (mode: 'system' | 'dark' | 'light') => {
    setThemeMode(mode);
    localStorage.setItem('period_tracker_theme', mode);
  };

  // Monitor Online/Offline connection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Firebase Auth Observer & Guest Data Auto-Migration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setIsGuest(false);

        // Check if there are local guest records to migrate into Firestore
        const guestDataStr = localStorage.getItem(GUEST_STORAGE_KEY);
        if (guestDataStr) {
          try {
            const guestRecords: CycleRecord[] = JSON.parse(guestDataStr);
            if (guestRecords.length > 0) {
              const cyclesRef = collection(db, 'users', currentUser.uid, 'cycles');
              for (const rec of guestRecords) {
                await addDoc(cyclesRef, {
                  userId: currentUser.uid,
                  startDate: rec.startDate,
                  durationDays: rec.durationDays || 3,
                  flow: rec.flow || 'medium',
                  symptoms: rec.symptoms || [],
                  notes: rec.notes || '',
                  createdAt: rec.createdAt || new Date().toISOString(),
                });
              }
              localStorage.removeItem(GUEST_STORAGE_KEY);
              showToast(t.guestDataMigrated, 'success');
            }
          } catch (e) {
            console.warn('Guest migration error:', e);
          }
        }
      } else {
        setIsGuest(true);
        try {
          const stored = localStorage.getItem(GUEST_STORAGE_KEY);
          if (stored) {
            setRecords(JSON.parse(stored));
          }
        } catch {}
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore Real-time Listener (when authenticated)
  useEffect(() => {
    if (!user) {
      if (!isGuest) {
        setRecords([]);
      }
      return;
    }

    const cyclesRef = collection(db, 'users', user.uid, 'cycles');
    const unsubscribe = onSnapshot(
      cyclesRef,
      (snapshot) => {
        const loadedRecords: CycleRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loadedRecords.push({
            id: docSnap.id,
            userId: user.uid,
            startDate: data.startDate,
            durationDays: data.durationDays || 3,
            flow: data.flow,
            symptoms: data.symptoms || [],
            notes: data.notes || '',
            createdAt: data.createdAt,
          });
        });
        setRecords(loadedRecords);
      },
      (error) => {
        console.warn('Firestore subscription notice:', error);
      }
    );

    return () => unsubscribe();
  }, [user, isGuest]);

  // Calculate Smart AI Predictions
  const predictionResult = useMemo(() => {
    return calculateCyclePredictions(records);
  }, [records]);

  // Trigger Local Reminders if active
  useEffect(() => {
    if (predictionResult && predictionResult.daysUntilNext !== undefined) {
      checkAndTriggerReminders(predictionResult.daysUntilNext, language === 'bn');
    }
  }, [predictionResult, language]);

  // Auth Functions
  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setPopupBlocked(false);
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
      showToast(
        language === 'bn' 
          ? 'গুগল একাউন্টে সফলভাবে সাইন ইন হয়েছে!' 
          : 'Signed in with Google successfully!', 
        'success'
      );
    } catch (err: any) {
      console.warn('Google Sign-In Error:', err);
      setPopupBlocked(true);
      setIsAuthModalOpen(true);
      showToast(
        language === 'bn' 
          ? 'ব্রাউজারে পপআপ ব্লক থাকতে পারে। নিচের নির্দেশনাটি দেখুন।' 
          : 'Popup may be blocked. Please check the instructions.', 
        'error'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await signOut(auth);
      }
      setUser(null);
      setIsGuest(true);
      try {
        const stored = localStorage.getItem(GUEST_STORAGE_KEY);
        setRecords(stored ? JSON.parse(stored) : []);
      } catch {
        setRecords([]);
      }
      showToast(language === 'bn' ? 'লগআউট সফল হয়েছে' : 'Logged out', 'success');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Save or Update Cycle Record (Dual support: Firebase if user, LocalStorage if guest)
  const handleSaveRecord = async (
    data: Omit<CycleRecord, 'userId'>,
    id?: string
  ) => {
    try {
      if (user) {
        if (id) {
          const docRef = doc(db, 'users', user.uid, 'cycles', id);
          updateDoc(docRef, {
            startDate: data.startDate,
            durationDays: data.durationDays,
            flow: data.flow,
            symptoms: data.symptoms,
            notes: data.notes,
          }).catch(err => {
            console.error('Error updating Firestore:', err);
            showToast(t.errorSaving, 'error');
          });
        } else {
          const cyclesRef = collection(db, 'users', user.uid, 'cycles');
          addDoc(cyclesRef, {
            userId: user.uid,
            startDate: data.startDate,
            durationDays: data.durationDays,
            flow: data.flow,
            symptoms: data.symptoms,
            notes: data.notes,
            createdAt: new Date().toISOString(),
          }).catch(err => {
            console.error('Error saving to Firestore:', err);
            showToast(t.errorSaving, 'error');
          });
        }
      } else if (isGuest) {
        // Guest mode local save
        let updated: CycleRecord[];
        if (id) {
          updated = records.map(r => r.id === id ? { ...r, ...data } : r);
        } else {
          const newRec: CycleRecord = {
            id: `guest_${Date.now()}`,
            userId: 'guest',
            startDate: data.startDate,
            durationDays: data.durationDays,
            flow: data.flow,
            symptoms: data.symptoms,
            notes: data.notes,
            createdAt: new Date().toISOString(),
          };
          updated = [...records, newRec];
        }
        setRecords(updated);
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      }

      showToast(t.savedSuccess, 'success');
    } catch (err) {
      console.error('Error in handleSaveRecord:', err);
      showToast(t.errorSaving, 'error');
    }
  };

  // Delete Record
  const handleDeleteRecord = async (id: string) => {
    try {
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'cycles', id);
        deleteDoc(docRef).catch(err => {
          console.error('Error deleting record:', err);
          showToast(t.errorSaving, 'error');
        });
      } else if (isGuest) {
        const updated = records.filter(r => r.id !== id);
        setRecords(updated);
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      }
      showToast(t.deletedSuccess, 'success');
    } catch (err) {
      console.error('Error deleting record:', err);
      showToast(t.errorSaving, 'error');
    }
  };

  // Open modal for new log
  const handleOpenNewLog = () => {
    setSelectedRecordForEdit(null);
    setIsModalOpen(true);
  };

  // Open modal for editing record
  const handleEditRecord = (rec: CycleRecord) => {
    setSelectedRecordForEdit(rec);
    setIsModalOpen(true);
  };

  // Select date from calendar to log
  const handleCalendarDateSelect = (dateStr: string) => {
    const existing = records.find(r => r.startDate === dateStr);
    if (existing) {
      setSelectedRecordForEdit(existing);
    } else {
      setSelectedRecordForEdit({
        userId: user?.uid || 'guest',
        startDate: dateStr,
        durationDays: 3,
        flow: 'medium',
        symptoms: [],
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const displayName = user?.displayName || (isGuest ? (language === 'bn' ? 'গেস্ট ব্যবহারকারী' : 'Guest User') : 'User');

  return (
    <div className="min-h-screen pb-28 font-sans text-gray-800 dark:text-gray-100 bg-[#FFF0F4] dark:bg-[#121118] antialiased selection:bg-pink-200 overflow-x-hidden">
      {/* Top Header */}
      <Header
        user={user}
        isGuest={isGuest}
        language={language}
        onLanguageToggle={handleLanguageToggle}
        onSelectLanguage={(lang) => {
          setLanguage(lang);
          localStorage.setItem('period_tracker_lang', lang);
        }}
        isOnline={isOnline}
        onLogout={handleLogout}
        onPromptLogin={() => {
          setPopupBlocked(false);
          setIsAuthModalOpen(true);
        }}
        onToggleReminders={handleToggleReminders}
        remindersActive={remindersActive}
        themeMode={themeMode}
        onSelectTheme={handleSelectTheme}
        isPinActive={isPinActive}
        onOpenPinLockModal={() => setIsPinModalOpen(true)}
        onTriggerLockNow={() => {
          setAppUnlocked(false);
          setIsLocked(true);
        }}
      />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-3.5 sm:px-4 py-4 space-y-4">
        {/* PWA Install Prompt Banner */}
        <PWAInstallButton language={language} variant="banner" />

        {/* Offline notice bar for Guest */}
        {isGuest && (
          <div className="bg-white/90 dark:bg-[#1c1a26]/90 backdrop-blur-xs border border-pink-100 dark:border-pink-950/50 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                {language === 'bn' 
                  ? 'লোকাল মোড সক্রিয় (ইন্টারনেট ছাড়াও ১০০% কাজ করবে)' 
                  : 'Local Offline Mode Active (100% functional without internet)'}
              </p>
            </div>
            <button
              onClick={() => {
                setPopupBlocked(false);
                setIsAuthModalOpen(true);
              }}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/50 dark:text-pink-300 px-3 py-1.5 rounded-xl border border-pink-200 dark:border-pink-800 transition-colors cursor-pointer shrink-0"
            >
              {language === 'bn' ? '☁️ গুগল ব্যাকআপ' : '☁️ Cloud Backup'}
            </button>
          </div>
        )}

        {/* Dashboard & Views */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <DashboardCard
                prediction={predictionResult}
                language={language}
                onOpenLogModal={handleOpenNewLog}
                appMode={appMode}
                onModeChange={handleModeChange}
              />
              <CycleTrendChart
                records={records}
                prediction={predictionResult}
                language={language}
              />
            </div>
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              records={records}
              prediction={predictionResult}
              language={language}
              onSelectDate={handleCalendarDateSelect}
            />
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <CycleTrendChart
                records={records}
                prediction={predictionResult}
                language={language}
              />
              <HistoryList
                records={records}
                prediction={predictionResult}
                userName={displayName}
                language={language}
                onEditRecord={handleEditRecord}
                onDeleteRecord={handleDeleteRecord}
                onOpenLogModal={handleOpenNewLog}
              />
            </div>
          )}
        </div>
      </main>

      {/* Toast Banner Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-gray-700 animate-fade-in">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Floating Log Entry FAB */}
      <div className="fixed bottom-20 right-4 sm:right-8 z-40">
        <button
          onClick={handleOpenNewLog}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white shadow-xl shadow-pink-600/40 flex items-center justify-center transition-all transform active:scale-90 cursor-pointer"
          aria-label={t.logPeriodTitle}
          title={t.logPeriodTitle}
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Touch-Friendly Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#16151e]/95 backdrop-blur-md border-t border-pink-100 dark:border-pink-950/40 shadow-lg px-2 py-1 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`min-h-[48px] px-4 py-1.5 rounded-2xl flex flex-col items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50'
                : 'text-gray-500 dark:text-gray-400 hover:text-pink-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>{t.tabDashboard}</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`min-h-[48px] px-4 py-1.5 rounded-2xl flex flex-col items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50'
                : 'text-gray-500 dark:text-gray-400 hover:text-pink-500'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span>{t.tabCalendar}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`min-h-[48px] px-4 py-1.5 rounded-2xl flex flex-col items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50'
                : 'text-gray-500 dark:text-gray-400 hover:text-pink-500'
            }`}
          >
            <History className="w-5 h-5 mb-0.5" />
            <span>{t.tabHistory}</span>
          </button>
        </div>
      </nav>

      {/* Cloud Sync & Google Sign-In Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#1a1924] rounded-3xl p-6 shadow-2xl border border-pink-100 dark:border-pink-900/40 space-y-5 animate-scale-up text-gray-800 dark:text-gray-100">
            {/* Top Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-md shadow-pink-200 dark:shadow-none">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg">
                    {language === 'bn' ? 'গুগল ক্লাউড সিঙ্ক ও ব্যাকআপ' : 'Google Cloud Sync'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {language === 'bn' ? 'আপনার পিরিয়ড ডাটা নিরাপদে সংরক্ষণ করুন' : 'Safely backup and access from any device'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Points */}
            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300 bg-pink-50/60 dark:bg-pink-950/30 p-3.5 rounded-2xl border border-pink-100/80 dark:border-pink-900/30">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-pink-600 dark:text-pink-400 mt-0.5 shrink-0" />
                <span>
                  {language === 'bn' 
                    ? 'ফোন পরিবর্তন বা হিস্ট্রি ক্লিয়ার করলেও কোনো ডাটা হারাবে না।' 
                    : 'Never lose your logs even if you change devices or clear cache.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400 mt-0.5 shrink-0" />
                <span>
                  {language === 'bn' 
                    ? 'বর্তমান অফলাইন এন্ট্রিগুলো স্বয়ংক্রিয়ভাবে ক্লাউডে যুক্ত হয়ে যাবে।' 
                    : 'Your current offline entries will automatically sync into your account.'}
                </span>
              </div>
            </div>

            {/* If Popup is Blocked Alert */}
            {popupBlocked && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs space-y-2 text-amber-900 dark:text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">
                      {language === 'bn' ? 'ব্রাউজার বা আইফ্রেম পপআপ আটকে দিয়েছে!' : 'Browser popup was blocked!'}
                    </p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                      {language === 'bn'
                        ? 'আইফ্রেম প্রিভিউতে সিকিউরিটির কারণে Google লগইন পপআপ ব্লক হতে পারে। নিচের বাটনে ক্লিক করে অ্যাপটি সরাসরি নতুন উইন্ডোতে ওপেন করুন, অথবা কোনো সাইন ইন ছাড়াই ১০০% অফলাইনে ব্যবহার করুন।'
                        : 'The preview iframe prevents Google login popups. Click below to open in a new window, or continue using the app fully offline.'}
                    </p>
                  </div>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? '🌐 নতুন উইন্ডোতে খুলুন (Open in New Tab)' : '🌐 Open in New Tab'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-pink-200 dark:shadow-none flex items-center justify-center gap-2.5 transition-all transform active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t.loginWithGoogle}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-xs font-semibold text-center transition-colors cursor-pointer"
              >
                {language === 'bn' ? '✅ অফলাইনে নিশ্চিন্তে ব্যবহার করুন' : 'Continue using offline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cycle Entry Modal */}
      <CycleFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecordForEdit(null);
        }}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
        initialRecord={selectedRecordForEdit}
        language={language}
      />

      {/* Offline Status Persistent Toast Banner */}
      <OfflineIndicator isOnline={isOnline} language={language} />

      {/* App Privacy PIN Lock Modal */}
      <PinLockModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        language={language}
        onPinConfigured={() => {
          setIsPinActive(isPinLockEnabled());
        }}
        onTriggerLockNow={() => {
          setAppUnlocked(false);
          setIsLocked(true);
        }}
      />

      {/* Fullscreen Privacy Lock Screen Overlay */}
      {isLocked && (
        <LockScreen
          language={language}
          userEmail={user?.email}
          onUnlocked={() => setIsLocked(false)}
        />
      )}
    </div>
  );
}
