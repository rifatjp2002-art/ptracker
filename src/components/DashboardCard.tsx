import React, { useState, useEffect } from 'react';
import { PredictionResult, Language, AppMode, DailyWellness } from '../types';
import { getTranslation } from '../translations';
import { formatDisplayDate } from '../utils/cycleCalculator';
import { 
  Calendar, 
  Plus, 
  Sparkles, 
  HeartPulse, 
  Info, 
  Droplets, 
  Pill, 
  Smile, 
  Activity, 
  Baby, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardCardProps {
  prediction: PredictionResult;
  language: Language;
  onOpenLogModal: () => void;
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  prediction,
  language,
  onOpenLogModal,
  appMode,
  onModeChange,
}) => {
  const t = getTranslation(language);
  const todayStr = new Date().toISOString().slice(0, 10);

  // Daily Wellness local state
  const [wellness, setWellness] = useState<DailyWellness>(() => {
    const saved = localStorage.getItem(`wellness_${todayStr}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      date: todayStr,
      waterGlasses: 0,
      pillTaken: false,
      mood: undefined,
    };
  });

  // Save wellness whenever updated
  useEffect(() => {
    localStorage.setItem(`wellness_${todayStr}`, JSON.stringify(wellness));
  }, [wellness, todayStr]);

  const handleAddWater = () => {
    setWellness(prev => ({
      ...prev,
      waterGlasses: Math.min(12, prev.waterGlasses + 1),
    }));
  };

  const handleResetWater = () => {
    setWellness(prev => ({
      ...prev,
      waterGlasses: 0,
    }));
  };

  const handleTogglePill = () => {
    setWellness(prev => ({
      ...prev,
      pillTaken: !prev.pillTaken,
    }));
  };

  const handleSelectMood = (m: 'happy' | 'calm' | 'tired' | 'sad' | 'crampy') => {
    setWellness(prev => ({
      ...prev,
      mood: prev.mood === m ? undefined : m,
    }));
  };

  // Phase color badge mappings
  const phaseColors = {
    menstrual: 'bg-rose-100 text-rose-800 border-rose-300',
    follicular: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    ovulation: 'bg-amber-100 text-amber-800 border-amber-300',
    luteal: 'bg-purple-100 text-purple-800 border-purple-300',
  };

  const phaseTitle = t.phases[prediction.currentPhase];
  const phaseDescription = t.phaseDesc[prediction.currentPhase];

  // Percentage completion of current cycle
  const cycleProgressPercent = Math.min(
    100,
    Math.round((prediction.currentCycleDay / prediction.averageCycleLength) * 100)
  );

  return (
    <div className="space-y-4">
      {/* Mode Switcher Pill */}
      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-2xl border border-pink-100 shadow-xs">
        <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-pink-600" />
          <span>{language === 'bn' ? 'ফোকাস মোড:' : 'Focus Mode:'}</span>
        </span>
        <div className="flex items-center gap-1 bg-pink-50/80 p-1 rounded-xl border border-pink-100">
          <button
            onClick={() => onModeChange('track')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              appMode === 'track'
                ? 'bg-[#E91E63] text-white shadow-xs'
                : 'text-gray-600 hover:text-pink-600'
            }`}
          >
            {t.modeTrack}
          </button>
          <button
            onClick={() => onModeChange('conceive')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              appMode === 'conceive'
                ? 'bg-[#E91E63] text-white shadow-xs'
                : 'text-gray-600 hover:text-pink-600'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>{t.modeConceive}</span>
          </button>
        </div>
      </div>

      {/* Main Expected Period Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden bg-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-pink-100/80 border border-pink-100 flex flex-col items-center justify-center text-center space-y-4"
      >
        <div className="w-full h-2 bg-[#E91E63] opacity-20 absolute top-0 left-0 rounded-t-[32px]" />

        {/* Active Period In-Progress Banner */}
        {prediction.isPeriodActive ? (
          <div className="w-full bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold animate-pulse">
            <Droplets className="w-4 h-4 text-rose-600 fill-rose-500" />
            <span>{t.periodActiveTitle(prediction.activePeriodDay)}</span>
          </div>
        ) : null}

        {/* Top Header Label */}
        <div className="space-y-1">
          <h2 className="text-[#E91E63] text-xs sm:text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#E91E63]" />
            <span>
              {appMode === 'conceive' && prediction.estimatedOvulationDate
                ? (language === 'bn' ? 'সম্ভাব্য ওভিউলেশন দিন' : 'Next Ovulation Window')
                : t.nextExpectedDate}
            </span>
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            {language === 'bn' ? 'পরবর্তী সম্ভাব্য চক্রের পূর্বাভাস' : 'Estimated next cycle phase'}
          </p>
        </div>

        {/* Giant Bold Countdown Typography */}
        <div className="py-2">
          {prediction.totalRecordsCount === 0 ? (
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-[#E91E63]">
                {language === 'bn' ? 'তারিখ যোগ করুন' : 'Add First Date'}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
                {t.noRecordsSubtitle}
              </p>
            </div>
          ) : prediction.isPeriodActive ? (
            <div className="space-y-1">
              <div className="text-6xl sm:text-7xl font-black leading-none text-rose-600 tracking-tight">
                {prediction.activePeriodDay}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-700">
                {language === 'bn' ? 'পিরিয়ডের দিন' : 'Day of Period'}
              </div>
              <p className="text-xs text-rose-500 font-medium pt-1 max-w-xs mx-auto">
                {t.periodActiveSubtitle}
              </p>
            </div>
          ) : (
            <>
              <div className="text-7xl sm:text-[90px] font-black leading-none text-[#E91E63] tracking-tighter">
                {Math.abs(prediction.daysUntilNext) < 10 ? `0${Math.abs(prediction.daysUntilNext)}` : Math.abs(prediction.daysUntilNext)}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-700 mt-1">
                {prediction.daysUntilNext < 0
                  ? (language === 'bn' ? 'দিন বিলম্বিত' : 'Days Late')
                  : (language === 'bn' ? 'দিন বাকি' : 'Days Left')}
              </div>
              <div className="text-sm text-gray-400 font-semibold mt-0.5">
                {t.inDays(prediction.daysUntilNext)}
              </div>
            </>
          )}
        </div>

        {/* Estimated Date & Progress Bar */}
        <div className="w-full pt-4 border-t border-gray-100 space-y-3">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-extrabold text-gray-700">
              {formatDisplayDate(prediction.nextStartDate, language)}
            </p>
            <p className="text-xs text-gray-400">
              {t.lastPeriodStart}:{' '}
              {prediction.lastStartDate
                ? formatDisplayDate(prediction.lastStartDate, language)
                : language === 'bn' ? 'কোন রেকর্ড নেই' : 'No records'}
            </p>
          </div>

          {/* Cycle Progress Bar */}
          <div className="space-y-1 w-full max-w-xs mx-auto">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
              <span>{t.cycleDay(prediction.currentCycleDay, prediction.averageCycleLength)}</span>
              <span>{cycleProgressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cycleProgressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-[#E91E63] rounded-full shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Quick Action Button: Log Period */}
        <div className="pt-2 w-full flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onOpenLogModal}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-2xl bg-[#E91E63] hover:bg-[#D81B60] text-white font-bold text-sm shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>{t.logPeriodTitle}</span>
          </button>

          <div className="text-xs text-[#E91E63] font-bold bg-pink-50 px-4 py-2.5 rounded-2xl border border-pink-100">
            {t.avgCycleLength}: <span>{t.daysCount(prediction.averageCycleLength)}</span>
          </div>
        </div>

        {/* Regularity Notice Badge */}
        {prediction.cycleRegularity !== 'insufficient_data' ? (
          <div className="pt-2 flex items-center gap-2 text-xs">
            {prediction.cycleRegularity === 'regular' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.regularityStatus.regular} (±{prediction.standardDeviation} {language === 'bn' ? 'দিন' : 'd'})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200" title={t.regularityTip}>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                {t.regularityStatus.irregular}
              </span>
            )}
          </div>
        ) : prediction.totalRecordsCount > 0 ? (
          <div className="pt-2 flex items-center gap-2 text-xs">
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-600 font-medium border border-gray-200"
              title={language === 'bn' ? 'সাইকেল নিয়মিত নাকি অনিয়মিত তা নিখুঁতভাবে বিশ্লেষণ করতে কমপক্ষে ৩টি সাইকেল ব্যবধান (৪টি রেকর্ড) প্রয়োজন।' : 'Need 4 period entries to analyze regularity'}
            >
              <Info className="w-3.5 h-3.5 text-pink-500" />
              <span>
                {language === 'bn'
                  ? `সাইকেলের ধরণ: আরও ${Math.max(1, 4 - prediction.totalRecordsCount)}টি রেকর্ড প্রয়োজন (${prediction.totalRecordsCount}/৪)`
                  : `Cycle Regularity: ${prediction.totalRecordsCount}/4 records logged`}
              </span>
            </span>
          </div>
        ) : null}
      </motion.div>

      {/* Daily Wellness Tracker Widget */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-pink-100 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-pink-500" />
            <span>{t.dailyWellnessTitle}</span>
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            {formatDisplayDate(todayStr, language)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Water Intake Tracker */}
          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                <Droplets className="w-5 h-5 fill-sky-200" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">{t.waterGlasses(wellness.waterGlasses)}</p>
                <p className="text-[10px] text-sky-600 font-medium">
                  {wellness.waterGlasses >= 8 ? (language === 'bn' ? '🎉 লক্ষ্য পূরণ হয়েছে!' : '🎉 Target reached!') : (language === 'bn' ? 'হাইড্রেটেড থাকুন' : 'Stay hydrated')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleAddWater}
                className="px-2.5 py-1 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-700 active:scale-95 transition-all cursor-pointer"
              >
                +১
              </button>
              {wellness.waterGlasses > 0 && (
                <button
                  onClick={handleResetWater}
                  className="px-2 py-1 text-gray-400 hover:text-gray-600 text-[10px] rounded-md cursor-pointer"
                  title="Reset"
                >
                  ০
                </button>
              )}
            </div>
          </div>

          {/* Daily Pill / Vitamin Check */}
          <div
            onClick={handleTogglePill}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              wellness.pillTaken
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-gray-50 border-gray-200/80 text-gray-700 hover:bg-pink-50/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  wellness.pillTaken ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">{t.pillLabel}</p>
                <p className="text-[10px] opacity-80">
                  {wellness.pillTaken ? t.pillTaken : t.pillNotTaken}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={wellness.pillTaken}
              onChange={() => {}}
              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Mood Selector */}
        <div className="pt-1">
          <p className="text-xs font-semibold text-gray-500 mb-1.5">{t.moodTitle}:</p>
          <div className="grid grid-cols-5 gap-1.5">
            {(['happy', 'calm', 'tired', 'sad', 'crampy'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => handleSelectMood(m)}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer active:scale-95 ${
                  wellness.mood === m
                    ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                }`}
              >
                {t.moods[m]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cycle Phase & Fertile Window Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Phase Card */}
        <div className="bg-white p-4 rounded-2xl border border-pink-100/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <HeartPulse className="w-4 h-4 text-pink-500" />
              <span>{language === 'bn' ? 'বর্তমান ফেজ' : 'Current Phase'}</span>
            </span>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${phaseColors[prediction.currentPhase]}`}
            >
              {phaseTitle}
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed pt-1">
            {phaseDescription}
          </p>
        </div>

        {/* Fertile Window Card */}
        <div className="bg-white p-4 rounded-2xl border border-pink-100/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t.fertileWindow}</span>
            </span>
            {appMode === 'conceive' && (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                TTC Focus
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-gray-900">
            {prediction.fertileWindowStart && prediction.fertileWindowEnd
              ? `${formatDisplayDate(prediction.fertileWindowStart, language)} - ${formatDisplayDate(prediction.fertileWindowEnd, language)}`
              : language === 'bn' ? 'তথ্য অপর্যাপ্ত' : 'Log a period to estimate'}
          </p>
          {prediction.estimatedOvulationDate && (
            <p className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 inline-block">
              {t.ovulationDay}: {formatDisplayDate(prediction.estimatedOvulationDate, language)}
            </p>
          )}
        </div>
      </div>

      {/* AI Prediction Notice Banner */}
      <div className="bg-pink-50/70 border border-pink-200/60 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-pink-900">
        <Info className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
        <p className="leading-snug font-medium">
          {t.aiPredictionNotice(prediction.totalRecordsCount)}
        </p>
      </div>
    </div>
  );
};
