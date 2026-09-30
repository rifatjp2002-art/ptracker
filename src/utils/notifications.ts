/**
 * Enhanced Cross-Platform Browser & PWA Notification Helper
 * Supports:
 * - Desktop Chrome / Edge / Firefox (Native Notification)
 * - Android Chrome / Brave / Edge (ServiceWorkerRegistration.showNotification)
 * - iOS PWA / iPadOS (Web Push & Notification API)
 * - Custom Vibration & Test Trigger
 */

const NOTIFICATION_PREF_KEY = 'period_reminders_enabled';
const LAST_REMINDER_DATE_KEY = 'last_period_reminder_date';
const REMINDER_DAYS_BEFORE_KEY = 'period_reminder_days_before';

/**
 * Check if the current browser/device supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return false;
  }
}

/**
 * Check if notifications are both granted and enabled by user in settings
 */
export function isNotificationEnabled(): boolean {
  if (!isNotificationSupported()) return false;
  const isGranted = Notification.permission === 'granted';
  const isUserEnabled = localStorage.getItem(NOTIFICATION_PREF_KEY) === 'true';
  return isGranted && isUserEnabled;
}

/**
 * Save user notification preference
 */
export function setNotificationPreference(enabled: boolean): void {
  localStorage.setItem(NOTIFICATION_PREF_KEY, enabled ? 'true' : 'false');
}

/**
 * Get days before reminder setting (default 2 days)
 */
export function getReminderDaysBefore(): number {
  const val = localStorage.getItem(REMINDER_DAYS_BEFORE_KEY);
  return val ? parseInt(val, 10) : 2;
}

/**
 * Set days before reminder setting
 */
export function setReminderDaysBefore(days: number): void {
  localStorage.setItem(REMINDER_DAYS_BEFORE_KEY, String(days));
}

/**
 * Send a notification using Service Worker if available, or direct fallback
 */
export async function sendNotification(
  title: string,
  options?: NotificationOptions
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  // Vibrate device if supported
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([150, 75, 150]);
  }

  const notificationOptions: NotificationOptions = {
    icon: '/icon.svg',
    badge: '/favicon-32x32.png',
    tag: 'period-tracker-alert',
    renotify: true,
    ...options,
  };

  // 1. Preferred method for Android Chrome & PWAs: Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.showNotification) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
      
      const readyReg = await navigator.serviceWorker.ready;
      if (readyReg && readyReg.showNotification) {
        await readyReg.showNotification(title, notificationOptions);
        return true;
      }
    } catch (swErr) {
      console.debug('Service worker notification fallback triggered:', swErr);
    }
  }

  // 2. Direct Notification Fallback for Desktop Browsers
  try {
    new Notification(title, notificationOptions);
    return true;
  } catch (err) {
    console.warn('Native Notification fallback notice:', err);
  }

  return false;
}

/**
 * Send a test notification to verify audio, vibration, and visual appearance
 */
export async function sendTestNotification(isBn: boolean): Promise<boolean> {
  const title = isBn ? '🌸 পিরিয়ড ট্র্যাকার টেস্ট নোটিফিকেশন' : '🌸 Period Tracker Test';
  const body = isBn
    ? 'আপনার ডিভাইসে নোটিফিকেশন সফলভাবে কাজ করছে! পরবর্তী সাইকেলের রিমাইন্ডার যথাসময়ে পেয়ে যাবেন।'
    : 'Notifications are working perfectly on your device! You will receive timely cycle alerts.';

  return await sendNotification(title, {
    body,
    icon: '/icon.svg',
    tag: 'test-reminder',
  });
}

/**
 * Check and trigger reminders based on cycle predictions
 */
export async function checkAndTriggerReminders(daysUntilNext: number | undefined, isBn: boolean): Promise<void> {
  if (daysUntilNext === undefined || !isNotificationEnabled()) return;

  const todayStr = new Date().toISOString().slice(0, 10);
  const lastTriggered = localStorage.getItem(LAST_REMINDER_DATE_KEY);

  // Trigger once per day maximum
  if (lastTriggered === todayStr) return;

  const reminderDays = getReminderDaysBefore();

  // Trigger when days remaining matches user preference (or 1 day before or today)
  if (daysUntilNext <= reminderDays && daysUntilNext >= 0) {
    let title = '';
    let body = '';

    if (daysUntilNext === 0) {
      title = isBn ? '🌸 আজ পিরিয়ডের সম্ভাব্য দিন' : '🌸 Period Expected Today';
      body = isBn
        ? 'আপনার ক্যালেন্ডার অনুসারে আজ পিরিয়ড শুরু হতে পারে। প্রয়োজনীয় প্রস্তুতি রাখুন।'
        : 'According to your cycle history, your period is expected to start today.';
    } else {
      title = isBn ? '🌸 পিরিয়ডের সম্ভাব্য রিমাইন্ডার' : '🌸 Upcoming Period Reminder';
      body = isBn
        ? `আপনার পরবর্তী পিরিয়ড শুরু হতে আনুমানিক ${daysUntilNext} দিন বাকি রয়েছে।`
        : `Your next period is estimated to start in ${daysUntilNext} day(s). Take care!`;
    }

    const success = await sendNotification(title, {
      body,
      icon: '/icon.svg',
      tag: `period-reminder-${todayStr}`,
    });

    if (success) {
      localStorage.setItem(LAST_REMINDER_DATE_KEY, todayStr);
    }
  }
}
