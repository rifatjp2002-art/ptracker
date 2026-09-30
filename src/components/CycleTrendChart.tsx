import React from 'react';
import { CycleRecord, PredictionResult, Language } from '../types';
import { parseISODate, diffInDays, toBengaliDigits } from '../utils/cycleCalculator';
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

interface CycleTrendChartProps {
  records: CycleRecord[];
  prediction: PredictionResult;
  language: Language;
}

interface CycleIntervalItem {
  cycleNumber: number;
  startDate: string;
  endDate: string;
  days: number;
  status: 'normal' | 'short' | 'long';
  displayMonth: string;
}

export const CycleTrendChart: React.FC<CycleTrendChartProps> = ({
  records,
  prediction,
  language,
}) => {
  const isBn = language === 'bn';
  const toBnNum = (n: number | string) => toBengaliDigits(n);

  // Sort records ascending by startDate
  const sorted = [...records].sort(
    (a, b) => parseISODate(a.startDate).getTime() - parseISODate(b.startDate).getTime()
  );

  const monthNamesBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate intervals
  const intervals: CycleIntervalItem[] = [];
  if (sorted.length >= 2) {
    for (let i = 1; i < sorted.length; i++) {
      const prevDate = parseISODate(sorted[i - 1].startDate);
      const currDate = parseISODate(sorted[i].startDate);
      const days = diffInDays(currDate, prevDate);

      // Only include reasonable intervals (15 to 80 days)
      if (days >= 15 && days <= 80) {
        const mIdx = currDate.getMonth();
        const d = currDate.getDate();
        const displayMonth = isBn 
          ? `${toBnNum(d)} ${monthNamesBn[mIdx]}`
          : `${monthNamesEn[mIdx]} ${d}`;

        intervals.push({
          cycleNumber: intervals.length + 1,
          startDate: sorted[i - 1].startDate,
          endDate: sorted[i].startDate,
          days,
          status: days < 21 ? 'short' : days > 35 ? 'long' : 'normal',
          displayMonth,
        });
      }
    }
  }

  // Take the last 6 intervals for the trend
  const recentIntervals = intervals.slice(-6);

  // Min and Max stats
  const cycleLengths = recentIntervals.map(i => i.days);
  const minLength = cycleLengths.length > 0 ? Math.min(...cycleLengths) : 0;
  const maxLength = cycleLengths.length > 0 ? Math.max(...cycleLengths) : 0;
  const maxBarValue = Math.max(40, maxLength + 5);

  return (
    <div className="bg-white dark:bg-[#1a1924] rounded-3xl p-4 sm:p-6 border border-pink-100 dark:border-pink-950/40 shadow-xs space-y-4 text-gray-800 dark:text-gray-100 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <span>{isBn ? 'সাইকেল ট্রেন্ড ও অ্যানালিটিক্স' : 'Cycle Regularity & Trends'}</span>
              <span className="text-[10px] bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 font-bold px-2 py-0.5 rounded-full">
                {isBn ? 'বিগত ৩-৬ সাইকেল' : 'Past Cycles'}
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {isBn 
                ? 'আপনার মাসিক কতদিন পর পর হচ্ছে তার নিয়মিততা গ্রাফ' 
                : 'Visual chart tracking how regular your cycle lengths are'}
            </p>
          </div>
        </div>

        {/* Regularity Badge */}
        {recentIntervals.length >= 2 && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
              prediction.cycleRegularity === 'regular'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : prediction.cycleRegularity === 'irregular'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
            }`}
          >
            {prediction.cycleRegularity === 'regular' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isBn ? 'নিয়মিত সাইকেল' : 'Regular'}</span>
              </>
            ) : prediction.cycleRegularity === 'irregular' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{isBn ? 'কিছুটা ওঠানামা' : 'Fluctuating'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>{isBn ? 'স্বাভাবিক' : 'Normal'}</span>
              </>
            )}
          </span>
        )}
      </div>

      {recentIntervals.length === 0 ? (
        /* Empty State */
        <div className="py-6 px-4 bg-pink-50/40 dark:bg-pink-950/20 rounded-2xl border border-dashed border-pink-200 dark:border-pink-900/40 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/40 mx-auto flex items-center justify-center text-pink-600 dark:text-pink-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {isBn ? 'গ্রাফ দেখতে আরও এন্ট্রি প্রয়োজন' : 'More Entries Needed For Trend Chart'}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            {isBn
              ? 'কমপক্ষে ২টি আলাদা মাসের পিরিয়ডের শুরুর তারিখ যোগ করলে আপনার সাইকেলের দৈর্ঘ্য ও চার্ট স্বয়ংক্রিয়ভাবে তৈরি হবে।'
              : 'Add at least 2 consecutive period start dates to calculate interval lengths and regularity.'}
          </p>
        </div>
      ) : (
        /* Visual Bar Chart */
        <div className="space-y-3 pt-1">
          {/* Chart Container */}
          <div className="relative pt-6 pb-2 px-2 bg-gradient-to-b from-pink-50/30 to-transparent dark:from-pink-950/20 dark:to-transparent rounded-2xl border border-pink-100/60 dark:border-pink-950/30">
            {/* Clinical Normal Benchmark Line (28 days) */}
            <div 
              className="absolute left-0 right-0 border-b border-dashed border-pink-300 dark:border-pink-800 z-0 flex items-center justify-end pr-2"
              style={{
                bottom: `${(28 / maxBarValue) * 100}%`,
              }}
            >
              <span className="text-[9px] font-bold bg-white dark:bg-[#1a1924] px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400 shadow-2xs">
                {isBn ? 'গড় ২৮ দিন' : '28d Avg'}
              </span>
            </div>

            {/* Bars Grid */}
            <div className="grid grid-flow-col auto-cols-fr gap-2 sm:gap-4 items-end h-44 relative z-10">
              {recentIntervals.map((item, idx) => {
                const heightPercent = Math.min(100, Math.max(15, (item.days / maxBarValue) * 100));
                const isLatest = idx === recentIntervals.length - 1;

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    {/* Day Pill Label above bar */}
                    <span className="text-[11px] font-extrabold text-gray-800 dark:text-gray-100 mb-1 whitespace-nowrap">
                      {isBn ? `${toBnNum(item.days)} দিন` : `${item.days}d`}
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[42px] bg-pink-100/80 dark:bg-gray-800/80 rounded-t-xl overflow-hidden flex flex-col justify-end p-0.5 h-full">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 shadow-sm ${
                          isLatest
                            ? 'bg-gradient-to-t from-pink-600 to-rose-500 shadow-pink-500/25'
                            : item.status === 'normal'
                            ? 'bg-gradient-to-t from-pink-500/80 to-rose-400/80'
                            : 'bg-gradient-to-t from-amber-500 to-orange-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* X-axis Month Label */}
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1.5 truncate max-w-full text-center">
                      {item.displayMonth}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                {isBn ? 'গড় সাইকেল' : 'Average Cycle'}
              </p>
              <p className="text-sm font-extrabold text-pink-600 dark:text-pink-400 mt-0.5">
                {isBn ? `${toBnNum(prediction.averageCycleLength)} দিন` : `${prediction.averageCycleLength} Days`}
              </p>
            </div>

            <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                {isBn ? 'সর্বনিম্ন সাইকেল' : 'Shortest'}
              </p>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {isBn ? `${toBnNum(minLength)} দিন` : `${minLength} Days`}
              </p>
            </div>

            <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                {isBn ? 'সর্বোচ্চ সাইকেল' : 'Longest'}
              </p>
              <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                {isBn ? `${toBnNum(maxLength)} দিন` : `${maxLength} Days`}
              </p>
            </div>
          </div>

          {/* Medical Clinical Tip */}
          <div className="p-3 bg-pink-50/60 dark:bg-pink-950/30 rounded-2xl border border-pink-100/70 dark:border-pink-900/30 flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
            <Info className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              {isBn
                ? '💡 চিকিৎসাবিজ্ঞানের নিয়ম অনুযায়ী ২১ থেকে ৩৫ দিনের মধ্যে সাইকেলকে সম্পূর্ণ স্বাভাবিক ধরা হয়। হালকা ২-৩ দিনের তারতম্য স্বাভাবিক শারীরিক প্রক্রিয়ার অংশ।'
                : '💡 A cycle interval between 21 to 35 days is clinically considered regular and healthy.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
