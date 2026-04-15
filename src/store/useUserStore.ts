import { create } from 'zustand';
import type { User, UserSettings, BodyStats, UserProfile } from '@/types/user';
import {
  getUser,
  getFirstUser,
  createUser as dbCreateUser,
  updateUser as dbUpdateUser,
  getUserSettings,
  saveUserSettings as dbSaveSettings,
  updateUserSettingsPartial as dbUpdateSettingsPartial,
  getLatestBodyStats,
  getAllBodyStats,
  addBodyStats as dbAddBodyStats,
  deleteBodyStats as dbDeleteBodyStats,
} from '@/db/userDb';
import { getAllWorkoutSessions } from '@/db/workoutDb';
import { getUnlockedCount } from '@/db/challengeDb';
import { isOnboardingNeeded } from '@/db/database';
import { calculateStreak } from '@/hooks/useStreak';
import { daysSince } from '@/utils/dateUtils';
import { createUserFromOnboarding } from '@/types/user';
import type { OnboardingData } from '@/types/user';

/* ===== Store State ===== */
interface UserState {
  // Data
  user: User | null;
  settings: UserSettings | null;
  latestBodyStats: BodyStats | null;
  bodyStatsHistory: BodyStats[];
  profile: UserProfile | null;

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  needsOnboarding: boolean;

  // Actions
  initialize: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  addBodyStats: (stats: BodyStats) => Promise<void>;
  removeBodyStats: (id: string) => Promise<void>;
  loadBodyStatsHistory: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  reset: () => void;
}

/* ===== Store ===== */
export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  settings: null,
  latestBodyStats: null,
  bodyStatsHistory: [],
  profile: null,
  isLoading: true,
  isInitialized: false,
  needsOnboarding: true,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const needsOB = await isOnboardingNeeded();
      set({ needsOnboarding: needsOB });

      if (!needsOB) {
        const user = await getFirstUser();
        if (user) {
          const settings = (await getUserSettings(user.id)) || null;
          const latestStats = (await getLatestBodyStats(user.id)) || null;

          set({
            user,
            settings,
            latestBodyStats: latestStats,
            isLoading: false,
            isInitialized: true,
            needsOnboarding: false,
          });

          // Load profile async (non-blocking)
          get().refreshProfile();
          return;
        }
      }

      set({
        isLoading: false,
        isInitialized: true,
        needsOnboarding: true,
      });
    } catch (error) {
      console.error('[UserStore] Initialize failed:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  completeOnboarding: async (data: OnboardingData) => {
    const user = createUserFromOnboarding(data);
    await dbCreateUser(user);

    const { createDefaultSettings } = await import('@/types/user');
    const settings = createDefaultSettings(user.id);
    const { saveUserSettings } = await import('@/db/userDb');
    await saveUserSettings(settings);

    // Seed demo data
    const { seedDatabase } = await import('@/db/seedData');
    await seedDatabase();

    set({
      user,
      settings,
      needsOnboarding: false,
    });

    get().refreshProfile();
  },

  updateUser: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    const merged = { ...user, ...updates, updatedAt: new Date().toISOString() };
    await dbUpdateUser(merged);
    set({ user: merged });
    get().refreshProfile();
  },

  updateSettings: async (updates: Partial<UserSettings>) => {
    const { user, settings } = get();
    if (!user || !settings) return;

    await dbUpdateSettingsPartial(user.id, updates);
    const updated = { ...settings, ...updates, updatedAt: new Date().toISOString() };
    set({ settings: updated });
  },

  addBodyStats: async (stats: BodyStats) => {
    await dbAddBodyStats(stats);
    const { user } = get();
    if (user) {
      const latest = (await getLatestBodyStats(user.id)) || null;
      set({ latestBodyStats: latest });
    }
    get().loadBodyStatsHistory();

    // Also update user weight if body stats weight changed
    const { user } = get();
    if (user && stats.weight !== user.weight) {
      get().updateUser({ weight: stats.weight });
    }
  },

  removeBodyStats: async (id: string) => {
    await dbDeleteBodyStats(id);
    const { user } = get();
    if (user) {
      const latest = (await getLatestBodyStats(user.id)) || null;
      set({ latestBodyStats: latest });
    }
    get().loadBodyStatsHistory();
  },

  loadBodyStatsHistory: async () => {
    const { user } = get();
    if (!user) return;
    const history = await getAllBodyStats(user.id);
    set({ bodyStatsHistory: history });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const allSessions = await getAllWorkoutSessions();
      const completedSessions = allSessions.filter(
        (s) => s.status === 'completed'
      );
      const totalPoints = completedSessions.reduce(
        (sum, s) => sum + s.pointsEarned,
        0
      );
      const totalWorkouts = completedSessions.length;

      // Calculate streak
      const workoutDates = completedSessions
        .map((s) => s.date)
        .filter((d, i, arr) => arr.indexOf(d) === i); // unique dates
      const { currentStreak, longestStreak } = calculateStreak(workoutDates);

      const achievementCount = await getUnlockedCount(user.id);

      const profile: UserProfile = {
        user,
        settings: get().settings || (await getUserSettings(user.id)) || {
          id: '',
          userId: user.id,
          unitSystem: 'metric' as any,
          defaultRestDuration: 60,
          reminderEnabled: false,
          reminderDays: [],
          reminderTime: '07:30',
          completedOnboarding: true,
          updatedAt: new Date().toISOString(),
        },
        latestBodyStats: get().latestBodyStats || (await getLatestBodyStats(user.id)) || null,
        totalWorkouts,
        totalPoints,
        currentStreak,
        longestStreak,
        joinedDaysAgo: daysSince(user.createdAt),
      };

      set({ profile });
    } catch (error) {
      console.error('[UserStore] refreshProfile failed:', error);
    }
  },

  reset: () => {
    set({
      user: null,
      settings: null,
      latestBodyStats: null,
      bodyStatsHistory: [],
      profile: null,
      isLoading: false,
      isInitialized: false,
      needsOnboarding: true,
    });
  },
}));
