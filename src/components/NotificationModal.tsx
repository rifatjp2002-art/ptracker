import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { 
  isNotificationSupported, 
  getNotificationPermissionStatus, 
  requestNotificationPermission, 
  isNotificationEnabled, 
  setNotificationPreference, 
  sendTestNotification, 
  getReminderDaysBefore, 
  setReminderDaysBefore 
} from '../utils/notifications';
import { Bell, BellRing, Check, X, Sparkles, ShieldCheck, AlertCircle, RefreshCw, Send, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onStatusChange?: (enabled: boolean) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  language,
  onStatusChange,
}) => {
  const isBn = language === 'bn';
  const isSupported = isNotificationSupported();
  
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [reminderDays, setReminderDays] = useState<number>(2);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermissionStatus());
      setIsEnabled(isNotificationEnabled());
      setReminderDays(getReminderDaysBefore());
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = async () => {
    setTestStatus(null);
    if (!isEnabled) {
      const granted = await requestNotificationPermission();
      const currentPerm = getNotificationPermissionStatus();
      setPermission(currentPerm);

      if (granted) {
        setNotificationPreference(true);
        setIsEnabled(true);
        onStatusChange?.(true);
        setTestStatus(isBn ? '✅ নোটিফিকেশন সফলভাবে চালু হয়েছে!' : '✅ Notifications enabled successfully!');
      } else {
        setNotificationPreference(false);
        setIsEnabled(false);
        onStatusChange?.(false);
        if (currentPerm === 'denied') {
          setTestStatus(
            isBn 
              ? '❌ ব্রাউজার সেটিংসে নোটিফিকেশন ব্লক করা আছে। দয়া করে সাইট সেটিং থেকে Permission Allow করুন।' 
              : '❌ Notifications are blocked in browser settings. Please allow permission.'
          );
        }
      }
    } else {
      setNotificationPreference(false);
      setIsEnabled(false);
      onStatusChange?.(false);
      setTestStatus(isBn ? 'রিমাইন্ডার বন্ধ করা হয়েছে।' : 'Reminders disabled.');
    }
  };

  const handleSendTest = async () => {
    setIsTesting(true);
    setTestStatus(null);

    // If not granted yet, ask for permission first
    if (permission !== 'granted') {
      const granted = await requestNotificationPermission();
      setPermission(getNotificationPermissionStatus());
      if (!granted) {
        setIsTesting(false);
        setTestStatus(
          isBn
            ? '⚠️ টেস্ট নোটিফিকেশন পাঠানোর আগে নোটিফিকেশন পারমিশন দিতে হবে।'
            : '⚠️ Please grant notification permission first.'
        );
        return;
      }
    }

    const sent = await sendTestNotification(isBn);
    setIsTesting(false);
    if (sent) {
      setTestStatus(
        isBn 
          ? '🎉 ডিভাইসে টেস্ট নোটিফিকেশন ও ভাইব্রেশন পাঠানো হয়েছে!' 
          : '🎉 Test notification sent with vibration!'
      );
    } else {
      setTestStatus(
        isBn 
          ? '⚠️ নোটিফিকেশন পাঠানো যায়নি। ব্রাউজারের নোটিফিকেশন পারমিশন চেক করুন।' 
          : '⚠️ Could not display notification. Check browser settings.'
      );
    }
  };

  const handleDaysChange = (days: number) => {
    setReminderDays(days);
    setReminderDaysBefore(days);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#1a1924] rounded-3xl p-6 shadow-2xl border border-pink-100 dark:border-pink-950/40 text-gray-800 dark:text-gray-100 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                {isBn ? 'স্মার্ট রিমাইন্ডার ও নোটিফিকেশন' : 'Smart Reminders & Alerts'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Status Banner */}
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs ${
          permission === 'granted'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : permission === 'denied'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            permission === 'granted'
              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
              : permission === 'denied'
              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
              : 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400'
          }`}>
            {permission === 'granted' ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : permission === 'denied' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold">
              {permission === 'granted'
                ? (isBn ? 'নোটিফিকেশন পারমিশন সক্রিয়' : 'Permission Granted')
                : permission === 'denied'
                ? (isBn ? 'নোটিফিকেশন পারমিশন বন্ধ (Blocked)' : 'Permission Blocked')
                : (isBn ? 'অনুমতি প্রয়োজন' : 'Permission Required')}
            </p>
            <p className="text-[11px] opacity-85 mt-0.5">
              {permission === 'granted'
                ? (isBn ? 'আপনার ডিভাইসে সাইকেল রিমাইন্ডার আসবে।' : 'Ready to receive cycle alerts.')
                : permission === 'denied'
                ? (isBn ? 'ব্রাউজার সেটিংস থেকে Allow করুন।' : 'Enable permission in site settings.')
                : (isBn ? 'সক্রিয় করতে নিচের বাটনে চাপ দিন।' : 'Tap toggle below to enable.')}
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-200 dark:border-gray-800">
          <div>
            <p className="font-bold text-xs text-gray-800 dark:text-gray-200">
              {isBn ? 'পিরিয়ড শুরুর পূর্বাভাস রিমাইন্ডার' : 'Upcoming Period Reminders'}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {isBn ? 'সাইকেলের দিন গণনা অনুযায়ী স্বয়ংক্রিয় এলার্ট' : 'Automatic reminder before cycle starts'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isEnabled && permission === 'granted'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {isEnabled && permission === 'granted' ? (isBn ? 'চালু' : 'Enabled') : (isBn ? 'বন্ধ' : 'Disabled')}
          </button>
        </div>

        {/* Days Selection */}
        {isEnabled && permission === 'granted' && (
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {isBn ? 'কত দিন আগে নোটিফিকেশন চান?' : 'Remind me how many days before?'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleDaysChange(days)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    reminderDays === days
                      ? 'bg-pink-50 dark:bg-pink-950/50 border-pink-500 text-pink-600 dark:text-pink-400'
                      : 'bg-gray-50 dark:bg-[#201e2b] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {isBn ? `${days === 1 ? '১' : days === 2 ? '২' : '৩'} দিন আগে` : `${days} day${days > 1 ? 's' : ''} before`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Test Notification Button */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            disabled={isTesting}
            onClick={handleSendTest}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isBn ? 'ডিভাইসে টেস্ট নোটিফিকেশন পাঠান' : 'Send Test Notification Now'}</span>
          </button>

          {testStatus && (
            <p className="text-[11px] px-2 text-center text-gray-700 dark:text-gray-300 font-medium">
              {testStatus}
            </p>
          )}
        </div>

        {/* Tips / Help */}
        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-100 dark:border-gray-800 text-[10px] text-gray-500 dark:text-gray-400 space-y-1">
          <p className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-500" />
            <span>{isBn ? 'নোটিফিকেশন কাজ করার নিয়ম:' : 'How it works:'}</span>
          </p>
          <p>
            {isBn 
              ? '১. কমপক্ষে ২টি পিরিয়ডের তারিখ এন্ট্রি করলে আপনার পরবর্তী সাইকেল হিসেব করে নোটিফিকেশন আসবে।' 
              : '1. Add at least 2 period entries so the app calculates your estimated cycle dates.'}
          </p>
          <p>
            {isBn 
              ? '২. টেস্ট বাটনে চাপ দিয়ে যেকোনো সময় আপনার ফোনে নোটিফিকেশন পরীক্ষা করতে পারবেন।' 
              : '2. Click the test button to verify audio, vibration, and banner on your device.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
