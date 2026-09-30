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

import { 
  LayoutDashboard, 
  Calendar, 
  History, 
  Plus, 
  Heart,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const GUEST_STORAGE_KEY = 'guest_cycle_records';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Guest Mode flag (true if user opted to continue without login)
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('period_tracker_guest_mode') === 'true';
  });

  // App Focus Mode: 'track' (General Cycle) vs 'conceive' (TTC / Fertility Window)
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('period_tracker_app_mode');
    return (saved === 'conceive' || saved === 'track') ? saved : 'track';
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
    if (!auth.currentUser && localStorage.getItem('period_tracker_guest_mode') === 'true') {
      try {
        const stored = localStorage.getItem(GUEST_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Active Tab: 'dashboard' | 'calendar' | 'history'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'history'>('dashboard');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<CycleRecord | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
      setAuthLoading(false);

      if (currentUser) {
        setIsGuest(false);
        localStorage.removeItem('period_tracker_guest_mode');

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
                  durationDays: rec.durationDays || 5,
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
        // If not logged in, check if in guest mode
        if (localStorage.getItem('period_tracker_guest_mode') === 'true') {
          setIsGuest(true);
          try {
            const stored = localStorage.getItem(GUEST_STORAGE_KEY);
            if (stored) {
              setRecords(JSON.parse(stored));
            }
          } catch {}
        }
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
            durationDays: data.durationDays || 5,
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
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      showToast(t.errorSaving, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    localStorage.setItem('period_tracker_guest_mode', 'true');
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        setRecords(JSON.parse(stored));
      } else {
        setRecords([]);
      }
    } catch {
      setRecords([]);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await signOut(auth);
      }
      setIsGuest(false);
      localStorage.removeItem('period_tracker_guest_mode');
      setRecords([]);
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
        durationDays: 5,
        flow: 'medium',
        symptoms: [],
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCE4EC]/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-white animate-bounce shadow-lg shadow-pink-200">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <p className="text-xs font-bold text-pink-600">
            {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading Period Tracker...'}
          </p>
        </div>
      </div>
    );
  }

  const isAppAccessible = Boolean(user || isGuest);
  const displayName = user?.displayName || (isGuest ? (language === 'bn' ? 'গেস্ট ব্যবহারকারী' : 'Guest User') : 'User');

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-800 bg-[#FCE4EC]/20 antialiased selection:bg-pink-200">
      {/* Top Header */}
      <Header
        user={user}
        isGuest={isGuest}
        language={language}
        onLanguageToggle={handleLanguageToggle}
        isOnline={isOnline}
        onLogout={handleLogout}
        onPromptLogin={handleGoogleLogin}
        onToggleReminders={handleToggleReminders}
        remindersActive={remindersActive}
      />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* PWA Install Prompt Banner */}
        <PWAInstallButton language={language} variant="banner" />

        {!isAppAccessible ? (
          /* Logged Out / Intro Screen */
          <LoginScreen
            language={language}
            onLogin={handleGoogleLogin}
            onGuestLogin={handleGuestLogin}
            isLoading={isLoggingIn}
          />
        ) : (
          /* Dashboard & Views */
          <div className="space-y-6">
            {activeTab === 'dashboard' && (
              <DashboardCard
                prediction={predictionResult}
                language={language}
                onOpenLogModal={handleOpenNewLog}
                appMode={appMode}
                onModeChange={handleModeChange}
              />
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
              <HistoryList
                records={records}
                prediction={predictionResult}
                userName={displayName}
                language={language}
                onEditRecord={handleEditRecord}
                onDeleteRecord={handleDeleteRecord}
                onOpenLogModal={handleOpenNewLog}
              />
            )}
          </div>
        )}
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
      {isAppAccessible && (
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
      )}

      {/* Bottom Touch-Friendly Navigation Bar */}
      {isAppAccessible && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-lg px-2 py-1">
          <div className="max-w-md mx-auto flex items-center justify-around">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`min-h-[48px] px-4 py-1.5 rounded-2xl flex flex-col items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>{t.tabDashboard}</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`min-h-[48px] px-4 py-1.5 rounded-2xl flex flex-col items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              <Calendar className="w-5 h-5 mb-0.5" />
              <span>{t.tabCalendar}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`min-h-[48px] px-4 py-1.5 rounded-2xl flex flex-col items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              <History className="w-5 h-5 mb-0.5" />
              <span>{t.tabHistory}</span>
            </button>
          </div>
        </nav>
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
    </div>
  );
}
