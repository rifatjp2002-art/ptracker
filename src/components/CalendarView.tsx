import React, { useState } from 'react';
import { CycleRecord, Language, PredictionResult } from '../types';
import { getTranslation } from '../translations';
import { parseISODate, formatDateISO, addDays } from '../utils/cycleCalculator';
import { ChevronLeft, ChevronRight, Sparkles, Calendar as CalendarIcon, Heart } from 'lucide-react';

interface CalendarViewProps {
  records: CycleRecord[];
  prediction: PredictionResult;
  language: Language;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  records,
  prediction,
  language,
  onSelectDate,
}) => {
  const t = getTranslation(language);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  const daysOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysOfWeekBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper set of period dates from logged records
  const loggedPeriodDates = new Set<string>();
  records.forEach(rec => {
    const dur = rec.durationDays || 3;
    for (let i = 0; i < dur; i++) {
      loggedPeriodDates.add(addDays(rec.startDate, i));
    }
  });

  // Predicted period dates
  const predictedPeriodDates = new Set<string>();
  if (prediction.nextStartDate) {
    const latestRecord = records.length > 0 ? records[records.length - 1] : null;
    const dur = latestRecord?.durationDays || 3; // Default 3 days predicted length
    for (let i = 0; i < dur; i++) {
      predictedPeriodDates.add(addDays(prediction.nextStartDate, i));
    }
  }

  // Fertile window dates
  const fertileDates = new Set<string>();
  if (prediction.fertileWindowStart && prediction.fertileWindowEnd) {
    let curr = prediction.fertileWindowStart;
    while (curr <= prediction.fertileWindowEnd) {
      fertileDates.add(curr);
      curr = addDays(curr, 1);
    }
  }

  // Days calculation for calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = formatDateISO(new Date());

  const toBnNum = (n: number) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]);

  return (
    <div className="bg-white dark:bg-[#1a1924] rounded-3xl p-5 sm:p-6 shadow-md shadow-pink-100/60 dark:shadow-none border border-pink-100/80 dark:border-pink-950/40 space-y-4">
      {/* Month Header Navigation */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          <span>
            {language === 'bn'
              ? `${monthNamesBn[month]} ${toBnNum(year)}`
              : `${monthNamesEn[month]} ${year}`}
          </span>
        </h3>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-pink-50 dark:hover:bg-pink-950/50 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-pink-50 dark:hover:bg-pink-950/50 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-600 dark:text-gray-400 flex-wrap pb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
          <span>{language === 'bn' ? 'পিরিয়ড তারিখ' : 'Period Logged'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-pink-200 dark:bg-pink-900/60 border border-dashed border-pink-500 inline-block" />
          <span>{language === 'bn' ? 'পূর্বাভাসকৃত পিরিয়ড' : 'Predicted Period'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-200 dark:bg-amber-900/60 border border-amber-400 inline-block" />
          <span>{language === 'bn' ? 'ফার্টাইল সময়' : 'Fertile Window'}</span>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase pb-1 border-b border-gray-100 dark:border-gray-800">
        {(language === 'bn' ? daysOfWeekBn : daysOfWeekEn).map(day => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Empty cells before 1st of month */}
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-10 sm:h-12" />
        ))}

        {/* Days 1 to daysInMonth */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateStr = formatDateISO(new Date(year, month, dayNum));

          const isLoggedPeriod = loggedPeriodDates.has(dateStr);
          const isPredictedPeriod = !isLoggedPeriod && predictedPeriodDates.has(dateStr);
          const isFertile = fertileDates.has(dateStr);
          const isToday = dateStr === todayStr;
          const isOvulationDay = prediction.estimatedOvulationDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`h-10 sm:h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer font-bold text-xs sm:text-sm active:scale-95 ${
                isLoggedPeriod
                  ? 'bg-rose-600 text-white shadow-xs shadow-rose-300 dark:shadow-none'
                  : isPredictedPeriod
                  ? 'bg-pink-100/80 dark:bg-pink-950/60 text-pink-900 dark:text-pink-200 border-2 border-dashed border-pink-400'
                  : isFertile
                  ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                  : 'hover:bg-pink-50/60 dark:hover:bg-pink-950/40 text-gray-800 dark:text-gray-200'
              } ${isToday ? 'ring-2 ring-pink-600 ring-offset-1 dark:ring-offset-gray-900 font-extrabold' : ''}`}
            >
              <span>{language === 'bn' ? toBnNum(dayNum) : dayNum}</span>

              {/* Little indicators */}
              {isOvulationDay && (
                <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
              )}
              {isLoggedPeriod && (
                <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
