import { CycleRecord, PredictionResult, CyclePhase, CycleRegularity } from '../types';

/**
 * Format Date to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parse YYYY-MM-DD to Date object at local start of day
 */
export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Calculate difference in calendar days between two dates (dateA - dateB)
 */
export function diffInDays(dateA: Date, dateB: Date): number {
  const utc1 = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const utc2 = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc1 - utc2) / msPerDay);
}

/**
 * Add days to a date and return YYYY-MM-DD string
 */
export function addDays(dateStr: string, daysToAdd: number): string {
  const d = parseISODate(dateStr);
  d.setDate(d.getDate() + daysToAdd);
  return formatDateISO(d);
}

/**
 * Convert numbers/digits into Bengali digits
 */
export function toBengaliDigits(val: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

/**
 * Format a number or numeric string according to language
 */
export function formatNumber(val: number | string, lang: 'en' | 'bn'): string {
  if (lang === 'bn') {
    return toBengaliDigits(val);
  }
  return String(val);
}

/**
 * Format a date string in localized display format
 */
export function formatDisplayDate(dateStr: string, lang: 'en' | 'bn'): string {
  if (!dateStr) return '';
  const d = parseISODate(dateStr);
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  
  const day = d.getDate();
  const monthIndex = d.getMonth();
  const year = d.getFullYear();

  if (lang === 'bn') {
    return `${toBengaliDigits(day)} ${monthNamesBn[monthIndex]}, ${toBengaliDigits(year)}`;
  }
  return `${monthNamesEn[monthIndex]} ${day}, ${year}`;
}

/**
 * Core Smart AI Cycle Prediction Logic
 * Upgraded with:
 * 1. Recency Weighted Moving Average (more weight on recent 3 cycles)
 * 2. Active Period In-Progress Detection
 * 3. Cycle Regularity & Standard Deviation analysis
 */
export function calculateCyclePredictions(records: CycleRecord[]): PredictionResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const defaultResult: PredictionResult = {
    nextStartDate: formatDateISO(today),
    averageCycleLength: 28,
    lastStartDate: null,
    currentCycleDay: 1,
    currentPhase: 'follicular',
    daysUntilNext: 28,
    fertileWindowStart: null,
    fertileWindowEnd: null,
    estimatedOvulationDate: null,
    totalRecordsCount: records ? records.length : 0,
    isPeriodActive: false,
    activePeriodDay: 0,
    cycleRegularity: 'insufficient_data',
    standardDeviation: 0,
  };

  if (!records || records.length === 0) {
    return defaultResult;
  }

  // Sort records by startDate ascending
  const sorted = [...records].sort((a, b) => {
    return parseISODate(a.startDate).getTime() - parseISODate(b.startDate).getTime();
  });

  const latestRecord = sorted[sorted.length - 1];
  const lastStartDate = latestRecord.startDate;
  const lastDateObj = parseISODate(lastStartDate);

  let averageCycleLength = 28;
  let cycleRegularity: CycleRegularity = 'insufficient_data';
  let standardDeviation = 0;

  // Extract valid consecutive intervals
  const intervals: number[] = [];
  if (sorted.length >= 2) {
    for (let i = 1; i < sorted.length; i++) {
      const dPrev = parseISODate(sorted[i - 1].startDate);
      const dCurr = parseISODate(sorted[i].startDate);
      const diff = diffInDays(dCurr, dPrev);
      
      // Filter out unreasonable intervals (minimum 16 days, maximum 65 days)
      if (diff >= 16 && diff <= 65) {
        intervals.push(diff);
      }
    }
  }

  if (intervals.length > 0) {
    if (intervals.length === 1) {
      averageCycleLength = intervals[0];
      cycleRegularity = 'insufficient_data';
    } else if (intervals.length === 2) {
      averageCycleLength = Math.round((intervals[0] + intervals[1]) / 2);
      cycleRegularity = 'insufficient_data';
    } else {
      // 3 or more intervals: Use Recency Weighted Moving Average
      // Recent intervals get higher weights
      const recent = intervals.slice(-3); // last 3 intervals
      const older = intervals.slice(0, -3);

      let weightedSum = 0;
      let totalWeight = 0;

      if (older.length === 0) {
        // Exactly 3 intervals: 50% for newest, 30% for middle, 20% for oldest
        const weights = [0.20, 0.30, 0.50];
        recent.forEach((val, idx) => {
          weightedSum += val * weights[idx];
          totalWeight += weights[idx];
        });
      } else {
        // 70% total weight for recent 3, 30% divided among older
        const recentWeights = [0.15, 0.25, 0.30];
        recent.forEach((val, idx) => {
          weightedSum += val * recentWeights[idx];
          totalWeight += recentWeights[idx];
        });
        const olderWeightPerItem = 0.30 / older.length;
        older.forEach((val) => {
          weightedSum += val * olderWeightPerItem;
          totalWeight += olderWeightPerItem;
        });
      }

      averageCycleLength = Math.round(weightedSum / totalWeight);

      // Compute Standard Deviation for Regularity Check
      const simpleMean = intervals.reduce((acc, v) => acc + v, 0) / intervals.length;
      const variance = intervals.reduce((acc, v) => acc + Math.pow(v - simpleMean, 2), 0) / intervals.length;
      standardDeviation = Math.round(Math.sqrt(variance) * 10) / 10;

      // Clinical irregularity rules: std dev > 4.5 days or any cycle < 21 or > 35
      const hasExtremeCycle = intervals.some(c => c < 21 || c > 35);
      if (standardDeviation > 4.5 || hasExtremeCycle) {
        cycleRegularity = 'irregular';
      } else {
        cycleRegularity = 'regular';
      }
    }
  }

  // Next expected start date = latest start date + average cycle length
  const nextStartDate = addDays(lastStartDate, averageCycleLength);
  const nextDateObj = parseISODate(nextStartDate);

  // Days until next expected period from today
  const daysUntilNext = diffInDays(nextDateObj, today);

  // Current cycle day = days passed since last start date + 1
  const daysSinceLast = diffInDays(today, lastDateObj);
  const currentCycleDay = Math.max(1, daysSinceLast + 1);

  // Active Period Detection
  const duration = latestRecord.durationDays || 3;
  const isPeriodActive = daysSinceLast >= 0 && daysSinceLast < duration;
  const activePeriodDay = isPeriodActive ? daysSinceLast + 1 : 0;

  // Determine Current Cycle Phase
  let currentPhase: CyclePhase = 'follicular';

  if (isPeriodActive) {
    currentPhase = 'menstrual';
  } else if (currentCycleDay < averageCycleLength - 16) {
    currentPhase = 'follicular';
  } else if (currentCycleDay >= averageCycleLength - 16 && currentCycleDay <= averageCycleLength - 12) {
    currentPhase = 'ovulation';
  } else {
    currentPhase = 'luteal';
  }

  // Fertile window & Ovulation calculation
  // Ovulation typically occurs ~14 days before next period
  const ovulationDaysFromStart = Math.max(1, averageCycleLength - 14);
  const estimatedOvulationDate = addDays(lastStartDate, ovulationDaysFromStart);
  const fertileWindowStart = addDays(estimatedOvulationDate, -4); // 4 days prior
  const fertileWindowEnd = addDays(estimatedOvulationDate, 1);    // 1 day after

  return {
    nextStartDate,
    averageCycleLength,
    lastStartDate,
    currentCycleDay,
    currentPhase,
    daysUntilNext,
    fertileWindowStart,
    fertileWindowEnd,
    estimatedOvulationDate,
    totalRecordsCount: sorted.length,
    isPeriodActive,
    activePeriodDay,
    cycleRegularity,
    standardDeviation,
  };
}
