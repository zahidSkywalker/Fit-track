import { create } from 'zustand';
import type { DailyStats, WeeklyPoints } from '@/types/activity';
import {
  getTodayStats,
  getDailyStatsInRange,
  getLastNDaysStats,
  saveDailyStats,
  updateDailyStatsPartial,
} from '@/db/activityDb';
import { getCurrentWeekPoints, getLastNWeeksPoints } from '@/db/activityDb';
import { getTodayISO, getLastNDaysISO, getWeekStart, formatDateISO } from '@/utils/dateUtils';
import { useUserStore } from './useUserStore';

/* ===== Store State ===== */
interface ActivityState {
  // Today
  todayStats: DailyStats | null;
  todayLoading: boolean;

  // Weekly
  weeklyPoints: WeeklyPoints | null;

  // History
  last7Days: DailyStats[];
  last30Days: DailyStats[];
  last4Weeks: WeeklyPoints[];

  // Steps
  todaySteps: number;

  // Actions
  loadTodayStats: () => Promise<void>;
  loadWeeklyPoints: () => Promise<void>;
  loadLast7Days: () => Promise<void>;
  loadLast30Days: () => Promise<void>;
  loadLast4Weeks: () => Promise<void>;
  addSteps: (steps: number) => Promise<void>;
  refreshAll: () => Promise<void>;
}

/* ===== Store ===== */
export const useActivityStore = create<ActivityState>((set, get) => ({
  todayStats: null,
  todayLoading: false,
  weeklyPoints: null,
  last7Days: [],
  last30Days: [],
  last4Weeks: [],
  todaySteps: 0,

  loadTodayStats: async () => {
    set({ todayLoading: true });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ todayLoading: false });
        return;
      }
      const stats = await getTodayStats(user.id);
      set({ todayStats: stats, todaySteps: stats.totalSteps, todayLoading: false });
    } catch (err) {
      console.error('[ActivityStore] loadTodayStats failed:', err);
      set({ todayLoading: false });
    }
  },

  loadWeeklyPoints: async () => {
    try {
      const user = useUserStore.getState().user;
      if (!user) return;
      const wp = await getCurrentWeekPoints(user.id);
      set({ weeklyPoints: wp });
    } catch (err) {
      console.error('[ActivityStore] loadWeeklyPoints failed:', err);
    }
  },

  loadLast7Days: async () => {
    try {
      const user = useUserStore.getState().user;
      if (!user) return;
      const stats = await getLastNDaysStats(user.id, 7);
      set({ last7Days: stats });
    } catch (err) {
      console.error('[ActivityStore] loadLast7Days failed:', err);
    }
  },

  loadLast30Days: async () => {
    try {
      const user = useUserStore.getState().user;
      if (!user) return;
      const stats = await getLastNDaysStats(user.id, 30);
      set({ last30Days: stats });
    } catch (err) {
      console.error('[ActivityStore] loadLast30Days failed:', err);
    }
  },

  loadLast4Weeks: async () => {
    try {
      const user = useUserStore.getState().user;
      if (!user) return;
      const weeks = await getLastNWeeksPoints(user.id, 4);
      set({ last4Weeks: weeks });
    } catch (err) {
      console.error('[ActivityStore] loadLast4Weeks failed:', err);
    }
  },

  addSteps: async (steps: number) => {
    if (steps <= 0) return;
    const user = useUserStore.getState().user;
    if (!user) return;

    const todayStat = await getTodayStats(user.id);
    await updateDailyStatsPartial(user.id, getTodayISO(), {
      totalSteps: todayStat.totalSteps + steps,
    });

    set({ todaySteps: todayStat.totalSteps + steps });
  },

  refreshAll: async () => {
    await Promise.all([
      get().loadTodayStats(),
      get().loadWeeklyPoints(),
      get().loadLast7Days(),
      get().loadLast30Days(),
      get().loadLast4Weeks(),
    ]);
  },
}));
