import { getDB } from './database';
import type { User, UserSettings, BodyStats } from '@/types/user';
import { Gender, FitnessLevel, FitnessGoal, UnitSystem, type WeekDay } from '@/types/common';
import { safeJsonParse } from '@/utils/helpers';

/* ===== User CRUD ===== */

export async function getUser(id: string): Promise<User | undefined> {
  const db = await getDB();
  return db.get('users', id);
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDB();
  return db.getAll('users');
}

export async function getFirstUser(): Promise<User | undefined> {
  const db = await getDB();
  const all = await db.getAll('users');
  return all[0];
}

export async function createUser(user: User): Promise<string> {
  const db = await getDB();
  await db.put('users', {
    id: user.id,
    name: user.name,
    age: user.age,
    gender: user.gender,
    height: user.height,
    weight: user.weight,
    fitnessLevel: user.fitnessLevel,
    goal: user.goal,
    weeklyTrainingDays: user.weeklyTrainingDays,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
  return user.id;
}

export async function updateUser(user: User): Promise<void> {
  const db = await getDB();
  const updatedUser = {
    ...user,
    updatedAt: new Date().toISOString(),
  };
  await db.put('users', updatedUser);
}

export async function updateUserPartial(
  id: string,
  updates: Partial<User>
): Promise<void> {
  const existing = await getUser(id);
  if (!existing) throw new Error(`User not found: ${id}`);
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await updateUser(updated as User);
}

export async function deleteUser(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('users', id);
}

/* ===== User Settings CRUD ===== */

export async function getUserSettings(
  userId: string
): Promise<UserSettings | undefined> {
  const db = await getDB();
  return db.get('userSettings', userId);
}

export async function saveUserSettings(
  settings: UserSettings
): Promise<void> {
  const db = await getDB();
  const updated = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  await db.put('userSettings', updated);
}

export async function updateUserSettingsPartial(
  userId: string,
  updates: Partial<UserSettings>
): Promise<void> {
  const existing = await getUserSettings(userId);
  if (!existing) throw new Error(`Settings not found for user: ${userId}`);
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await saveUserSettings(updated as UserSettings);
}

/* ===== Body Stats CRUD ===== */

export async function addBodyStats(stats: BodyStats): Promise<string> {
  const db = await getDB();
  await db.put('bodyStats', stats);
  return stats.id;
}

export async function getBodyStatsById(id: string): Promise<BodyStats | undefined> {
  const db = await getDB();
  return db.get('bodyStats', id);
}

export async function getAllBodyStats(userId: string): Promise<BodyStats[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('bodyStats', 'by-userId', userId);
  return all.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getBodyStatsByDate(
  userId: string,
  date: string
): Promise<BodyStats | undefined> {
  const db = await getDB();
  const range = IDBKeyRange.only([userId, date]);
  const results = await db.getAllFromIndex('bodyStats', 'by-userId-date', range);
  return results[0];
}

export async function getBodyStatsInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<BodyStats[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
  const results = await db.getAllFromIndex('bodyStats', 'by-userId-date', range);
  return results.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export async function getLatestBodyStats(
  userId: string
): Promise<BodyStats | undefined> {
  const all = await getAllBodyStats(userId);
  return all[0] || undefined;
}

export async function deleteBodyStats(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('bodyStats', id);
}

/* ===== Reconstruct typed User from DB raw record ===== */
export function reconstructUser(raw: Record<string, unknown>): User {
  return {
    id: raw.id as string,
    name: raw.name as string,
    age: raw.age as number,
    gender: raw.gender as Gender,
    height: raw.height as number,
    weight: raw.weight as number,
    fitnessLevel: raw.fitnessLevel as FitnessLevel,
    goal: raw.goal as FitnessGoal,
    weeklyTrainingDays: raw.weeklyTrainingDays as WeekDay[],
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };
}

/* ===== Reconstruct typed Settings from DB raw record ===== */
export function reconstructSettings(raw: Record<string, unknown>): UserSettings {
  return {
    id: raw.id as string,
    userId: raw.userId as string,
    unitSystem: raw.unitSystem as UnitSystem,
    defaultRestDuration: raw.defaultRestDuration as number,
    reminderEnabled: raw.reminderEnabled as boolean,
    reminderDays: raw.reminderDays as WeekDay[],
    reminderTime: raw.reminderTime as string,
    completedOnboarding: raw.completedOnboarding as boolean,
    updatedAt: raw.updatedAt as string,
  };
}

/* ===== Reconstruct typed BodyStats from DB raw record ===== */
export function reconstructBodyStats(raw: Record<string, unknown>): BodyStats {
  return {
    id: raw.id as string,
    userId: raw.userId as string,
    date: raw.date as string,
    weight: raw.weight as number,
    bodyFat: raw.bodyFat as number | undefined,
    chest: raw.chest as number | undefined,
    waist: raw.waist as number | undefined,
    hips: raw.hips as number | undefined,
    bicepsLeft: raw.bicepsLeft as number | undefined,
    bicepsRight: raw.bicepsRight as number | undefined,
    thighsLeft: raw.thighsLeft as number | undefined,
    thighsRight: raw.thighsRight as number | undefined,
    notes: raw.notes as string | undefined,
    createdAt: raw.createdAt as string,
  };
}
