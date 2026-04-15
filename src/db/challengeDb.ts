import { getDB } from './database';
import type {
  ChallengeProgress,
  DailyChallengeLog,
  UnlockedAchievement,
} from '@/types/challenge';
import { safeJsonParse, safeJsonStringify } from '@/utils/helpers';

/* ===== Challenge Progress CRUD ===== */

export async function getChallengeProgress(
  userId: string,
  challengeId: string
): Promise<ChallengeProgress | undefined> {
  const db = await getDB();
  const range = IDBKeyRange.only([userId, challengeId]);
  const results = await db.getAllFromIndex(
    'challengeProgress',
    'by-userId-challengeId',
    range
  );
  return results[0] ? reconstructChallengeProgress(results[0]) : undefined;
}

export async function getAllChallengeProgress(
  userId: string
): Promise<ChallengeProgress[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('challengeProgress', 'by-userId', userId);
  return all.map(reconstructChallengeProgress);
}

export async function getActiveChallenges(
  userId: string
): Promise<ChallengeProgress[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('challengeProgress', 'by-status', 'in_progress');
  return all
    .filter((r) => r.userId === userId)
    .map(reconstructChallengeProgress);
}

export async function saveChallengeProgress(
  progress: ChallengeProgress
): Promise<string> {
  const db = await getDB();
  await db.put('challengeProgress', {
    id: progress.id,
    userId: progress.userId,
    challengeId: progress.challengeId,
    status: progress.status,
    startedAt: progress.startedAt,
    completedAt: progress.completedAt,
    currentValue: progress.currentValue,
    dailyLog: safeJsonStringify(progress.dailyLog),
    streak: progress.streak,
    longestStreak: progress.longestStreak,
  });
  return progress.id;
}

export async function startChallenge(
  userId: string,
  challengeId: string
): Promise<ChallengeProgress> {
  const { createChallengeProgress } = await import('@/types/challenge');
  const progress = createChallengeProgress(userId, challengeId);
  progress.status = 'in_progress';
  progress.startedAt = new Date().toISOString();
  await saveChallengeProgress(progress);
  return progress;
}

export async function completeChallenge(
  progress: ChallengeProgress
): Promise<void> {
  progress.status = 'completed';
  progress.completedAt = new Date().toISOString();
  await saveChallengeProgress(progress);
}

export async function deleteChallengeProgress(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('challengeProgress', id);
}

/* ===== Unlocked Achievements CRUD ===== */

export async function getUnlockedAchievements(
  userId: string
): Promise<UnlockedAchievement[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(
    'unlockedAchievements',
    'by-userId',
    userId
  );
  return all.map((raw) => ({
    id: raw.id as string,
    userId: raw.userId as string,
    achievementId: raw.achievementId as string,
    unlockedAt: raw.unlockedAt as string,
  }));
}

export async function isAchievementUnlocked(
  userId: string,
  achievementId: string
): Promise<boolean> {
  const db = await getDB();
  const range = IDBKeyRange.only([userId, achievementId]);
  const results = await db.getAllFromIndex(
    'unlockedAchievements',
    'by-userId-achievementId',
    range
  );
  return results.length > 0;
}

export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<UnlockedAchievement> {
  const achievement: UnlockedAchievement = {
    id: crypto.randomUUID(),
    userId,
    achievementId,
    unlockedAt: new Date().toISOString(),
  };
  const db = await getDB();
  await db.put('unlockedAchievements', achievement);
  return achievement;
}

export async function getUnlockedCount(userId: string): Promise<number> {
  const db = await getDB();
  const all = await db.getAllFromIndex(
    'unlockedAchievements',
    'by-userId',
    userId
  );
  return all.length;
}

/* ===== Reconstruction ===== */

function reconstructChallengeProgress(
  raw: Record<string, unknown>
): ChallengeProgress {
  return {
    id: raw.id as string,
    userId: raw.userId as string,
    challengeId: raw.challengeId as string,
    status: raw.status as ChallengeProgress['status'],
    startedAt: raw.startedAt as string | null,
    completedAt: raw.completedAt as string | null,
    currentValue: raw.currentValue as number,
    dailyLog: safeJsonParse<DailyChallengeLog[]>(
      raw.dailyLog as string,
      []
    ),
    streak: raw.streak as number,
    longestStreak: raw.longestStreak as number,
  };
}
