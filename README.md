# 🌸 পিরিয়ড ট্র্যাকার — Period Tracker PWA

<p align="center">
  <img src="public/icon.svg" alt="Period Tracker Logo" width="120" height="120" />
</p>

<p align="center">
  <strong>সহজ, বুদ্ধিমান ও ১০০% অফলাইন সাপোর্টেড পিরিয়ড ও সাইকেল ট্র্যাকার ওয়েব অ্যাপ</strong><br>
  A modern, bilingual (Bengali & English) Period & Ovulation Tracker Progressive Web App (PWA) with offline persistence, smart cycle predictions, and Google Cloud sync.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4.1-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PWA-Ready-E91E63?logo=pwa&logoColor=white" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Offline-100%25_Supported-success?logo=offline&logoColor=white" alt="Offline Supported" />
  <img src="https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Language-বাংলা_%7C_English-rose" alt="Bilingual" />
</p>

---

## 📖 সারসংক্ষেপ (Overview)

**পিরিয়ড ট্র্যাকার (Period Tracker)** একটি মার্জিত, ব্যবহারকারী-বান্ধব এবং সম্পূর্ণ সুরক্ষিত প্রগ্রেসিভ ওয়েব অ্যাপ (PWA)। এটি বিশেষভাবে বাংলা ও ইংরেজি উভয় ভাষার ব্যবহারকারীদের জন্য তৈরি। 

অ্যাপটির সবচেয়ে বড় সুবিধা হলো এটি **১০০% অফলাইনেও চমৎকারভাবে কাজ করে**। ইন্টারনেট সংযোগ না থাকলেও আপনি সাইকেল ডাটা যোগ করতে পারবেন, ক্যালেন্ডার দেখতে পারবেন এবং লক্ষণসমূহ ট্র্যাক করতে পারবেন। পরবর্তীতে ইন্টারনেট পেলে এটি স্বয়ংক্রিয়ভাবে ক্লাউডের সাথে সিঙ্ক হয়ে যায়।

---

## ✨ মূল বৈশিষ্ট্যসমূহ (Key Features)

### 📲 ১. পূর্ণাঙ্গ PWA ও ইন-অ্যাপ ইনস্টলেশন (Progressive Web App)
- **ওয়ান-ক্লিক ইনস্টল:** কোনো অ্যাপ স্টোর ছাড়াই সরাসরি ব্রাউজার থেকে অ্যান্ড্রয়েড, আইফোন বা কম্পিউটারে অ্যাপের মতো ইনস্টল করা যায়।
- **হোম স্ক্রিন শর্টকাট ও স্প্ল্যাশ স্ক্রিন:** স্ট্যান্ডার্ড 192x192, 512x512 মাস্কেবল আইকন ও ব্যাকগ্রাউন্ড সহ দেশীয় মোবাইল অ্যাপের অভিজ্ঞতা।
- **আইওএস (iOS) গাইড:** আইফোন/আইপ্যাড ব্যবহারকারীদের জন্য সাফারি ব্রাউজার থেকে সরাসরি ইনস্টল করার স্পষ্ট পপআপ নির্দেশনা।

### ⚡ ২. ১০০% অফলাইন সাপোর্ট (Offline-First Architecture)
- **লোকাল ক্যাশিং:** ফায়ারবেস ফায়ারস্টোরের `persistentLocalCache` ও সার্ভিস ওয়ার্কার (`sw.js`) এর সাহায্যে ইন্টারনেট সংযোগ বিচ্ছিন্ন থাকলেও অ্যাপ পুরো গতিতে কাজ করে।
- **অফলাইন স্ট্যাটাস ও নোটিফিকেশন:** ইন্টারনেট চলে গেলে স্ক্রিনে হালকা অফলাইন নোটিফিকেশন ব্যানার দৃশ্যমান হয়।
- **স্বয়ংক্রিয় ক্লাউড সিঙ্ক:** আবার অনলাইন হওয়া মাত্রই লোকাল ডাটা ক্লাউডে নিরাপদে সেভ হয়ে যায়।

### 🧠 ৩. স্মার্ট সাইকেল প্রেডিকশন (Smart AI Cycle Predictions)
- **পরবর্তী পিরিয়ডের সম্ভাব্য দিন গণনা:** আপনার অতীতের পিরিয়ড চক্রের গড় দিন বিশ্লেষণ করে পরবর্তী পিরিয়ডের সময় নিখুঁতভাবে পূর্বাভাস দেয়।
- **ওভিউলেশন ও ফার্টাইল উইন্ডো:** গর্ভধারণের উপযুক্ত সময় ও ডিম্বস্ফোটনের আনুমানিক দিন স্বয়ংক্রিয়ভাবে ক্যালেন্ডারে দেখায়।
- **চক্রের পর্যায় (Cycle Phases):** মেনস্ট্রুয়াল ফেজ, ফলিকুলার ফেজ, ওভিউলেশন ফেজ এবং লিউটিয়াল ফেজ সম্পর্কিত স্বাস্থ্যকর টিপস।

