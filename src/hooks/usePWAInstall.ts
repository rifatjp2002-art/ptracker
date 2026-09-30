import { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return typeof window !== 'undefined' ? window.__pwaInstallPrompt || null : null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [browserType, setBrowserType] = useState<'chrome' | 'safari' | 'firefox' | 'samsung' | 'other'>('other');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode (already installed or running inside PWA container)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // User Agent Checks
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) || 
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Detect In-App Browsers (Facebook, Messenger, Instagram, WeChat, Line, Twitter/X)
    const inApp = /fbav|fban|instagram|messenger|line|micromessenger|twitter|snapchat|musical_ly|tiktok/i.test(ua);
    setIsInAppBrowser(inApp);

    if (ua.includes('samsungbrowser')) {
      setBrowserType('samsung');
    } else if (ua.includes('chrome') || ua.includes('crios')) {
      setBrowserType('chrome');
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      setBrowserType('safari');
    } else if (ua.includes('firefox') || ua.includes('fxios')) {
      setBrowserType('firefox');
    }

    // If early prompt was caught
    if (window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handlePromptReady = () => {
      if (window.__pwaInstallPrompt) {
        setDeferredPrompt(window.__pwaInstallPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<{ success: boolean; outcome?: 'accepted' | 'dismissed' | 'error' | 'unavailable' }> => {
    const prompt = deferredPrompt || window.__pwaInstallPrompt;
    if (!prompt) {
      return { success: false, outcome: 'unavailable' };
    }

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        window.__pwaInstallPrompt = null;
        return { success: true, outcome: 'accepted' };
      }
      return { success: false, outcome: 'dismissed' };
    } catch (err) {
      console.warn('Install prompt error:', err);
      return { success: false, outcome: 'error' };
    }
  }, [deferredPrompt]);

  return {
    isInstallable: !!(deferredPrompt || (typeof window !== 'undefined' && window.__pwaInstallPrompt)),
    isInstalled,
    isIOS,
    isInAppBrowser,
    browserType,
    install,
  };
}
