import { getDB } from './database';
import type { DailyStats, WeeklyPoints } from '@/types/activity';
import { type WeekDay, WEEK_DAYS_ORDER } from '@/types/common';
import { getTodayISO, getWeekStart, formatDateISO } from '@/utils/dateUtils';
import { safeJsonParse, safeJsonStringify } from '@/utils/helpers';

/* ===== Daily Stats CRUD ===== */

export async function getDailyStats(
  userId: string,
  date: string
): Promise<DailyStats | undefined> {
  const db = await getDB();
  const range = IDBKeyRange.only([userId, date]);
  const results = await db.getAllFromIndex('dailyStats', 'by-userId-date', range);
  return results[0] ? reconstructDailyStats(results[0]) : undefined;
}

export async function getTodayStats(userId: string): Promise<DailyStats> {
  const existing = await getDailyStats(userId, getTodayISO());
  if (existing) return existing;
  // Auto-create today's stats if missing
  const { createDefaultDailyStats } = await import('@/types/activity');
  return createDefaultDailyStats(userId, getTodayISO());
}

export async function saveDailyStats(stats: DailyStats): Promise<string> {
  const db = await getDB();
  await db.put('dailyStats', {
    id: stats.id,
    userId: stats.userId,
    date: stats.date,
    totalWorkoutDuration: stats.totalWorkoutDuration,
    totalCalories: stats.totalCalories,
    totalSteps: stats.totalSteps,
    totalPoints: stats.totalPoints,
    workoutsCompleted: stats.workoutsCompleted,
    workoutsPlanned: stats.workoutsPlanned,
    cardioMinutes: stats.cardioMinutes,
    strengthMinutes: stats.strengthMinutes,
    flexibilityMinutes: stats.flexibilityMinutes,
    hiitMinutes: stats.hiitMinutes,
    goalCompletionPercent: stats.goalCompletionPercent,
    enduranceSuccessPercent: stats.enduranceSuccessPercent,
    avgHeartRate: stats.avgHeartRate,
    maxHeartRate: stats.maxHeartRate,
    createdAt: stats.createdAt,
    updatedAt: new Date().toISOString(),
  });
  return stats.id;
}

export async function updateDailyStatsPartial(
  userId: string,
  date: string,
  updates: Partial<DailyStats>
): Promise<void> {
  const existing = await getDailyStats(userId, date);
  if (!existing) {
    // Create if doesn't exist
    const { createDefaultDailyStats } = await import('@/types/activity');
    const newStats = createDefaultDailyStats(userId, date);
    const merged = { ...newStats, ...updates, updatedAt: new Date().toISOString() };
    await saveDailyStats(merged as DailyStats);
    return;
  }
  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await saveDailyStats(merged as DailyStats);
}

export async function getDailyStatsInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyStats[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
  const results = await db.getAllFromIndex('dailyStats', 'by-userId-date', range);
  return results
    .map(reconstructDailyStats)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getLastNDaysStats(
  userId: string,
  n: number
): Promise<DailyStats[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (n - 1));
  return getDailyStatsInRange(
    userId,
    formatDateISO(start),
    formatDateISO(end)
  );
}

/* ===== Weekly Points CRUD ===== */

export async function getWeeklyPoints(
  userId: string,
  weekStartDate: string
): Promise<WeeklyPoints | undefined> {
  const db = await getDB();
  const range = IDBKeyRange.only([userId, weekStartDate]);
  const results = await db.getAllFromIndex('weeklyPoints', 'by-userId-week', range);
  return results[0] ? reconstructWeeklyPoints(results[0]) : undefined;
}

export async function getCurrentWeekPoints(userId: string): Promise<WeeklyPoints> {
  const weekStart = formatDateISO(getWeekStart());
  const existing = await getWeeklyPoints(userId, weekStart);
  if (existing) return existing;
  // Auto-create
  const { createDefaultWeeklyPoints, getWeeklyPointTarget } = await import('@/utils/calculations');
  const { getUser } = await import('./userDb');
  const user = await getUser(userId);
  const target = user ? getWeeklyPointTarget(user.fitnessLevel) : 2400;
  return createDefaultWeeklyPoints(userId, weekStart, target);
}

