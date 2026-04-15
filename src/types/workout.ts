import {
  MuscleGroup,
  Difficulty,
  Intensity,
  WorkoutStatus,
  TimerState,
} from './common';
import { Exercise } from './exercise';

/* ===== Exercise inside a Workout Plan ===== */
export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise; // populated from exercise library
  targetSets: number;
  targetReps?: number; // null if timed
  targetDuration?: number; // seconds, null if rep-based
  restDuration: number; // seconds after each set
  notes?: string;
  order: number; // 0-indexed position in workout
}

/* ===== Workout Plan Template ===== */
export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  category: string; // e.g. "Strength", "Cardio", "HIIT", "Flexibility"
  difficulty: Difficulty;
  intensity: Intensity;
  estimatedDuration: number; // minutes
  exercises: WorkoutExercise[];
  primaryMuscles: MuscleGroup[];
  isCustom: boolean; // true if user-created
  isFeatured: boolean; // true if shown on home "Challenge With Pro Coach"
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/* ===== Per-Set Record during a Workout Session ===== */
export interface SetRecord {
  setNumber: number;
  reps?: number; // completed reps (null if timed)
  duration?: number; // completed seconds (null if rep-based)
  weight?: number; // kg, for strength exercises
  completed: boolean;
  skipped: boolean;
}

/* ===== Per-Exercise Record during a Workout Session ===== */
export interface ExerciseRecord {
  workoutExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  sets: SetRecord[];
  estimatedCalories: number; // calories burned for this exercise in this session
  startedAt: string;
  completedAt: string | null;
  wasSkipped: boolean;
}

/* ===== Full Workout Session (after completion) ===== */
export interface WorkoutSession {
  id: string;
  workoutPlanId: string;
  workoutPlanName: string;
  status: WorkoutStatus;
  exercises: ExerciseRecord[];
  totalDuration: number; // seconds — actual time spent
  totalCalories: number;
  avgHeartRate: number; // estimated BPM
  maxHeartRate: number; // estimated BPM
  pointsEarned: number;
  completionPercentage: number; // 0-100
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  startedAt: string; // ISO 8601 datetime
  completedAt: string | null; // ISO 8601 datetime
  notes?: string;
  createdAt: string;
}

/* ===== Active Workout State (live during workout) ===== */
export interface ActiveWorkoutState {
  workoutPlan: WorkoutPlan;
  session: WorkoutSession;
  currentExerciseIndex: number;
  currentSetIndex: number;
  timerState: TimerState;
  elapsedSeconds: number; // seconds for current exercise
  totalElapsedSeconds: number; // seconds for entire workout
  isResting: boolean;
  restRemainingSeconds: number;
  isPaused: boolean;
}

/* ===== Workout Summary (derived from session) ===== */
export interface WorkoutSummary {
  session: WorkoutSession;
  totalExercises: number;
  completedExercises: number;
  skippedExercises: number;
  totalSetsPlanned: number;
  totalSetsCompleted: number;
  totalRepsCompleted: number;
  personalRecords: PersonalRecord[];
  muscleGroupsWorked: MuscleGroup[];
}

/* ===== Personal Record ===== */
export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  field: 'maxWeight' | 'maxReps' | 'maxDuration' | 'maxTotalVolume';
  value: number;
  previousValue: number;
  unit: string;
  achievedAt: string; // ISO 8601 datetime
}

/* ===== Workout Filters ===== */
export interface WorkoutFilters {
  search: string;
  categories: string[];
  difficulties: Difficulty[];
  muscles: MuscleGroup[];
  customOnly: boolean;
  featuredOnly: boolean;
}

/* ===== Default Workout Filter Factory ===== */
export function createDefaultWorkoutFilters(): WorkoutFilters {
  return {
    search: '',
    categories: [],
    difficulties: [],
    muscles: [],
    customOnly: false,
    featuredOnly: false,
  };
}

/* ===== Workout Filter Logic ===== */
export function filterWorkoutPlans(
  plans: WorkoutPlan[],
  filters: WorkoutFilters
): WorkoutPlan[] {
  return plans.filter((plan) => {
    if (filters.search) {
      const query = filters.search.toLowerCase();
      if (
        !plan.name.toLowerCase().includes(query) &&
        !plan.description.toLowerCase().includes(query) &&
        !plan.tags.some((t) => t.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(plan.category)
    ) {
      return false;
    }

    if (
      filters.difficulties.length > 0 &&
      !filters.difficulties.includes(plan.difficulty)
    ) {
      return false;
    }

    if (filters.muscles.length > 0) {
      if (!filters.muscles.some((m) => plan.primaryMuscles.includes(m))) {
        return false;
      }
    }

    if (filters.customOnly && !plan.isCustom) {
      return false;
    }

    if (filters.featuredOnly && !plan.isFeatured) {
      return false;
    }

    return true;
  });
}

/* ===== Initialize Active Workout ===== */
export function initActiveWorkout(
  plan: WorkoutPlan
): ActiveWorkoutState {
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  const exerciseRecords: ExerciseRecord[] = plan.exercises.map((we) => ({
    workoutExerciseId: we.id,
    exerciseId: we.exerciseId,
    exerciseName: we.exercise.name,
    sets: Array.from({ length: we.targetSets }, (_, i) => ({
      setNumber: i + 1,
      reps: undefined,
      duration: undefined,
      weight: undefined,
      completed: false,
      skipped: false,
    })),
    estimatedCalories: 0,
    startedAt: now,
    completedAt: null,
    wasSkipped: false,
  }));

  const session: WorkoutSession = {
    id: crypto.randomUUID(),
    workoutPlanId: plan.id,
    workoutPlanName: plan.name,
    status: WorkoutStatus.ACTIVE,
    exercises: exerciseRecords,
    totalDuration: 0,
    totalCalories: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    pointsEarned: 0,
    completionPercentage: 0,
    date: today,
    startedAt: now,
    completedAt: null,
    createdAt: now,
  };

  return {
    workoutPlan: plan,
    session,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    timerState: TimerState.IDLE,
    elapsedSeconds: 0,
    totalElapsedSeconds: 0,
    isResting: false,
    restRemainingSeconds: 0,
    isPaused: false,
  };
}