### 🩸 ৪. সহজ সাইকেল এন্ট্রি ও লক্ষণ ট্র্যাকিং
- **একক এন্ট্রি সিস্টেম:** প্রতিদিন আলাদা করে এন্ট্রি দিতে হয় না! শুধু পিরিয়ড শুরুর ১ম দিন নির্বাচন করে স্থায়িত্বের দিন (যেমন ৪ দিন) দিলে ক্যালেন্ডার স্বয়ংক্রিয়ভাবে পুরো সময়টি প্রদর্শন করে।
- **ফ্লো ইনটেনসিটি:** হালকা (Light), মাঝারি (Medium), বা ভারী (Heavy) রক্তপ্রবাহ নির্বাচন।
- **উপসর্গসমূহ:** পেট ব্যথা / ক্র্যাম্প, মাথাব্যথা, পেট ফাঁপা, মেজাজ পরিবর্তন, অবসাদ, ব্রণ ইত্যাদি সংরক্ষণ।
- **ব্যক্তিগত নোট:** প্রতিদিনের শারীরিক অনুভূতি ও তথ্য লিখে রাখার সুবিধা।

### 🌐 ৫. দ্বিভাষিক ইন্টারফেস (Bilingual: বাংলা ও English)
- এক ক্লিকেই সম্পূর্ণ অ্যাপের ভাষা বাংলা থেকে ইংরেজিতে বা ইংরেজি থেকে বাংলায় রূপান্তর।
- ব্যবহারকারীর পছন্দের ভাষা স্বয়ংক্রিয়ভাবে সেভ থাকে।

### 🔒 ৬. নিরাপদ গুগল লগইন ও গেস্ট মোড (Guest Mode & Cloud Sync)
- **গেস্ট হিসেবে তাৎক্ষণিক শুরু:** গুগল লগইন ছাড়াও সরাসরি গেস্ট মোডে সম্পূর্ণ অ্যাপ ব্যবহার করা যায়। ডাটা সম্পূর্ণ ডিভাইসের লোকাল স্টোরেজে থাকে।
- **স্বয়ংক্রিয় ক্লাউড মাইগ্রেশন:** পরবর্তীতে গুগল দিয়ে সাইন ইন করলে লোকাল ডাটা স্বয়ংক্রিয়ভাবে ক্লাউডে সিঙ্ক হয়ে যায়।

### 🩺 ৭. চিকিৎসকের জন্য PDF / CSV রিপোর্ট (Doctor Consultation Export)
- হিস্ট্রি স্ক্রিন থেকে এক ক্লিকেই বিগত সাইকেলের গড় সময়, সাইকেল নিয়মিত কিনা, রক্তপ্রবাহ এবং উপসর্গসমূহের একটি মার্জিত **A4 প্রিন্টেবল PDF রিপোর্ট** বা **CSV ফাইল** ডাউনলোড করা যায়।

### 💧 ৮. দৈনিক সুস্থতা চেকলিস্ট (Daily Wellness & Habit Tracker)
- প্রতিদিন ৮ গ্লাস পানি পানের ট্র্যাকার (Water Tracker), আয়রন বা জন্মনিয়ন্ত্রণ পিল খাওয়ার চেকলিস্ট এবং মেজাজ (Mood) নির্বাচনের সহজ উইজেট।

### 🎯 ৯. ফোকাস মোড সুইচিং (Track Cycle vs TTC)
- **পিরিয়ড ট্র্যাকিং:** নিয়মিত সাইকেল পর্যবেক্ষণ।
- **গর্ভধারণের চেষ্টা (Trying to Conceive):** ওভিউলেশন ও সর্বোচ্চ ফার্টাইল উইন্ডো হাইলাইট।

### 🔔 ১০. ব্রাউজার রিমাইন্ডার (Local Period Notifications)
- পরবর্তী সম্ভাব্য পিরিয়ডের ১ বা ২ দিন আগে ব্রাউজারে নোটিফিকেশন অ্যালার্ট।
- প্রতিটি ব্যবহারকারীর ডাটা ফায়ারস্টোর সিকিউরিটি রুলসের মাধ্যমে সম্পূর্ণ এনক্রিপ্টেড ও সুরক্ষিত।

