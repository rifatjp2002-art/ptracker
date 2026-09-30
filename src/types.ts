export type Language = 'en' | 'bn';

export type FlowIntensity = 'light' | 'medium' | 'heavy';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export type AppMode = 'track' | 'conceive';

export type CycleRegularity = 'regular' | 'irregular' | 'insufficient_data';

export interface CycleRecord {
  id?: string;
  userId: string;
  startDate: string; // ISO YYYY-MM-DD
  durationDays: number; // e.g., 5 days
  flow?: FlowIntensity;
  symptoms?: string[];
  notes?: string;
  createdAt?: string; // ISO string
}

export interface PredictionResult {
  nextStartDate: string; // YYYY-MM-DD
  averageCycleLength: number; // in days
  lastStartDate: string | null;
  currentCycleDay: number; // e.g. Day 12
  currentPhase: CyclePhase;
  daysUntilNext: number; // e.g. 5 days remaining
  fertileWindowStart: string | null; // YYYY-MM-DD
  fertileWindowEnd: string | null; // YYYY-MM-DD
  estimatedOvulationDate: string | null; // YYYY-MM-DD
  totalRecordsCount: number;
  isPeriodActive: boolean; // whether period is happening today
  activePeriodDay: number; // 1-based day of current bleeding period
  cycleRegularity: CycleRegularity;
  standardDeviation: number;
}

export interface DailyWellness {
  date: string; // YYYY-MM-DD
  waterGlasses: number; // 0 to 8+
  pillTaken: boolean;
  mood?: 'happy' | 'calm' | 'tired' | 'sad' | 'crampy';
}

export interface SymptomOption {
  id: string;
  labelEn: string;
  labelBn: string;
  icon: string;
}
