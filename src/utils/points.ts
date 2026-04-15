import { Intensity, INTENSITY_MULTIPLIERS } from '@/types/common';
import { WorkoutSession, ExerciseRecord, SetRecord } from '@/types/workout';
import { calculateWorkoutPoints } from './calculations';

/* ===== Calculate Points for a Completed Workout ===== */
export function computeSessionPoints(
  session: WorkoutSession,
  intensity: Intensity
): number {
  const durationMinutes = session.totalDuration / 60;
  return calculateWorkoutPoints(
    durationMinutes,
    intensity,
    session.completionPercentage
  );
}

/* ===== Calculate Completion Percentage ===== */
export function computeCompletionPercentage(
  exercises: ExerciseRecord[]
): number {
  if (exercises.length === 0) return 0;

  let totalPossible = 0;
  let totalAchieved = 0;

  for (const ex of exercises) {
    const totalSets = ex.sets.length;
    const completedSets = ex.sets.filter((s) => s.completed).length;

    totalPossible += totalSets;
    totalAchieved += completedSets;
  }

  if (totalPossible === 0) return 0;
  return Math.round((totalAchieved / totalPossible) * 100);
}

/* ===== Calculate Endurance Success ===== */
export function computeEnduranceSuccess(
  plannedMinutes: number,
  exercises: ExerciseRecord[]
): number {
  // Sum up actual time from exercise records
  let completedSeconds = 0;
  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (set.completed && set.duration) {
        completedSeconds += set.duration;
      }
    }
  }
  const completedMinutes = completedSeconds / 60;
  if (plannedMinutes <= 0) return completedMinutes > 0 ? 100 : 0;
  return Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100));
}

/* ===== Calculate Total Calories from Exercise Records ===== */
export function computeTotalCalories(exercises: ExerciseRecord[]): number {
  return exercises.reduce((sum, ex) => sum + ex.estimatedCalories, 0);
}

/* ===== Calculate Total Duration from Set Records ===== */
export function computeTotalDuration(exercises: ExerciseRecord[]): number {
  let totalSeconds = 0;
  for (const ex of exercises) {
    if (ex.startedAt && ex.completedAt) {
      const start = new Date(ex.startedAt).getTime();
      const end = new Date(ex.completedAt).getTime();
      if (end > start) {
        totalSeconds += Math.round((end - start) / 1000);
      }
    }
    // Fallback: sum set durations
    if (totalSeconds === 0) {
      for (const set of ex.sets) {
        if (set.completed && set.duration) {
          totalSeconds += set.duration;
        }
      }
    }
  }
  return totalSeconds;
}

/* ===== Calculate Total Completed Reps ===== */
export function computeTotalReps(exercises: ExerciseRecord[]): number {
  let total = 0;
  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (set.completed && set.reps) {
        total += set.reps;
      }
    }
  }
  return total;
}

/* ===== Calculate Total Completed Sets ===== */
export function computeTotalCompletedSets(exercises: ExerciseRecord[]): number {
  let total = 0;
  for (const ex of exercises) {
    total += ex.sets.filter((s) => s.completed).length;
  }
  return total;
}

/* ===== Get Workout Category Minutes ===== */
export function computeCategoryMinutes(
  exercises: Array<{ exerciseId: string; sets: SetRecord[]; estimatedCalories: number }>,
  exerciseCategoryMap: Record<string, string>
): {
  cardio: number;
  strength: number;
  flexibility: number;
  hiit: number;
} {
  const result = { cardio: 0, strength: 0, flexibility: 0, hiit: 0 };

  for (const ex of exercises) {
    const category = exerciseCategoryMap[ex.exerciseId] || 'strength';
    // Estimate minutes from calories using rough MET assumption
    // ~8 kcal/min for strength, ~10 for cardio, ~5 for flexibility, ~12 for HIIT
    let minutes = 0;
    if (category === 'cardio' && ex.estimatedCalories > 0) minutes = ex.estimatedCalories / 10;
    else if (category === 'hiit' && ex.estimatedCalories > 0) minutes = ex.estimatedCalories / 12;
    else if (category === 'flexibility' && ex.estimatedCalories > 0) minutes = ex.estimatedCalories / 5;
    else if (ex.estimatedCalories > 0) minutes = ex.estimatedCalories / 8;

    minutes = Math.round(minutes);

    if (category in result) {
      (result as Record<string, number>)[category] += minutes;
    }
  }

  return result;
}

/* ===== Points breakdown for display ===== */
export interface PointsBreakdown {
  basePoints: number;
  intensityBonus: number;
  completionBonus: number;
  totalPoints: number;
}

export function getPointsBreakdown(
  durationMinutes: number,
  intensity: Intensity,
  completionPercent: number
): PointsBreakdown {
  const basePoints = Math.round(durationMinutes * 2);
  const multiplier = INTENSITY_MULTIPLIERS[intensity];
  const intensityBonus = Math.round(basePoints * (multiplier - 1));
  const completionFactor = Math.max(0, completionPercent) / 100;
  const rawTotal = Math.round((basePoints + intensityBonus) * completionFactor);
  const completionBonus = rawTotal - Math.round((basePoints + intensityBonus) * (completionPercent >= 100 ? 1 : 0.8));
  const totalPoints = Math.max(0, rawTotal);

  return {
    basePoints,
    intensityBonus: Math.max(0, intensityBonus),
    completionBonus: Math.max(0, completionBonus),
    totalPoints,
  };
}
