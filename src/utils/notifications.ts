/**
 * Browser Notification Helper for Period Tracker
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function isNotificationEnabled(): boolean {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted' && localStorage.getItem('period_reminders_enabled') === 'true';
}

export function setNotificationPreference(enabled: boolean) {
  localStorage.setItem('period_reminders_enabled', enabled ? 'true' : 'false');
}

export function checkAndTriggerReminders(daysUntilNext: number, isBn: boolean) {
  if (!isNotificationEnabled()) return;

  const todayStr = new Date().toISOString().slice(0, 10);
  const lastTriggered = localStorage.getItem('last_period_reminder_date');

  // Trigger once per day if 1 or 2 days left
  if (lastTriggered === todayStr) return;

  if (daysUntilNext === 2 || daysUntilNext === 1) {
    const title = isBn ? '🌸 পিরিয়ডের সম্ভাব্য রিমাইন্ডার' : '🌸 Period Reminder';
    const body = isBn
      ? `আপনার পরবর্তী পিরিয়ড শুরু হতে আনুমানিক ${daysUntilNext} দিন বাকি রয়েছে। প্রয়োজনীয় প্রস্তুতি রাখুন।`
      : `Your next period is estimated to start in ${daysUntilNext} day(s). Take care!`;

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
        });
        localStorage.setItem('last_period_reminder_date', todayStr);
      } catch (e) {
        console.warn('Notification error:', e);
      }
    }
  }
}
