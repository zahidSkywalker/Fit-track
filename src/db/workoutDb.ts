import { getDB } from './database';
import type {
  WorkoutPlan,
  WorkoutExercise,
  WorkoutSession,
  ExerciseRecord,
  PersonalRecord,
} from '@/types/workout';
import { WorkoutStatus } from '@/types/common';
import { safeJsonParse, safeJsonStringify } from '@/utils/helpers';

/* ===== Workout Plan CRUD ===== */

export async function createWorkoutPlan(plan: WorkoutPlan): Promise<string> {
  const db = await getDB();
  await db.put('workoutPlans', {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    category: plan.category,
    difficulty: plan.difficulty,
    intensity: plan.intensity,
    estimatedDuration: plan.estimatedDuration,
    exercises: safeJsonStringify(plan.exercises),
    primaryMuscles: plan.primaryMuscles,
    isCustom: plan.isCustom ? 1 : 0,
    isFeatured: plan.isFeatured ? 1 : 0,
    tags: plan.tags,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  });
  return plan.id;
}

export async function getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined> {
  const db = await getDB();
  const raw = await db.get('workoutPlans', id);
  if (!raw) return undefined;
  return reconstructWorkoutPlan(raw);
}

export async function getAllWorkoutPlans(): Promise<WorkoutPlan[]> {
  const db = await getDB();
  const all = await db.getAll('workoutPlans');
  return all.map(reconstructWorkoutPlan);
}

export async function getCustomWorkoutPlans(): Promise<WorkoutPlan[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('workoutPlans', 'by-custom', 1);
  return all.map(reconstructWorkoutPlan);
}

export async function getFeaturedWorkoutPlans(): Promise<WorkoutPlan[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('workoutPlans', 'by-featured', 1);
  return all.map(reconstructWorkoutPlan);
}

export async function getWorkoutPlansByCategory(
  category: string
): Promise<WorkoutPlan[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('workoutPlans', 'by-category', category);
  return all.map(reconstructWorkoutPlan);
}