export async function saveWeeklyPoints(
  weeklyPoints: WeeklyPoints
): Promise<string> {
  const db = await getDB();
  await db.put('weeklyPoints', {
    id: weeklyPoints.id,
    userId: weeklyPoints.userId,
    weekStartDate: weeklyPoints.weekStartDate,
    totalPoints: weeklyPoints.totalPoints,
    targetPoints: weeklyPoints.targetPoints,
    completionPercent: weeklyPoints.completionPercent,
    dailyBreakdown: safeJsonStringify(weeklyPoints.dailyBreakdown),
    createdAt: weeklyPoints.createdAt,
    updatedAt: new Date().toISOString(),
  });
  return weeklyPoints.id;
}

export async function updateWeeklyPointsPartial(
  userId: string,
  weekStartDate: string,
  updates: Partial<WeeklyPoints>
): Promise<void> {
  const existing = await getWeeklyPoints(userId, weekStartDate);
  if (!existing) {
    const { createDefaultWeeklyPoints, getWeeklyPointTarget } = await import('@/utils/calculations');
    const { getUser } = await import('./userDb');
    const user = await getUser(userId);
    const target = user ? getWeeklyPointTarget(user.fitnessLevel) : 2400;
    const newWP = createDefaultWeeklyPoints(userId, weekStartDate, target);
    const merged = { ...newWP, ...updates, updatedAt: new Date().toISOString() };
    await saveWeeklyPoints(merged as WeeklyPoints);
    return;
  }
  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await saveWeeklyPoints(merged as WeeklyPoints);
}

export async function getLastNWeeksPoints(
  userId: string,
  n: number
): Promise<WeeklyPoints[]> {
  const results: WeeklyPoints[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const weekStart = formatDateISO(getWeekStart(d));
    const wp = await getWeeklyPoints(userId, weekStart);
    if (wp) results.push(wp);
  }
  return results;
}

/* ===== Add Points to Today and Weekly ===== */
export async function addPoints(
  userId: string,
  points: number
): Promise<void> {
  if (points <= 0) return;

  // Update today's stats
  const todayStats = await getTodayStats(userId);
  todayStats.totalPoints += points;
  await saveDailyStats(todayStats);

  // Update weekly points
  const weekPoints = await getCurrentWeekPoints(userId);
  weekPoints.totalPoints += points;
  weekPoints.completionPercent = Math.min(
    100,
    Math.round((weekPoints.totalPoints / weekPoints.targetPoints) * 100)
  );
  // Add to the correct day
  const today = new Date();
  const dayIndex = today.getDay();
  // Convert: 0(Sun)→6, 1(Mon)→0, ..., 6(Sat)→5
  const weekDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  const weekDay = WEEK_DAYS_ORDER[weekDayIndex];
  weekPoints.dailyBreakdown[weekDay] += points;
  await saveWeeklyPoints(weekPoints);
}

/* ===== Reconstruction Helpers ===== */

function reconstructDailyStats(raw: Record<string, unknown>): DailyStats {
  return {
    id: raw.id as string,
    userId: raw.userId as string,
    date: raw.date as string,
    totalWorkoutDuration: raw.totalWorkoutDuration as number,
    totalCalories: raw.totalCalories as number,
    totalSteps: raw.totalSteps as number,
    totalPoints: raw.totalPoints as number,
    workoutsCompleted: raw.workoutsCompleted as number,
    workoutsPlanned: raw.workoutsPlanned as number,
    cardioMinutes: raw.cardioMinutes as number,
    strengthMinutes: raw.strengthMinutes as number,
    flexibilityMinutes: raw.flexibilityMinutes as number,
    hiitMinutes: raw.hiitMinutes as number,
    goalCompletionPercent: raw.goalCompletionPercent as number,
    enduranceSuccessPercent: raw.enduranceSuccessPercent as number,
    avgHeartRate: raw.avgHeartRate as number,
    maxHeartRate: raw.maxHeartRate as number,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };
}

function reconstructWeeklyPoints(raw: Record<string, unknown>): WeeklyPoints {
  return {
    id: raw.id as string,
    userId: raw.userId as string,
    weekStartDate: raw.weekStartDate as string,
    totalPoints: raw.totalPoints as number,
    targetPoints: raw.targetPoints as number,
    completionPercent: raw.completionPercent as number,
    dailyBreakdown: safeJsonParse<Record<WeekDay, number>>(
      raw.dailyBreakdown as string,
      {
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        sat: 0,
        sun: 0,
      }
    ),
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };
}
