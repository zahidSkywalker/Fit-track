import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

/* ===== Database Schema ===== */
interface FitTrackDB extends DBSchema {
  users: {
    key: string; // user id
    value: {
      id: string;
      name: string;
      age: number;
      gender: string;
      height: number;
      weight: number;
      fitnessLevel: string;
      goal: string;
      weeklyTrainingDays: string[];
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-name': string };
  };
  userSettings: {
    key: string; // user id
    value: {
      id: string;
      userId: string;
      unitSystem: string;
      defaultRestDuration: number;
      reminderEnabled: boolean;
      reminderDays: string[];
      reminderTime: string;
      completedOnboarding: boolean;
      updatedAt: string;
    };
  };
  bodyStats: {
    key: string; // uuid
    value: {
      id: string;
      userId: string;
      date: string;
      weight: number;
      bodyFat?: number;
      chest?: number;
      waist?: number;
      hips?: number;
      bicepsLeft?: number;
      bicepsRight?: number;
      thighsLeft?: number;
      thighsRight?: number;
      notes?: string;
      createdAt: string;
    };
    indexes: {
      'by-userId': string;
      'by-userId-date': [string, string];
    };
  };
  workoutPlans: {
    key: string; // uuid
    value: {
      id: string;
      name: string;
      description: string;
      category: string;
      difficulty: string;
      intensity: string;
      estimatedDuration: number;
      exercises: string; // JSON stringified WorkoutExercise[]
      primaryMuscles: string[];
      isCustom: boolean;
      isFeatured: boolean;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    };
    indexes: {
      'by-category': string;
      'by-custom': number; // 0 or 1
      'by-featured': number; // 0 or 1
    };
  };
  workoutSessions: {
    key: string; // uuid
    value: {
      id: string;
      workoutPlanId: string;
      workoutPlanName: string;
      status: string;
      exercises: string; // JSON stringified ExerciseRecord[]
      totalDuration: number;
      totalCalories: number;
      avgHeartRate: number;
      maxHeartRate: number;
      pointsEarned: number;
      completionPercentage: number;
      date: string;
      startedAt: string;
      completedAt: string | null;
      notes?: string;
      createdAt: string;
    };
    indexes: {
      'by-date': string;
      'by-status': string;
      'by-workoutPlanId': string;
      'by-date-status': [string, string];
    };
  };
  personalRecords: {
    key: string; // uuid
    value: {
      id: string;
      userId: string;
      exerciseId: string;
      exerciseName: string;
      field: string;
      value: number;
      previousValue: number;
      unit: string;
      achievedAt: string;
    };
    indexes: {
      'by-userId': string;
      'by-exerciseId': string;
      'by-userId-exerciseId': [string, string];
    };
  };
  dailyStats: {
    key: string; // uuid
    value: {
      id: string;
      userId: string;
      date: string;
      totalWorkoutDuration: number;
      totalCalories: number;
      totalSteps: number;
      totalPoints: number;
      workoutsCompleted: number;
      workoutsPlanned: number;
      cardioMinutes: number;
      strengthMinutes: number;
      flexibilityMinutes: number;
      hiitMinutes: number;
      goalCompletionPercent: number;
      enduranceSuccessPercent: number;
      avgHeartRate: number;
      maxHeartRate: number;
      createdAt: string;
      updatedAt: string;
    };
    indexes: {
      'by-userId': string;
      'by-userId-date': [string, string];
      'by-date': string;
    };
  };
  weeklyPoints: {
    key: string; // uuid
    value: {
      id: string;
      userId: string;
      weekStartDate: string;
      totalPoints: number;
      targetPoints: number;
      completionPercent: number;
      dailyBreakdown: string; // JSON stringified Record<WeekDay, number>
      createdAt: string;
      updatedAt: string;
    };
    indexes: {
      'by-userId': string;
      'by-weekStartDate': string;
      'by-userId-week': [string, string];
    };
  };
  challengeProgress: {
    key: string; // uuid
    value: {
      id: string;
      userId: string;
      challengeId: string;
      status: string;
      startedAt: string | null;
      completedAt: string | null;
      currentValue: number;
      dailyLog: string; // JSON stringified DailyChallengeLog[]
      streak: number;
      longestStreak: number;
    };
    indexes: {
      'by-userId': string;
      'by-challengeId': string;
      'by-userId-challengeId': [string, string];
      'by-status': string;
    };
  };
  unlockedAchievements: {
    key: string; // uuid
    value: {
      id: string;
      userId: string;
      achievementId: string;
      unlockedAt: string;
    };
    indexes: {
      'by-userId': string;
      'by-achievementId': string;
      'by-userId-achievementId': [string, string];
    };
  };
}

/* ===== Database Version & Migrations ===== */
const DB_NAME = 'fittrack-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FitTrackDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<FitTrackDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<FitTrackDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      // Version 1: Create all stores
      if (oldVersion < 1) {
        // Users
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-name', 'name');

        // User Settings
        db.createObjectStore('userSettings', { keyPath: 'id' });

        // Body Stats
        const bodyStore = db.createObjectStore('bodyStats', { keyPath: 'id' });
        bodyStore.createIndex('by-userId', 'userId');
        bodyStore.createIndex('by-userId-date', ['userId', 'date']);

        // Workout Plans
        const planStore = db.createObjectStore('workoutPlans', { keyPath: 'id' });
        planStore.createIndex('by-category', 'category');
        planStore.createIndex('by-custom', 'isCustom');
        planStore.createIndex('by-featured', 'isFeatured');

        // Workout Sessions
        const sessionStore = db.createObjectStore('workoutSessions', { keyPath: 'id' });
        sessionStore.createIndex('by-date', 'date');
        sessionStore.createIndex('by-status', 'status');
        sessionStore.createIndex('by-workoutPlanId', 'workoutPlanId');
        sessionStore.createIndex('by-date-status', ['date', 'status']);

        // Personal Records
        const prStore = db.createObjectStore('personalRecords', { keyPath: 'id' });
        prStore.createIndex('by-userId', 'userId');
        prStore.createIndex('by-exerciseId', 'exerciseId');
        prStore.createIndex('by-userId-exerciseId', ['userId', 'exerciseId']);

        // Daily Stats
        const dailyStore = db.createObjectStore('dailyStats', { keyPath: 'id' });
        dailyStore.createIndex('by-userId', 'userId');
        dailyStore.createIndex('by-userId-date', ['userId', 'date']);
        dailyStore.createIndex('by-date', 'date');

        // Weekly Points
        const weeklyStore = db.createObjectStore('weeklyPoints', { keyPath: 'id' });
        weeklyStore.createIndex('by-userId', 'userId');
        weeklyStore.createIndex('by-weekStartDate', 'weekStartDate');
        weeklyStore.createIndex('by-userId-week', ['userId', 'weekStartDate']);

        // Challenge Progress
        const challengeStore = db.createObjectStore('challengeProgress', { keyPath: 'id' });
        challengeStore.createIndex('by-userId', 'userId');
        challengeStore.createIndex('by-challengeId', 'challengeId');
        challengeStore.createIndex('by-userId-challengeId', ['userId', 'challengeId']);
        challengeStore.createIndex('by-status', 'status');

        // Unlocked Achievements
        const achStore = db.createObjectStore('unlockedAchievements', { keyPath: 'id' });
        achStore.createIndex('by-userId', 'userId');
        achStore.createIndex('by-achievementId', 'achievementId');
        achStore.createIndex('by-userId-achievementId', ['userId', 'achievementId']);
      }
    },

    blocked() {
      console.warn('[DB] Database upgrade blocked — close other tabs');
    },

    blocking() {
      console.warn('[DB] This connection is blocking an upgrade — closing');
      dbInstance?.close();
      dbInstance = null;
    },

    terminated() {
      console.error('[DB] Database connection terminated unexpectedly');
      dbInstance = null;
    },
  });

  return dbInstance;
}

/* ===== Reset Database (for settings page) ===== */
export async function resetDatabase(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  await indexedDB.deleteDatabase(DB_NAME);
  console.log('[DB] Database deleted successfully');
}

/* ===== Check if onboarding is needed ===== */
export async function isOnboardingNeeded(): Promise<boolean> {
  const db = await getDB();
  const allUsers = await db.getAll('users');
  return allUsers.length === 0;
}

/* ===== Database Health Check ===== */
export async function checkDatabaseHealth(): Promise<{
  ok: boolean;
  storeCount: number;
  userCount: number;
  sessionCount: number;
}> {
  try {
    const db = await getDB();
    const storeNames = Array.from(db.objectStoreNames);
    const userCount = await db.count('users');
    const sessionCount = await db.count('workoutSessions');
    return {
      ok: true,
      storeCount: storeNames.length,
      userCount,
      sessionCount,
    };
  } catch (error) {
    console.error('[DB] Health check failed:', error);
    return {
      ok: false,
      storeCount: 0,
      userCount: 0,
      sessionCount: 0,
    };
  }
}
