import { getTodayISO, daysBetween } from '@/utils/dateUtils';

/* ===== Streak Calculation ===== */

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Calculate current and longest workout streaks from an array of unique date strings.
 * A streak means consecutive days with at least one workout.
 * Today counts if there's a workout today. Yesterday starts a streak if no workout today.
 */
export function calculateStreak(workoutDates: string[]): StreakResult {
  if (!workoutDates || workoutDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Deduplicate and sort descending (newest first)
  const uniqueDates = [...new Set(workoutDates)].sort(
    (a, b) => b.localeCompare(a)
  );

  const today = getTodayISO();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().split('T')[0];

  // Check if the most recent workout is today or yesterday
  const mostRecent = uniqueDates[0];
  let isCurrentStreakActive = false;

  if (mostRecent === today) {
    isCurrentStreakActive = true;
  } else if (mostRecent === yesterdayISO) {
    isCurrentStreakActive = true;
  }

  // Calculate all streaks by iterating sorted dates
  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = daysBetween(uniqueDates[i], uniqueDates[i - 1]);
    if (diff === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // Calculate current streak specifically
  let currentStreak = 0;
  if (isCurrentStreakActive) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = daysBetween(uniqueDates[i], uniqueDates[i - 1]);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

/**
 * Check if a given date is part of the current streak.
 */
export function isInCurrentStreak(
  date: string,
  workoutDates: string[]
): boolean {
  const { currentStreak } = calculateStreak(workoutDates);
  if (currentStreak === 0) return false;

  const uniqueDates = [...new Set(workoutDates)].sort(
    (a, b) => b.localeCompare(a)
  );
  if (uniqueDates.length === 0) return false;

  // The current streak covers the most recent `currentStreak` consecutive dates
  const streakStart = uniqueDates[currentStreak - 1];
  const streakEnd = uniqueDates[0];

  return date >= streakStart && date <= streakEnd;
}

/**
 * Get an array of dates that are part of the current streak (for UI highlighting).
 */
export function getCurrentStreakDates(
  workoutDates: string[]
): string[] {
  const { currentStreak } = calculateStreak(workoutDates);
  if (currentStreak === 0) return [];

  const uniqueDates = [...new Set(workoutDates)].sort(
    (a, b) => b.localeCompare(a)
  );

  return uniqueDates.slice(0, currentStreak);
}
