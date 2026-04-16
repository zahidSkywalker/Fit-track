import { create } from 'zustand';
import type {
  WorkoutPlan,
  WorkoutSession,
  ActiveWorkoutState,
  ExerciseRecord,
  SetRecord,
  PersonalRecord,
  WorkoutSummary,
  WorkoutExercise,
} from '@/types/workout';
import { WorkoutStatus, TimerState, Intensity } from '@/types/common';
import {
  getWorkoutPlan,
  getAllWorkoutPlans,
  getCustomWorkoutPlans,
  getFeaturedWorkoutPlans,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan as dbDeleteWorkoutPlan,
  saveWorkoutSession,
  getWorkoutSession,
  getAllWorkoutSessions,
  getWorkoutSessionsByDate,
  getCompletedWorkoutSessions,
  getWorkoutSessionsInRange,
  deleteWorkoutSession as dbDeleteWorkoutSession,
  savePersonalRecord,
  getPersonalRecord,
  getAllPersonalRecords,
} from '@/db/workoutDb';
import { initActiveWorkout } from '@/types/workout';
import {
  computeCompletionPercentage,
  computeTotalCalories,
  computeTotalDuration,
  computeTotalReps,
  computeTotalCompletedSets,
  computeSessionPoints,
} from '@/utils/points';
import { estimateExerciseHeartRate } from '@/utils/calculations';
import { getTodayISO } from '@/utils/dateUtils';
import { generateId, safeJsonStringify } from '@/utils/helpers';
import { useUserStore } from './useUserStore';
import { addPoints } from '@/db/activityDb';
import { updateDailyStatsPartial, getTodayStats } from '@/db/activityDb';

/* ===== Store State ===== */
interface WorkoutState {
  // Library
  workoutPlans: WorkoutPlan[];
  customPlans: WorkoutPlan[];
  featuredPlans: WorkoutPlan[];
  plansLoading: boolean;

  // Active workout
  activeWorkout: ActiveWorkoutState | null;

  // History
  sessions: WorkoutSession[];
  sessionsLoading: boolean;

  // Personal records
  personalRecords: PersonalRecord[];

  // Actions — Library
  loadWorkoutPlans: () => Promise<void>;
  loadCustomPlans: () => Promise<void>;
  loadFeaturedPlans: () => Promise<void>;
  getPlanById: (id: string) => Promise<WorkoutPlan | undefined>;
  saveCustomPlan: (plan: WorkoutPlan) => Promise<string>;
  removePlan: (id: string) => Promise<void>;

  // Actions — Active Workout
  startWorkout: (planId: string) => Promise<void>;
  startWorkoutFromPlan: (plan: WorkoutPlan) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  updateTimerTick: (elapsedForExercise: number, totalElapsed: number) => void;
  completeSet: (reps?: number, duration?: number, weight?: number) => void;
  skipSet: () => void;
  skipExercise: () => void;
  goToNextExercise: () => void;
  goToPreviousExercise: () => void;
  goToExercise: (index: number) => void;
  finishWorkout: () => Promise<WorkoutSummary | null>;
  cancelWorkout: () => void;

  // Actions — History
  loadSessions: () => Promise<void>;
  loadSessionsByDate: (date: string) => Promise<void>;
  loadSessionsInRange: (start: string, end: string) => Promise<void>;
  getSessionById: (id: string) => Promise<WorkoutSession | undefined>;
  removeSession: (id: string) => Promise<void>;

  // Actions — PRs
  loadPersonalRecords: () => Promise<void>;

  // Reset
  resetActiveWorkout: () => void;
}

