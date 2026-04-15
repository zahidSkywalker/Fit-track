import { ChallengeType, WeekDay } from './common';

/* ===== Challenge Definition ===== */
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  targetValue: number; // depends on type: reps, km, minutes, days
  unit: string; // "reps", "km", "minutes", "days"
  durationDays: number; // total days the challenge runs
  dailyTarget?: number; // if type is DAILY/REPETITION, how much per day
  pointsReward: number; // bonus points on completion
  icon: string; // Lucide icon name
  color: string; // tailwind color key: 'blue' | 'peach' | 'green' | 'red'
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
}

/* ===== Challenge Progress (user-specific) ===== */
export interface ChallengeProgress {
  id: string;
  userId: string;
  challengeId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  startedAt: string | null; // ISO 8601 datetime
  completedAt: string | null; // ISO 8601 datetime
  currentValue: number; // total accumulated value
  dailyLog: DailyChallengeLog[];
  streak: number; // consecutive days meeting daily target
  longestStreak: number;
}

/* ===== Daily Challenge Log ===== */
export interface DailyChallengeLog {
  date: string; // YYYY-MM-DD
  value: number; // amount contributed that day
  metTarget: boolean;
}

/* ===== Achievement Definition ===== */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  condition: AchievementCondition;
  pointsReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/* ===== Achievement Condition ===== */
export interface AchievementCondition {
  type:
    | 'total_workouts'
    | 'total_points'
    | 'streak'
    | 'longest_streak'
    | 'total_calories'
    | 'total_minutes'
    | 'total_steps'
    | 'challenges_completed'
    | 'custom_workouts_created'
    | 'body_weight_logged'
    | 'muscle_groups_trained'
    | 'workout_on_each_weekday';
  value: number; // threshold to unlock
}

/* ===== Unlocked Achievement (user-specific) ===== */
export interface UnlockedAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string; // ISO 8601 datetime
}

/* ===== Challenge Progress Helpers ===== */
export function createChallengeProgress(
  userId: string,
  challengeId: string
): ChallengeProgress {
  return {
    id: crypto.randomUUID(),
    userId,
    challengeId,
    status: 'not_started',
    startedAt: null,
    completedAt: null,
    currentValue: 0,
    dailyLog: [],
    streak: 0,
    longestStreak: 0,
  };
}

export function getChallengeCompletionPercent(
  progress: ChallengeProgress,
  challenge: Challenge
): number {
  if (progress.status === 'completed') return 100;
  if (challenge.durationDays > 0 && challenge.dailyTarget) {
    return Math.min(
      100,
      Math.round((progress.currentValue / (challenge.dailyTarget * challenge.durationDays)) * 100)
    );
  }
  return Math.min(100, Math.round((progress.currentValue / challenge.targetValue) * 100));
}

export function getChallengeRemainingDays(
  progress: ChallengeProgress,
  challenge: Challenge
): number {
  if (!progress.startedAt || progress.status === 'completed') return 0;
  const startDate = new Date(progress.startedAt);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + challenge.durationDays);
  const now = new Date();
  const remaining = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, remaining);
}

export function logChallengeDay(
  progress: ChallengeProgress,
  date: string,
  value: number,
  dailyTarget: number | undefined
): ChallengeProgress {
  const existingLog = progress.dailyLog.find((l) => l.date === date);
  if (existingLog) {
    existingLog.value = value;
    existingLog.metTarget = dailyTarget ? value >= dailyTarget : true;
  } else {
    progress.dailyLog.push({
      date,
      value,
      metTarget: dailyTarget ? value >= dailyTarget : true,
    });
  }

  // Recalculate current value
  progress.currentValue = progress.dailyLog.reduce((sum, l) => sum + l.value, 0);

  // Recalculate streak
  const sortedLogs = [...progress.dailyLog].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 0;
  for (const log of sortedLogs) {
    if (log.metTarget) {
      streak++;
    } else {
      break;
    }
  }
  progress.streak = streak;
  progress.longestStreak = Math.max(progress.longestStreak, streak);

  return progress;
}
