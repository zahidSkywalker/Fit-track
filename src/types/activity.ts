import { Intensity, WeekDay } from './common';

/* ===== Single Day Activity Snapshot ===== */
export interface DailyStats {
  id: string;
  userId: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  totalWorkoutDuration: number; // seconds
  totalCalories: number;
  totalSteps: number;
  totalPoints: number;
  workoutsCompleted: number;
  workoutsPlanned: number;
  cardioMinutes: number;
  strengthMinutes: number;
  flexibilityMinutes: number;
  hiitMinutes: number;
  goalCompletionPercent: number; // 0-100
  enduranceSuccessPercent: number; // 0-100
  avgHeartRate: number;
  maxHeartRate: number;
  createdAt: string;
  updatedAt: string;
}

/* ===== Weekly Points Record ===== */
export interface WeeklyPoints {
  id: string;
  userId: string;
  weekStartDate: string; // Monday date (YYYY-MM-DD)
  totalPoints: number;
  targetPoints: number; // weekly point goal
  completionPercent: number; // 0-100
  dailyBreakdown: Record<WeekDay, number>;
  createdAt: string;
  updatedAt: string;
}

/* ===== Points History Entry (for charting) ===== */
export interface PointsRecord {
  date: string; // YYYY-MM-DD
  points: number;
}

/* ===== Calorie History Entry (for charting) ===== */
export interface CalorieRecord {
  date: string; // YYYY-MM-DD
  calories: number;
}

/* ===== Duration History Entry (for charting) ===== */
export interface DurationRecord {
  date: string; // YYYY-MM-DD
  minutes: number;
}

/* ===== Muscle Training Frequency ===== */
export interface MuscleFrequency {
  muscleGroup: string; // MuscleGroup value
  count: number; // number of times trained in period
  lastTrained: string | null; // YYYY-MM-DD
}

/* ===== Default Daily Stats Factory ===== */
export function createDefaultDailyStats(
  userId: string,
  date: string,
  plannedWorkouts: number = 1
): DailyStats {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    date,
    totalWorkoutDuration: 0,
    totalCalories: 0,
    totalSteps: 0,
    totalPoints: 0,
    workoutsCompleted: 0,
    workoutsPlanned: plannedWorkouts,
    cardioMinutes: 0,
    strengthMinutes: 0,
    flexibilityMinutes: 0,
    hiitMinutes: 0,
    goalCompletionPercent: 0,
    enduranceSuccessPercent: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/* ===== Default Weekly Points Factory ===== */
export function createDefaultWeeklyPoints(
  userId: string,
  weekStartDate: string,
  targetPoints: number = 2400
): WeeklyPoints {
  const now = new Date().toISOString();
  const dailyBreakdown: Record<WeekDay, number> = {
    mon: 0,
    tue: 0,
    wed: 0,
    thu: 0,
    fri: 0,
    sat: 0,
    sun: 0,
  };

  return {
    id: crypto.randomUUID(),
    userId,
    weekStartDate,
    totalPoints: 0,
    targetPoints,
    completionPercent: 0,
    dailyBreakdown,
    createdAt: now,
    updatedAt: now,
  };
}

/* ===== Compute Intensity from Heart Rate ===== */
export function getIntensityFromHeartRate(
  heartRate: number,
  maxHeartRate: number
): Intensity {
  const percent = (heartRate / maxHeartRate) * 100;
  if (percent < 50) return 'light' as Intensity;
  if (percent < 65) return 'moderate' as Intensity;
  if (percent < 80) return 'hard' as Intensity;
  return 'extreme' as Intensity;
}