export async function updateWorkoutPlan(plan: WorkoutPlan): Promise<void> {
  const db = await getDB();
  await db.put('workoutPlans', {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    category: plan.category,
    difficulty: plan.difficulty,
    intensity: plan.intensity,
    estimatedDuration: plan.estimatedDuration,
    exercises: safeJsonStringify(plan.exercises),
    primaryMuscles: plan.primaryMuscles,
    isCustom: plan.isCustom ? 1 : 0,
    isFeatured: plan.isFeatured ? 1 : 0,
    tags: plan.tags,
    createdAt: plan.createdAt,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('workoutPlans', id);
}

/* ===== Workout Session CRUD ===== */

export async function saveWorkoutSession(session: WorkoutSession): Promise<string> {
  const db = await getDB();
  await db.put('workoutSessions', {
    id: session.id,
    workoutPlanId: session.workoutPlanId,
    workoutPlanName: session.workoutPlanName,
    status: session.status,
    exercises: safeJsonStringify(session.exercises),
    totalDuration: session.totalDuration,
    totalCalories: session.totalCalories,
    avgHeartRate: session.avgHeartRate,
    maxHeartRate: session.maxHeartRate,
    pointsEarned: session.pointsEarned,
    completionPercentage: session.completionPercentage,
    date: session.date,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    notes: session.notes,
    createdAt: session.createdAt,
  });
  return session.id;
}

export async function getWorkoutSession(
  id: string
): Promise<WorkoutSession | undefined> {
  const db = await getDB();
  const raw = await db.get('workoutSessions', id);
  if (!raw) return undefined;
  return reconstructWorkoutSession(raw);
}

export async function getAllWorkoutSessions(): Promise<WorkoutSession[]> {
  const db = await getDB();
  const all = await db.getAll('workoutSessions');
  return all
    .map(reconstructWorkoutSession)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
}

export async function getWorkoutSessionsByDate(
  date: string
): Promise<WorkoutSession[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('workoutSessions', 'by-date', date);
  return all
    .map(reconstructWorkoutSession)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
}

export async function getCompletedWorkoutSessions(): Promise<WorkoutSession[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(
    'workoutSessions',
    'by-status',
    WorkoutStatus.COMPLETED
  );
  return all
    .map(reconstructWorkoutSession)
    .sort(
      (a, b) =>
        new Date(b.completedAt || b.startedAt).getTime() -
        new Date(a.completedAt || a.startedAt).getTime()
    );
}

export async function getWorkoutSessionsInRange(
  startDate: string,
  endDate: string
): Promise<WorkoutSession[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound(
    [startDate, WorkoutStatus.COMPLETED],
    [endDate, WorkoutStatus.COMPLETED]
  );
  const all = await db.getAllFromIndex('workoutSessions', 'by-date-status', range);
  return all
    .map(reconstructWorkoutSession)
    .sort(
      (a, b) =>
        new Date(b.completedAt || b.startedAt).getTime() -
        new Date(a.completedAt || a.startedAt).getTime()
    );
}

export async function getSessionsByPlanId(
  planId: string
): Promise<WorkoutSession[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('workoutSessions', 'by-workoutPlanId', planId);
  return all
    .map(reconstructWorkoutSession)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
}

export async function deleteWorkoutSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('workoutSessions', id);
}

/* ===== Personal Records CRUD ===== */

export async function savePersonalRecord(record: PersonalRecord): Promise<string> {
  const db = await getDB();
  await db.put('personalRecords', record);
  return record.id;
}

export async function getPersonalRecordsByExercise(
  exerciseId: string
): Promise<PersonalRecord[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('personalRecords', 'by-exerciseId', exerciseId);
  return all.sort(
    (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
  );
}

export async function getPersonalRecord(
  userId: string,
  exerciseId: string,
  field: string
): Promise<PersonalRecord | undefined> {
  const db = await getDB();
  const range = IDBKeyRange.only([userId, exerciseId]);
  const all = await db.getAllFromIndex('personalRecords', 'by-userId-exerciseId', range);
  return all.find((r) => r.field === field);
}

export async function getAllPersonalRecords(
  userId: string
): Promise<PersonalRecord[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('personalRecords', 'by-userId', userId);
  return all.sort(
    (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
  );
}

/* ===== Reconstruction Helpers ===== */

function reconstructWorkoutPlan(raw: Record<string, unknown>): WorkoutPlan {
  return {
    id: raw.id as string,
    name: raw.name as string,
    description: raw.description as string,
    category: raw.category as string,
    difficulty: raw.difficulty as WorkoutPlan['difficulty'],
    intensity: raw.intensity as WorkoutPlan['intensity'],
    estimatedDuration: raw.estimatedDuration as number,
    exercises: safeJsonParse<WorkoutExercise[]>(raw.exercises as string, []),
    primaryMuscles: raw.primaryMuscles as WorkoutPlan['primaryMuscles'],
    isCustom: (raw.isCustom as number) === 1,
    isFeatured: (raw.isFeatured as number) === 1,
    tags: raw.tags as string[],
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };
}

function reconstructWorkoutSession(raw: Record<string, unknown>): WorkoutSession {
  return {
    id: raw.id as string,
    workoutPlanId: raw.workoutPlanId as string,
    workoutPlanName: raw.workoutPlanName as string,
    status: raw.status as WorkoutStatus,
    exercises: safeJsonParse<ExerciseRecord[]>(raw.exercises as string, []),
    totalDuration: raw.totalDuration as number,
    totalCalories: raw.totalCalories as number,
    avgHeartRate: raw.avgHeartRate as number,
    maxHeartRate: raw.maxHeartRate as number,
    pointsEarned: raw.pointsEarned as number,
    completionPercentage: raw.completionPercentage as number,
    date: raw.date as string,
    startedAt: raw.startedAt as string,
    completedAt: raw.completedAt as string | null,
    notes: raw.notes as string | undefined,
    createdAt: raw.createdAt as string,
  };
}