---

## 💡 ব্যবহারের সঠিক নিয়ম (How to Use Correctly)

> **📌 গুরুত্বপূর্ণ টিপ:**
> পিরিয়ডের ক্ষেত্রে আপনাকে **প্রতিদিন আলাদা আলাদা এন্ট্রি যোগ করতে হবে না**!
> 
> ১. যেদিন আপনার পিরিয়ড শুরু হবে, ক্যালেন্ডারে বা `+` বাটনে চাপ দিয়ে **শুধুমাত্র শুরুর ১ম দিনটি** নির্বাচন করুন।
> ২. স্থায়িত্বের ঘরে আনুমানিক দিন (যেমন ৪ দিন) দিন। ক্যালেন্ডারে পরবর্তী ৪ দিন স্বয়ংক্রিয়ভাবে লাল রঙে মার্ক হয়ে যাবে।
> ৩. যদি পিরিয়ডের দিন বাড়ে (যেমন ৪ দিনের জায়গায় ৬ দিন হয়), তবে নতুন করে এন্ট্রি না দিয়ে **প্রথম দিনের এন্ট্রিটিতে ক্লিক করে দিন সংখ্যা ৪ থেকে বাড়িয়ে ৬ করে সেভ করুন**। 
> ৪. এতে আপনার অতীতের এন্ট্রিগুলো ক্লিন থাকবে এবং প্রেডিকশন অ্যালগরিদম একদম নিখুঁত কাজ করবে।

---

## 📱 কীভাবে PWA হিসেবে ইনস্টল করবেন (How to Install PWA)

| প্ল্যাটফর্ম | ইনস্টলেশন পদ্ধতি |
| :--- | :--- |
| **অ্যান্ড্রয়েড (Chrome / Edge)** | অ্যাপ ওপেন করলে উপরে বা ব্যানারে **"অ্যাপ ইনস্টল করুন"** বাটনে ট্যাপ করুন। অথবা ব্রাউজারের থ্রি-ডট (⋮) মেনু থেকে **"Install app"** চাপুন। |
| **আইফোন / আইপ্যাড (Safari)** | অ্যাপের **"আইফোনে ইনস্টল"** চাপুন। নির্দেশনামতে সাফারির নিচের **Share (শেয়ার)** বাটনে চাপ দিয়ে নিচে স্ক্রল করে **"Add to Home Screen"** সিলেক্ট করুন। |
| **কম্পিউটার (Chrome / Edge)** | ব্রাউজারের অ্যাড্রেস বারের ডানপাশে ডাউনলোড আইকনে ক্লিক করে **"Install Period Tracker"** নির্বাচন করুন। |

---

## 🛠️ প্রযুক্তি কাঠামো (Tech Stack)