/* ===== Store ===== */
export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workoutPlans: [],
  customPlans: [],
  featuredPlans: [],
  plansLoading: false,
  activeWorkout: null,
  sessions: [],
  sessionsLoading: false,
  personalRecords: [],

  // ===== Library =====
  loadWorkoutPlans: async () => {
    set({ plansLoading: true });
    try {
      const plans = await getAllWorkoutPlans();
      set({ workoutPlans: plans, plansLoading: false });
    } catch (err) {
      console.error('[WorkoutStore] loadWorkoutPlans failed:', err);
      set({ plansLoading: false });
    }
  },

  loadCustomPlans: async () => {
    try {
      const plans = await getCustomWorkoutPlans();
      set({ customPlans: plans });
    } catch (err) {
      console.error('[WorkoutStore] loadCustomPlans failed:', err);
    }
  },

  loadFeaturedPlans: async () => {
    try {
      const plans = await getFeaturedWorkoutPlans();
      set({ featuredPlans: plans });
    } catch (err) {
      console.error('[WorkoutStore] loadFeaturedPlans failed:', err);
    }
  },

  getPlanById: async (id: string) => {
    return getWorkoutPlan(id);
  },

  saveCustomPlan: async (plan: WorkoutPlan) => {
    await createWorkoutPlan(plan);
    await get().loadCustomPlans();
    await get().loadWorkoutPlans();
    return plan.id;
  },

  removePlan: async (id: string) => {
    await dbDeleteWorkoutPlan(id);
    await get().loadCustomPlans();
    await get().loadWorkoutPlans();
  },

  // ===== Active Workout =====
  startWorkout: async (planId: string) => {
    const plan = await getWorkoutPlan(planId);
    if (!plan) {
      console.error(`[WorkoutStore] Plan not found: ${planId}`);
      return;
    }
    get().startWorkoutFromPlan(plan);
  },

  startWorkoutFromPlan: (plan: WorkoutPlan) => {
    const active = initActiveWorkout(plan);
    active.timerState = TimerState.RUNNING;
    set({ activeWorkout: active });
  },

  pauseWorkout: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        timerState: TimerState.PAUSED,
        isPaused: true,
      },
    });
  },

  resumeWorkout: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        timerState: TimerState.RUNNING,
        isPaused: false,
      },
    });
  },

  updateTimerTick: (elapsedForExercise: number, totalElapsed: number) => {
    const { activeWorkout } = get();
    if (!activeWorkout || activeWorkout.isPaused) return;

    const aw = { ...activeWorkout };
    aw.elapsedSeconds = elapsedForExercise;
    aw.totalElapsedSeconds = totalElapsed;

    // Estimate calories and heart rate for current exercise
    const currentExRecord = aw.session.exercises[aw.currentExerciseIndex];
    if (currentExRecord && !currentExRecord.wasSkipped) {
      const we = aw.workoutPlan.exercises[aw.currentExerciseIndex];
      const user = useUserStore.getState().user;

      if (user) {
        // Calorie estimation
        const cal = we.exercise.metValue * user.weight * (elapsedForExercise / 3600);
        currentExRecord.estimatedCalories = Math.round(cal);

        // Heart rate estimation
        const elapsedMin = totalElapsed / 60;
        const hr = estimateExerciseHeartRate(
          user.age,
          aw.workoutPlan.intensity,
          elapsedMin
        );
        aw.session.avgHeartRate = Math.round(hr);
        aw.session.maxHeartRate = Math.max(aw.session.maxHeartRate, Math.round(hr));
      }
    }

    // Update total duration
    aw.session.totalDuration = totalElapsed;

    set({ activeWorkout: aw });
  },

  completeSet: (reps?: number, duration?: number, weight?: number) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const aw = { ...activeWorkout };
    const exRecord = { ...aw.session.exercises[aw.currentExerciseIndex] };
    const sets = [...exRecord.sets];

    if (aw.currentSetIndex < sets.length) {
      sets[aw.currentSetIndex] = {
        ...sets[aw.currentSetIndex],
        reps,
        duration,
        weight,
        completed: true,
        skipped: false,
      };

      exRecord.sets = sets;
      aw.session.exercises[aw.currentExerciseIndex] = exRecord;
    }

    set({ activeWorkout: aw });
  },

  skipSet: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const aw = { ...activeWorkout };
    const exRecord = { ...aw.session.exercises[aw.currentExerciseIndex] };
    const sets = [...exRecord.sets];

    if (aw.currentSetIndex < sets.length) {
      sets[aw.currentSetIndex] = {
        ...sets[aw.currentSetIndex],
        completed: false,
        skipped: true,
      };
      exRecord.sets = sets;
      aw.session.exercises[aw.currentExerciseIndex] = exRecord;
    }

    set({ activeWorkout: aw });
  },

  skipExercise: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const aw = { ...activeWorkout };
    const exRecord = { ...aw.session.exercises[aw.currentExerciseIndex] };
    exRecord.wasSkipped = true;
    exRecord.completedAt = new Date().toISOString();
    exRecord.sets = exRecord.sets.map((s) => ({ ...s, skipped: true }));
    aw.session.exercises[aw.currentExerciseIndex] = exRecord;

    // Move to next
    if (aw.currentExerciseIndex < aw.workoutPlan.exercises.length - 1) {
      aw.currentExerciseIndex++;
      aw.currentSetIndex = 0;
      aw.elapsedSeconds = 0;
    }

    set({ activeWorkout: aw });
  },

  goToNextExercise: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const aw = { ...activeWorkout };
    if (aw.currentExerciseIndex < aw.workoutPlan.exercises.length - 1) {
      // Complete current exercise timestamp
      const exRecord = { ...aw.session.exercises[aw.currentExerciseIndex] };
      if (!exRecord.completedAt) {
        exRecord.completedAt = new Date().toISOString();
      }
      aw.session.exercises[aw.currentExerciseIndex] = exRecord;

      aw.currentExerciseIndex++;
      aw.currentSetIndex = 0;
      aw.elapsedSeconds = 0;
    }
    set({ activeWorkout: aw });
  },

  goToPreviousExercise: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const aw = { ...activeWorkout };
    if (aw.currentExerciseIndex > 0) {
      aw.currentExerciseIndex--;
      aw.currentSetIndex = 0;
      aw.elapsedSeconds = 0;
    }
    set({ activeWorkout: aw });
  },

  goToExercise: (index: number) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    if (index < 0 || index >= activeWorkout.workoutPlan.exercises.length) return;

    const aw = { ...activeWorkout };
    aw.currentExerciseIndex = index;
    aw.currentSetIndex = 0;
    aw.elapsedSeconds = 0;
    set({ activeWorkout: aw });
  },

  finishWorkout: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return null;

    const aw = { ...activeWorkout };

    // Finalize current exercise
    const currentEx = { ...aw.session.exercises[aw.currentExerciseIndex] };
    if (!currentEx.completedAt) {
      currentEx.completedAt = new Date().toISOString();
    }
    aw.session.exercises[aw.currentExerciseIndex] = currentEx;

    // Calculate totals
    const completionPct = computeCompletionPercentage(aw.session.exercises);
    const totalCal = computeTotalCalories(aw.session.exercises);
    const totalDur = aw.totalElapsedSeconds || computeTotalDuration(aw.session.exercises);

    aw.session.status = WorkoutStatus.COMPLETED;
    aw.session.totalDuration = totalDur;
    aw.session.totalCalories = totalCal;
    aw.session.completionPercentage = completionPct;
    aw.session.completedAt = new Date().toISOString();

    // Calculate points
    const points = computeSessionPoints(aw.session, aw.workoutPlan.intensity);
    aw.session.pointsEarned = points;

    // Save session
    await saveWorkoutSession(aw.session);

    // Check and save personal records
    const user = useUserStore.getState().user;
    const newPRs: PersonalRecord[] = [];
    if (user) {
      for (const exRecord of aw.session.exercises) {
        if (exRecord.wasSkipped) continue;

        // Check max weight
        const maxWeightSet = exRecord.sets
          .filter((s) => s.completed && s.weight && s.weight > 0)
          .sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];

        if (maxWeightSet && maxWeightSet.weight) {
          const existing = await getPersonalRecord(user.id, exRecord.exerciseId, 'maxWeight');
          if (!existing || maxWeightSet.weight > existing.value) {
            const pr: PersonalRecord = {
              id: generateId(),
              userId: user.id,
              exerciseId: exRecord.exerciseId,
              exerciseName: exRecord.exerciseName,
              field: 'maxWeight',
              value: maxWeightSet.weight,
              previousValue: existing?.value || 0,
              unit: 'kg',
              achievedAt: new Date().toISOString(),
            };
            await savePersonalRecord(pr);
            newPRs.push(pr);
          }
        }

        // Check max reps (for exercises without weight)
        const maxRepSet = exRecord.sets
          .filter((s) => s.completed && s.reps && !s.weight)
          .sort((a, b) => (b.reps || 0) - (a.reps || 0))[0];

        if (maxRepSet && maxRepSet.reps) {
          const existing = await getPersonalRecord(user.id, exRecord.exerciseId, 'maxReps');
          if (!existing || maxRepSet.reps > existing.value) {
            const pr: PersonalRecord = {
              id: generateId(),
              userId: user.id,
              exerciseId: exRecord.exerciseId,
              exerciseName: exRecord.exerciseName,
              field: 'maxReps',
              value: maxRepSet.reps,
              previousValue: existing?.value || 0,
              unit: 'reps',
              achievedAt: new Date().toISOString(),
            };
            await savePersonalRecord(pr);
            newPRs.push(pr);
          }
        }

        // Check max duration (for timed exercises)
        const maxDurSet = exRecord.sets
          .filter((s) => s.completed && s.duration && s.duration > 0)
          .sort((a, b) => (b.duration || 0) - (a.duration || 0))[0];

        if (maxDurSet && maxDurSet.duration) {
          const existing = await getPersonalRecord(user.id, exRecord.exerciseId, 'maxDuration');
          if (!existing || maxDurSet.duration > existing.value) {
            const pr: PersonalRecord = {
              id: generateId(),
              userId: user.id,
              exerciseId: exRecord.exerciseId,
              exerciseName: exRecord.exerciseName,
              field: 'maxDuration',
              value: maxDurSet.duration,
              previousValue: existing?.value || 0,
              unit: 'sec',
              achievedAt: new Date().toISOString(),
            };
            await savePersonalRecord(pr);
            newPRs.push(pr);
          }
        }
      }
    }

    // Update daily stats
    if (user) {
      const todayStat = await getTodayStats(user.id);
      const durationMin = totalDur / 60;
      await updateDailyStatsPartial(user.id, getTodayISO(), {
        totalWorkoutDuration: todayStat.totalWorkoutDuration + totalDur,
        totalCalories: todayStat.totalCalories + totalCal,
        workoutsCompleted: todayStat.workoutsCompleted + 1,
        goalCompletionPercent: Math.min(100,
          Math.round(((todayStat.workoutsCompleted + 1) / todayStat.workoutsPlanned) * 100)
        ),
        avgHeartRate: aw.session.avgHeartRate,
        maxHeartRate: Math.max(todayStat.maxHeartRate, aw.session.maxHeartRate),
      });

      // Add points
      await addPoints(user.id, points);
    }

    // Build summary
    const totalExercises = aw.workoutPlan.exercises.length;
    const completedExercises = aw.session.exercises.filter(
      (e) => !e.wasSkipped && e.sets.some((s) => s.completed)
    ).length;
    const skippedExercises = aw.session.exercises.filter((e) => e.wasSkipped).length;
    const totalSetsPlanned = aw.workoutPlan.exercises.reduce(
      (sum, we) => sum + we.targetSets, 0
    );
    const totalSetsCompleted = computeTotalCompletedSets(aw.session.exercises);
    const totalRepsCompleted = computeTotalReps(aw.session.exercises);

    const muscleGroupsWorked = [
      ...new Set(
        aw.workoutPlan.exercises
          .filter((_, i) => !aw.session.exercises[i].wasSkipped)
          .flatMap((we) => we.exercise.primaryMuscles)
      ),
    ];

    const summary: WorkoutSummary = {
      session: aw.session,
      totalExercises,
      completedExercises,
      skippedExercises,
      totalSetsPlanned,
      totalSetsCompleted,
      totalRepsCompleted,
      personalRecords: newPRs,
      muscleGroupsWorked: muscleGroupsWorked as any,
    };

    // Clear active workout
    set({ activeWorkout: null });

    // Refresh sessions list
    get().loadSessions();
    get().loadPersonalRecords();
    useUserStore.getState().refreshProfile();

    return summary;
  },

  cancelWorkout: () => {
    set({ activeWorkout: null });
  },

  // ===== History =====
  loadSessions: async () => {
    set({ sessionsLoading: true });
    try {
      const sessions = await getAllWorkoutSessions();
      set({ sessions, sessionsLoading: false });
    } catch (err) {
      console.error('[WorkoutStore] loadSessions failed:', err);
      set({ sessionsLoading: false });
    }
  },

  loadSessionsByDate: async (date: string) => {
    try {
      const sessions = await getWorkoutSessionsByDate(date);
      set({ sessions });
    } catch (err) {
      console.error('[WorkoutStore] loadSessionsByDate failed:', err);
    }
  },

  loadSessionsInRange: async (start: string, end: string) => {
    try {
      const sessions = await getWorkoutSessionsInRange(start, end);
      set({ sessions });
    } catch (err) {
      console.error('[WorkoutStore] loadSessionsInRange failed:', err);
    }
  },

  getSessionById: async (id: string) => {
    return getWorkoutSession(id);
  },

  removeSession: async (id: string) => {
    await dbDeleteWorkoutSession(id);
    await get().loadSessions();
  },

  // ===== Personal Records =====
  loadPersonalRecords: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;
    try {
      const prs = await getAllPersonalRecords(user.id);
      set({ personalRecords: prs });
    } catch (err) {
      console.error('[WorkoutStore] loadPersonalRecords failed:', err);
    }
  },

  resetActiveWorkout: () => {
    set({ activeWorkout: null });
  },
}));
