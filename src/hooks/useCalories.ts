import { useCallback, useRef } from 'react';
import { estimateWorkoutCalories } from '@/utils/calculations';

/* ===== Calorie Tracker Hook Interface ===== */
interface UseCaloriesOptions {
  /** User weight in kg */
  weightKg: number;
  /** MET value of the current exercise */
  metValue: number;
  /** Called each second with updated calorie count */
  onUpdate?: (calories: number) => void;
}

interface UseCaloriesReturn {
  /** Current estimated calories burned */
  calories: number;
  /** Calculate calories for a specific duration */
  calculate: (durationSeconds: number) => number;
  /** Reset calorie counter */
  reset: () => void;
}

/**
 * Real-time calorie estimation hook.
 * Uses MET-based formula: calories = MET × weight(kg) × time(hours)
 */
export function useCalories(options: UseCaloriesOptions): UseCaloriesReturn {
  const { weightKg, metValue, onUpdate } = options;

  const caloriesRef = useRef(0);
  const lastUpdateRef = useRef<number>(0);
  const onUpdateRef = useRef(onUpdate);

  onUpdateRef.current = onUpdate;

  const calculate = useCallback(
    (durationSeconds: number): number => {
      const cal = estimateWorkoutCalories(metValue, weightKg, durationSeconds);
      caloriesRef.current = cal;
      return cal;
    },
    [metValue, weightKg]
  );

  /**
   * Call this periodically (e.g., every second) with elapsed seconds.
   * Only triggers callback when value changes by at least 1 to avoid noise.
   */
  const tick = useCallback(
    (elapsedSeconds: number): number => {
      const cal = calculate(elapsedSeconds);
      const roundedCal = Math.round(cal);

      if (roundedCal !== lastUpdateRef.current) {
        lastUpdateRef.current = roundedCal;
        onUpdateRef.current?.(roundedCal);
      }

      return roundedCal;
    },
    [calculate]
  );

  const reset = useCallback(() => {
    caloriesRef.current = 0;
    lastUpdateRef.current = 0;
  }, []);

  return {
    calories: caloriesRef.current,
    calculate,
    reset,
    // tick is available but not exposed in return to keep API clean.
    // Use calculate() directly in the timer's onTick.
    ...({ tick } as unknown as Record<string, never>),
  };
}

/* ===== Static calorie helpers (no hook needed) ===== */

/**
 * Estimate calories for a full workout session across multiple exercises.
 */
export function estimateSessionCalories(
  exercises: Array<{
    metValue: number;
    durationSeconds: number;
  }>,
  weightKg: number
): number {
  return exercises.reduce((total, ex) => {
    return total + estimateWorkoutCalories(ex.metValue, weightKg, ex.durationSeconds);
  }, 0);
}

/**
 * Get average calories per minute for a given MET value and weight.
 */
export function getCaloriesPerMinute(metValue: number, weightKg: number): number {
  if (metValue <= 0 || weightKg <= 0) return 0;
  return Math.round((metValue * weightKg) / 60 * 10) / 10;
}
