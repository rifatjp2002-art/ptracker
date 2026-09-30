import { Language } from './types';

export const translations = {
  en: {
    appTitle: 'Period Tracker',
    appSubtitle: 'Simple, Smart & Offline-Ready Cycle Companion',
    bengaliName: 'পিরিয়ড ট্র্যাকার',
    
    // Auth & Login
    welcomeTitle: 'Track Your Cycle Effortlessly',
    welcomeSubtitle: 'Smart AI predictions, offline auto-sync & complete privacy.',
    loginWithGoogle: 'Sign in with Google',
    loginPrompt: 'Sign in to sync your period records securely across all your devices.',
    loginOfflineNote: 'You can continue logging data even when you are offline. It will automatically sync when reconnected.',
    logout: 'Logout',

    // Status & Badges
    online: 'Online',
    offline: 'Offline Mode',
    syncedCloud: 'Synced to Cloud',
    savingLocal: 'Saved Locally',

    // Dashboard & Predictions
    nextExpectedDate: 'Next Expected Period',
    inDays: (days: number) => days === 0 ? 'Expected Today' : days < 0 ? `${Math.abs(days)} Days Late` : `In ${days} Days`,
    cycleDay: (day: number, total: number) => `Day ${day} of ${total}-day cycle`,
    avgCycleLength: 'Average Cycle Length',
    daysCount: (days: number) => `${days} Days`,
    lastPeriodStart: 'Last Period Started',
    fertileWindow: 'Estimated Fertile Window',
    ovulationDay: 'Estimated Ovulation Day',
    phases: {
      menstrual: 'Menstrual Phase',
      follicular: 'Follicular Phase',
      ovulation: 'Ovulation Phase',
      luteal: 'Luteal Phase',
    },
    phaseDesc: {
      menstrual: 'Bleeding phase. Rest well and stay hydrated.',
      follicular: 'Energy level rising. Estrogen levels increase.',
      ovulation: 'Peak fertility window.',
      luteal: 'Progesterone rises. You may experience PMS symptoms.',
    },
    aiPredictionNotice: (count: number) => 
      count === 0
        ? 'No cycle entries saved yet. Tap "Log Period Entry" below to record your start date.'
        : count === 1 
        ? 'Default 28-day cycle estimate used (1 record). Add more records for personalized AI predictions.'
        : `Calculated from your past ${count} logged cycle records average.`,
    noRecordsTitle: 'No Period Entries Logged Yet',
    noRecordsSubtitle: 'Tap "Log Period Entry" below to record your start date for personalized AI predictions.',

    // Navigation & Tabs
    tabDashboard: 'Dashboard',
    tabCalendar: 'Calendar',
    tabHistory: 'History',
    tabQuickLog: 'Log Today',

    // Form & Modal
    logPeriodTitle: 'Log Period Entry',
    editPeriodTitle: 'Edit Period Entry',
    formInstructionTip: '📌 Tip: Choose only the 1st day your period started and set its total duration. You do not need to log each day separately!',
    startDateLabel: 'Start Date',
    durationLabel: 'Duration (Days)',
    flowLabel: 'Flow Intensity',
    symptomsLabel: 'Symptoms experienced',
    notesLabel: 'Notes / How do you feel?',
    notesPlaceholder: 'e.g., drank warm water, mild headache, light exercise...',
    saveBtn: 'Save Entry',
    updateBtn: 'Update Entry',
    cancelBtn: 'Cancel',
    deleteBtn: 'Delete',
    confirmDelete: 'Are you sure you want to delete this cycle record?',

    // Flow Types
    flowTypes: {
      light: 'Light',
      medium: 'Medium',
      heavy: 'Heavy',
    },

    // Symptoms
    symptomsList: {
      cramps: 'Cramps',
      headache: 'Headache',
      bloating: 'Bloating',
      moodSwings: 'Mood Swings',
      fatigue: 'Fatigue',
      acne: 'Acne',
      backache: 'Backache',
      cravings: 'Cravings',
      nausea: 'Nausea',
    },

    // History
    historyTitle: 'Past Period Logs',
    noHistory: 'No cycle entries logged yet.',
    addFirstLog: 'Tap "Log Period" to record your start date!',
    durationDaysText: (days: number) => `${days} days long`,

    // Notifications & Toasts
    savedSuccess: 'Cycle record saved successfully!',
    deletedSuccess: 'Record deleted successfully!',
    errorSaving: 'Error saving entry. Please try again.',

    // PWA & Installation
    installApp: 'Install App',
    installTooltip: 'Install for quick home screen & offline access',
    installOnIos: 'Install on iOS',
    iosInstallTitle: 'Install on iPhone / iPad',
    iosStep1: 'Tap the Share button in Safari toolbar.',
    iosStep2: 'Scroll down and tap "Add to Home Screen".',
    close: 'Close',
    offlineBannerText: 'Offline Mode — Cached data is active. Changes will auto-sync when connected.',

    // Guest Mode & Login Enhancements
    continueAsGuest: 'Continue as Guest (Offline Mode)',
    guestModeBadge: 'Guest Mode (Local)',
    syncGuestToCloud: 'Sync Local Data to Google',
    guestDataMigrated: 'Your local records were successfully migrated to Google Cloud!',

    // Active Period In Progress
    periodActiveTitle: (day: number) => `Period Day ${day} in Progress`,
    periodActiveSubtitle: 'Menstrual bleeding is active. Stay warm, hydrated, and rest well.',

    // Cycle Regularity
    regularityStatus: {
      regular: 'Regular Cycle',
      irregular: 'Irregular Cycle (Variance > 4 days)',
      insufficient: 'Need 3+ cycles to analyze regularity',
    },
    regularityTip: 'Notable variation detected between cycle lengths. If persistent, consider consulting a gynecologist.',

    // Modes
    modeTrack: 'Track Cycle',
    modeConceive: 'Trying to Conceive',
    peakFertilityDay: 'Peak Fertility Day',

    // Doctor Report
    exportDoctorReport: "Doctor Consultation Report",
    printPdfReport: 'Print / Save PDF Report',
    downloadCsv: 'Export CSV Data',

    // Daily Wellness
    dailyWellnessTitle: "Today's Wellness",
    waterGlasses: (count: number) => `${count} of 8 Glasses`,
    pillLabel: 'Daily Medication / Iron / Vitamin',
    pillTaken: 'Taken today',
    pillNotTaken: 'Tap to mark taken',
    moodTitle: "Today's Mood",
    moods: {
      happy: 'Energetic 😊',
      calm: 'Calm 😌',
      tired: 'Tired 🥱',
      sad: 'Low Mood 🥺',
      crampy: 'Crampy 😣',
    },

    // Reminders
    enableReminders: 'Enable Period Reminders',
    remindersActive: 'Reminders Active (2 days before)',
  },

  bn: {
    appTitle: 'পিরিয়ড ট্র্যাকার',
    appSubtitle: 'সহজ, বুদ্ধিমান ও অফলাইন পিরিয়ড নির্দেশিকা',
    bengaliName: 'পিরিয়ড ট্র্যাকার',

    // Auth & Login
    welcomeTitle: 'সহজে নিজের পিরিয়ড সাইকেল ট্র্যাক করুন',
    welcomeSubtitle: 'স্মার্ট এআই পূর্বাভাস, অফলাইন স্বয়ংক্রিয় সিঙ্ক ও সম্পূর্ণ প্রাইভেসি।',
    loginWithGoogle: 'গুগল দিয়ে সাইন ইন করুন',
    loginPrompt: 'আপনার সমস্ত ডিভাইসে নিরাপদে সাইকেল ডাটা সিঙ্ক রাখতে সাইন ইন করুন।',
    loginOfflineNote: 'ইন্টারনেট না থাকলেও আপনি ডাটা সেভ করতে পারবেন। অনলাইন এলে নিজে থেকেই ক্লাউডে সিঙ্ক হয়ে যাবে।',
    logout: 'লগ আউট',

    // Status & Badges
    online: 'অনলাইন',
    offline: 'অফলাইন মোড',
    syncedCloud: 'ক্লাউডে সিঙ্কড',
    savingLocal: 'লোকালে সংরক্ষিত',

    // Dashboard & Predictions
    nextExpectedDate: 'পরবর্তী সম্ভাব্য পিরিয়ডের তারিখ',
    inDays: (days: number) => days === 0 ? 'আজকে সম্ভাব্য' : days < 0 ? `${Math.abs(days)} দিন বিলম্বিত` : `${days} দিন পর`,
    cycleDay: (day: number, total: number) => `${total} দিনের সাইকেলের ${day}তম দিন`,
    avgCycleLength: 'গড় সাইকেল দৈর্ঘ্য',
    daysCount: (days: number) => `${days} দিন`,
    lastPeriodStart: 'সর্বশেষ পিরিয়ড শুরু',
    fertileWindow: 'সম্ভাব্য ফার্টাইল (গর্ভধারণ) সময়',
    ovulationDay: 'সম্ভাব্য ডিম্বস্ফোটন (ওভিউলেশন) দিন',
    phases: {
      menstrual: 'মেনস্ট্রুয়াল ফেজ (পিরিয়ড)',
      follicular: 'ফলিকুলার ফেজ',
      ovulation: 'ওভিউলেশন (ডিম্বস্ফোটন) ফেজ',
      luteal: 'লিউটিয়াল ফেজ',
    },
    phaseDesc: {
      menstrual: 'পিরিয়ডের সময়। পর্যাপ্ত বিশ্রাম নিন ও প্রচুর পানি পান করুন।',
      follicular: 'শরীরে শক্তি বৃদ্ধি পাচ্ছে। এস্ট্রোজেন হরমোন বাড়ে।',
      ovulation: 'গর্ভধারণের সবচেয়ে উপযোগী সময়।',
      luteal: 'প্রোজেস্টেরন বাড়ে। পিএমএস (PMS) বা শারীরিক ক্লান্তি দেখা দিতে পারে।',
    },
    aiPredictionNotice: (count: number) => 
      count === 0
        ? 'এখনো কোনো ডাটা সেভ করা হয়নি। নিচের "পিরিয়ড এন্ট্রি যুক্ত করুন" এ ট্যাপ করে আপনার তারিখ দিন।'
        : count === 1 
        ? 'ডিফল্ট ২৮ দিনের অনুমান ব্যবহার করা হয়েছে (১টি রেকর্ড)। নির্ভুল এআই পূর্বাভাস পেতে আরও তারিখ যোগ করুন।'
        : `আপনার অতীতের ${count}টি সাইকেলের গড় সময় থেকে এআই দ্বারা হিসাবকৃত।`,
    noRecordsTitle: 'কোনো পিরিয়ড এন্ট্রি যোগ করা হয়নি',
    noRecordsSubtitle: 'সঠিক গণনা ও পূর্বাভাস পেতে আপনার শেষ পিরিয়ডের শুরুর তারিখ যোগ করুন।',

    // Navigation & Tabs
    tabDashboard: 'ড্যাশবোর্ড',
    tabCalendar: 'ক্যালেন্ডার',
    tabHistory: 'হিস্ট্রি',
    tabQuickLog: 'আজকের লগ',

    // Form & Modal
    logPeriodTitle: 'পিরিয়ড এন্ট্রি যুক্ত করুন',
    editPeriodTitle: 'পিরিয়ড এন্ট্রি এডিট করুন',
    formInstructionTip: '📌 টিপস: শুধুমাত্র পিরিয়ড শুরুর ১ম দিন নির্বাচন করুন এবং এটি কতদিন স্থায়ী (যেমন ৪ দিন) তা নির্ধারণ করুন। প্রতিদিন আলাদা এন্ট্রি দেওয়ার প্রয়োজন নেই!',
    startDateLabel: 'শুরুর তারিখ',
    durationLabel: 'স্থায়িত্ব (দিন)',
    flowLabel: 'প্রবাহের মাত্রা (Flow)',
    symptomsLabel: 'উপসর্গ (Symptoms)',
    notesLabel: 'নোট / কেমন অনুভব করছেন?',
    notesPlaceholder: 'যেমন: হালকা মাথাব্যথা, কুসুম গরম পানি খেয়েছি...',
    saveBtn: 'সংরক্ষণ করুন',
    updateBtn: 'আপডেট করুন',
    cancelBtn: 'বাতিল',
    deleteBtn: 'মুছে ফেলুন',
    confirmDelete: 'আপনি কি নিশ্চিত যে এই সাইকেল রেকর্ডটি মুছে ফেলতে চান?',

    // Flow Types
    flowTypes: {
      light: 'হালকা (Light)',
      medium: 'মাঝারি (Medium)',
      heavy: 'ভারী (Heavy)',
    },

    // Symptoms
    symptomsList: {
      cramps: 'পেট ব্যথা / ক্র্যাম্প',
      headache: 'মাথাব্যথা',
      bloating: 'পেট ফাঁপা',
      moodSwings: 'মিজাজ পরিবর্তন',
      fatigue: 'ক্লান্তি / অবসাদ',
      acne: 'ব্রণ / এ্যাকনে',
      backache: 'পিঠ ব্যথা',
      cravings: 'খাবারের স্পৃহা',
      nausea: 'বমি বমি ভাব',
    },

    // History
    historyTitle: 'পূর্ববর্তী পিরিয়ড রেকর্ডসমূহ',
    noHistory: 'এখনো কোনো রেকর্ড যুক্ত করা হয়নি।',
    addFirstLog: '"পিরিয়ড যুক্ত করুন" বাটনে ট্যাপ করে শুরুর তারিখ যোগ করুন!',
    durationDaysText: (days: number) => `${days} দিন স্থায়ী`,

    // Notifications & Toasts
    savedSuccess: 'পিরিয়ড রেকর্ড সফলভাবে সংরক্ষিত হয়েছে!',
    deletedSuccess: 'রেকর্ড মুছে ফেলা হয়েছে!',
    errorSaving: 'সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।',

    // PWA & Installation
    installApp: 'অ্যাপ ইনস্টল করুন',
    installTooltip: 'হোম স্ক্রিনে যুক্ত করে ইন্টারনেট ছাড়াও সহজে ব্যবহার করুন',
    installOnIos: 'আইফোনে ইনস্টল',
    iosInstallTitle: 'আইফোন / আইপ্যাডে ইনস্টল করুন',
    iosStep1: '১. সাফারি ব্রাউজারের নিচের শেয়ার (Share) বাটনে ট্যাপ করুন।',
    iosStep2: '২. নিচে স্ক্রল করে "Add to Home Screen" অপশন বেছে নিন।',
    close: 'বন্ধ করুন',
    offlineBannerText: 'অফলাইন মোড — সংরক্ষিত ক্যাশ ডাটা ব্যবহৃত হচ্ছে। অনলাইন হলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।',

    // Guest Mode & Login Enhancements
    continueAsGuest: 'লগইন ছাড়া গেস্ট হিসেবে ব্যবহার করুন',
    guestModeBadge: 'গেস্ট মোড (লোকাল)',
    syncGuestToCloud: 'গুগল অ্যাকাউন্টে ব্যাকআপ নিন',
    guestDataMigrated: 'আপনার লোকাল রেকর্ডগুলো সফলভাবে গুগল ক্লাউডে সিঙ্ক করা হয়েছে!',

    // Active Period In Progress
    periodActiveTitle: (day: number) => `আজ পিরিয়ডের ${day}ম দিন চলছে`,
    periodActiveSubtitle: 'পিরিয়ড ব্লিডিং ফেজ চলমান। কুসুম গরম পানি পান করুন ও পর্যাপ্ত বিশ্রাম নিন।',

    // Cycle Regularity
    regularityStatus: {
      regular: 'নিয়মিত সাইকেল (Regular)',
      irregular: 'অনিয়মিত সাইকেল (পার্থক্য > ৪ দিন)',
      insufficient: 'নিয়ম বিশ্লেষণ করতে ৩+ সাইকেল প্রয়োজন',
    },
    regularityTip: 'আপনার অতীতের সাইকেলগুলোর মধ্যে তারতম্য রয়েছে। এটি অব্যাহত থাকলে চিকিৎসকের পরামর্শ নিন।',

    // Modes
    modeTrack: 'পিরিয়ড ট্র্যাকিং',
    modeConceive: 'গর্ভধারণের চেষ্টা (TTC)',
    peakFertilityDay: 'সর্বোচ্চ ডিম্বস্ফোটন দিন',

    // Doctor Report
    exportDoctorReport: 'ডাক্তারের হেলথ রিপোর্ট',
    printPdfReport: 'প্রিন্ট / সেভ PDF রিপোর্ট',
    downloadCsv: 'CSV ডাটা ডাউনলোড',

    // Daily Wellness
    dailyWellnessTitle: 'আজকের সুস্থতা ও যত্ন',
    waterGlasses: (count: number) => `৮ গ্লাসের মধ্যে ${count} গ্লাস পানি`,
    pillLabel: 'দৈনিক ওষুধ / আয়রন / ভিটামিন',
    pillTaken: 'আজ খাওয়া হয়েছে',
    pillNotTaken: 'খাওয়া হলে টিক দিন',
    moodTitle: 'আজ কেমন বোধ করছেন?',
    moods: {
      happy: 'ভালো ও উদ্যমী 😊',
      calm: 'শান্ত 😌',
      tired: 'ক্লান্ত 🥱',
      sad: 'মন খারাপ 🥺',
      crampy: 'পেট ব্যথা 😣',
    },

    // Reminders
    enableReminders: 'পিরিয়ড নোটিফিকেশন চালু করুন',
    remindersActive: 'রিমাইন্ডার সক্রিয় (২ দিন আগে)',
  }
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.en;
}