- **Frontend Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/) with `@tailwindcss/vite`
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Offline & PWA:** `vite-plugin-pwa`, Custom Service Worker, Web App Manifest
- **Backend & Auth:** [Firebase v12](https://firebase.google.com/) (Google Authentication & Cloud Firestore with offline cache)
- **Design System:** Bold Typography with eye-comfort soft pastel pink palette

---

## 📂 প্রোজেক্ট ডিরেক্টরি কাঠামো (Project Structure)

```text
├── public/
│   ├── icon.svg                      # ভেক্টর অ্যাপ আইকন
│   ├── favicon-32x32.png             # ব্রাউজার ট্যাব ফেভআইকন
│   ├── apple-touch-icon.png          # আইওএস হোম স্ক্রিন আইকন (180x180)
│   ├── pwa-192x192.png               # অ্যান্ড্রয়েড PWA আইকন
│   ├── pwa-512x512.png               # হাই-রেস PWA আইকন
│   ├── pwa-maskable-512x512.png      # অ্যান্ড্রয়েড অ্যাডাপটিভ মাস্কেবল আইকন
│   ├── manifest.json                 # Web App Manifest কনফিগারেশন
│   └── sw.js                         # অফলাইন ক্যাশিং সার্ভিস ওয়ার্কার
├── src/
│   ├── components/
│   │   ├── Header.tsx                # টপ বার, লোগো, অনলাইন স্ট্যাটাস, ইনস্টল ও ভাষা পরিবর্তন
│   │   ├── DashboardCard.tsx         # পরবর্তী পিরিয়ড কাউন্টডাউন, স্বাস্থ্য ফেজ ও এআই প্রেডিকশন
│   │   ├── CalendarView.tsx          # পিরিয়ড ও ওভিউলেশন সাইকেল ক্যালেন্ডার
│   │   ├── HistoryList.tsx           # পূর্ববর্তী পিরিয়ড হিস্ট্রি ও ফিল্টারিং
│   │   ├── CycleFormModal.tsx        # পিরিয়ড লগিং, ফ্লো, লক্ষণ ও নোটস ইনপুট মডাল
│   │   ├── LoginScreen.tsx           # গুগল লগইন স্ক্রিন ও পরিচিতি
│   │   ├── PWAInstallButton.tsx      # অ্যান্ড্রয়েড/আইওএস PWA ইনস্টলেশন হ্যান্ডলার
│   │   └── OfflineIndicator.tsx      # অফলাইন কানেকশন ফ্ল্যাশ টোস্ট
│   ├── hooks/
│   │   └── usePWAInstall.ts          # PWA BeforeInstallPrompt ও আইওএস ডিটেকশন হুক
│   ├── utils/
│   │   └── cycleCalculator.ts        # সাইকেল প্রেডিকশন ও গাণিতিক ক্যালকুলেটর
│   ├── App.tsx                       # মূল রিয়্যাক্ট কম্পোনেন্ট ও রিয়েলটাইম ফায়ারবেস লিসেনার
│   ├── firebase.ts                   # ফায়ারস্টোর অফলাইন পারসিস্টেন্স ও গুগল অথ ইনিশিয়ালাইজেশন
│   ├── translations.ts               # বাংলা ও ইংরেজি সম্পূর্ণ ডিকশনারি
│   └── types.ts                      # টাইপস্ক্রিপ্ট ডাটা মডেল ইন্টারফেস
├── firebase-applet-config.example.json# ফায়ারবেস কনফিগ টেমপ্লেট
├── firestore.rules                   # ফায়ারস্টোর সিকিউরিটি রুলস
├── vite.config.ts                    # ভাইট প্লাগইন ও PWA ওয়ার্কবক্স কনফিগারেশন
└── package.json
```

---

## 🚀 লোকাল সেটআপ ও রান করার নির্দেশিকা (Getting Started)

### ১. ক্লোন করুন (Clone repository):
```bash
git clone https://github.com/your-username/period-tracker-pwa.git
cd period-tracker-pwa
```

### ২. ডিপেন্ডেন্সি ইনস্টল করুন (Install dependencies):
```bash
npm install
```

### ৩. ফায়ারবেস কনফিগারেশন (Configure Firebase):
`firebase-applet-config.example.json` ফাইলটিকে `firebase-applet-config.json` নামে কপি করুন অথবা আপনার নিজস্ব ফায়ারবেস প্রজেক্টের ক্রিডেনশিয়াল বসিয়ে দিন:

```json
{
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-project-id.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "your-sender-id"
}
```

> **টিপ:** আপনি ফায়ারবেস কনসোলে গিয়ে Authentication (Google Provider) এবং Cloud Firestore ডাটাবেজ সক্রিয় করে নিবেন।

### ৪. ডেভেলপমেন্ট সার্ভার চালু করুন (Run locally):
```bash
npm run dev
```
ব্রাউজারে `http://localhost:3000` ওপেন করুন।

### ৫. প্রোডাকশন বিল্ড তৈরি করুন (Build for production):
```bash
npm run build
```
বিল্ড ফাইলগুলো `dist/` ফোল্ডারে তৈরি হবে।

---

## 🌐 ডিপ্লয়মেন্ট (Deployment)

এই প্রজেক্টটি যেকোনো স্ট্যাটিক হোস্টিং বা ক্লাউড প্ল্যাটফর্মে সরাসরি ডিপ্লয় করা যায়:

- **Vercel / Netlify:** আপনার গিটহাব রিপোজিটরি কানেক্ট করুন এবং Build Command হিসেবে `npm run build` ও Output Directory হিসেবে `dist` সিলেক্ট করুন।
- **Firebase Hosting:** 
  ```bash
  npm run build
  firebase deploy
  ```
- **GitHub Pages:** ভাইট কনফিগারেশনের বেস পাথ সেট করে GitHub Actions দিয়ে খুব সহজেই GitHub Pages-এ হোস্ট করতে পারবেন।

---

## 📄 লাইসেন্স (License)

এই প্রজেক্টটি [MIT License](LICENSE) এর আওতাভুক্ত — নির্দ্বিধায় ব্যক্তিগত বা প্রাতিষ্ঠানিক কাজে ব্যবহার এবং পরিবর্তন করতে পারেন।

---

<p align="center">
  তৈরি করা হয়েছে যত্ন ও ভালোবাসা দিয়ে ❤️ স্বাস্থ্য সচেতন নারীদের সুবিধার জন্য।
</p>
