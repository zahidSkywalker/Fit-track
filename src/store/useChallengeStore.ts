import { create } from 'zustand';
import type { ChallengeProgress, UnlockedAchievement } from '@/types/challenge';
import type { Challenge, Achievement } from '@/types/challenge';
import { CHALLENGES, ACHIEVEMENTS } from '@/constants/challenges';
import {
  getAllChallengeProgress,
  getActiveChallenges,
  getChallengeProgress,
  startChallenge as dbStartChallenge,
  completeChallenge as dbCompleteChallenge,
  saveChallengeProgress,
  deleteChallengeProgress,
  getUnlockedAchievements,
  isAchievementUnlocked,
  unlockAchievement,
  getUnlockedCount,
} from '@/db/challengeDb';
import { useUserStore } from './useUserStore';
import { getTodayISO } from '@/utils/dateUtils';
import { getChallengeCompletionPercent, logChallengeDay } from '@/types/challenge';

/* ===== Store State ===== */
interface ChallengeState {
  // All challenge definitions
  challenges: Challenge[];
  // All achievement definitions
  achievements: Achievement[];

  // User's progress
  allProgress: ChallengeProgress[];
  activeProgress: ChallengeProgress[];
  unlockedAchievements: UnlockedAchievement[];
  unlockedCount: number;
  totalAchievements: number;

  loading: boolean;

  // Actions
  loadChallenges: () => void;
  loadProgress: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  startChallenge: (challengeId: string) => Promise<void>;
  logDay: (challengeId: string, value: number) => Promise<void>;
  abandonChallenge: (progressId: string) => Promise<void>;
  checkAndUnlockAchievements: () => Promise<UnlockedAchievement[]>;
  refreshAll: () => Promise<void>;
}

/* ===== Store ===== */
export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: CHALLENGES,
  achievements: ACHIEVEMENTS,
  allProgress: [],
  activeProgress: [],
  unlockedAchievements: [],
  unlockedCount: 0,
  totalAchievements: ACHIEVEMENTS.length,
  loading: false,

  loadChallenges: () => {
    set({ challenges: CHALLENGES, achievements: ACHIEVEMENTS });
  },

  loadProgress: async () => {
    set({ loading: true });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ loading: false });
        return;
      }
      const all = await getAllChallengeProgress(user.id);
      const active = await getActiveChallenges(user.id);
      set({ allProgress: all, activeProgress: active, loading: false });
    } catch (err) {
      console.error('[ChallengeStore] loadProgress failed:', err);
      set({ loading: false });
    }
  },

  loadAchievements: async () => {
    try {
      const user = useUserStore.getState().user;
      if (!user) return;
      const unlocked = await getUnlockedAchievements(user.id);
      const count = await getUnlockedCount(user.id);
      set({ unlockedAchievements: unlocked, unlockedCount: count });
    } catch (err) {
      console.error('[ChallengeStore] loadAchievements failed:', err);
    }
  },

  startChallenge: async (challengeId: string) => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const progress = await dbStartChallenge(user.id, challengeId);
    await get().loadProgress();
  },

  logDay: async (challengeId: string, value: number) => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const existing = await getChallengeProgress(user.id, challengeId);
    if (!existing || existing.status !== 'in_progress') return;

    const challenge = CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) return;

    const updated = logChallengeDay(existing, getTodayISO(), value, challenge.dailyTarget);

    // Check if challenge is complete
    if (updated.currentValue >= challenge.targetValue) {
      await dbCompleteChallenge(updated);
    } else {
      await saveChallengeProgress(updated);
    }

    await get().loadProgress();
  },

  abandonChallenge: async (progressId: string) => {
    await deleteChallengeProgress(progressId);
    await get().loadProgress();
  },

  checkAndUnlockAchievements: async (): Promise<UnlockedAchievement[]> => {
    const user = useUserStore.getState().user;
    if (!user) return [];

    const newlyUnlocked: UnlockedAchievement[] = [];
    const { useWorkoutStore } = await import('./useWorkoutStore');
    const workoutStore = useWorkoutStore.getState();
    const profile = useUserStore.getState().profile;

    for (const achievement of ACHIEVEMENTS) {
      const alreadyUnlocked = await isAchievementUnlocked(user.id, achievement.id);
      if (alreadyUnlocked) continue;

      let meetsCondition = false;
      const cond = achievement.condition;

      switch (cond.type) {
        case 'total_workouts':
          meetsCondition = (profile?.totalWorkouts || 0) >= cond.value;
          break;
        case 'total_points':
          meetsCondition = (profile?.totalPoints || 0) >= cond.value;
          break;
        case 'streak':
          meetsCondition = (profile?.currentStreak || 0) >= cond.value;
          break;
        case 'longest_streak':
          meetsCondition = (profile?.longestStreak || 0) >= cond.value;
          break;
        case 'total_calories': {
          const total = workoutStore.sessions.reduce((s, sess) => s + sess.totalCalories, 0);
          meetsCondition = total >= cond.value;
          break;
        }
        case 'total_minutes': {
          const total = workoutStore.sessions.reduce((s, sess) => s + sess.totalDuration, 0) / 60;
          meetsCondition = total >= cond.value;
          break;
        }
        case 'total_steps': {
          const { useActivityStore } = await import('./useActivityStore');
          const actStore = useActivityStore.getState();
          const total = actStore.last30Days.reduce((s, d) => s + d.totalSteps, 0);
          meetsCondition = total >= cond.value;
          break;
        }
        case 'challenges_completed': {
          const completed = get().allProgress.filter((p) => p.status === 'completed').length;
          meetsCondition = completed >= cond.value;
          break;
        }
        case 'custom_workouts_created':
          meetsCondition = workoutStore.customPlans.length >= cond.value;
          break;
        case 'body_weight_logged':
          meetsCondition = (useUserStore.getState().bodyStatsHistory.length || 0) >= cond.value;
          break;
        case 'muscle_groups_trained': {
          const muscles = new Set<string>();
          workoutStore.sessions.forEach((sess) => {
            // We'd need to look up plan muscles — simplified check
          });
          meetsCondition = muscles.size >= cond.value;
          break;
        }
        case 'workout_on_each_weekday': {
          const workoutDays = new Set<string>();
          workoutStore.sessions
            .filter((s) => s.status === 'completed')
            .forEach((s) => {
              const d = new Date(s.date);
              workoutDays.add(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()]);
            });
          meetsCondition = workoutDays.size >= cond.value;
          break;
        }
      }

      if (meetsCondition) {
        const unlocked = await unlockAchievement(user.id, achievement.id);
        newlyUnlocked.push(unlocked);
      }
    }

    if (newlyUnlocked.length > 0) {
      await get().loadAchievements();
    }

    return newlyUnlocked;
  },

  refreshAll: async () => {
    await Promise.all([
      get().loadProgress(),
      get().loadAchievements(),
    ]);
  },
}));
