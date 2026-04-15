import {
  FitnessLevel,
  Gender,
  FitnessGoal,
  UnitSystem,
  WeekDay,
} from './common';

/* ===== User Profile ===== */
export interface User {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  height: number; // centimeters
  weight: number; // kilograms
  fitnessLevel: FitnessLevel;
  goal: FitnessGoal;
  weeklyTrainingDays: WeekDay[];
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

/* ===== User Settings ===== */
export interface UserSettings {
  id: string;
  userId: string;
  unitSystem: UnitSystem;
  defaultRestDuration: number; // seconds — 30, 60, 90, 120
  reminderEnabled: boolean;
  reminderDays: WeekDay[];
  reminderTime: string; // "HH:mm" format, e.g. "07:30"
  completedOnboarding: boolean;
  updatedAt: string; // ISO 8601 date string
}

/* ===== Body Measurements ===== */
export interface BodyStats {
  id: string;
  userId: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  weight: number; // kilograms
  bodyFat?: number; // percentage (0-100)
  chest?: number; // centimeters
  waist?: number; // centimeters
  hips?: number; // centimeters
  bicepsLeft?: number; // centimeters
  bicepsRight?: number; // centimeters
  thighsLeft?: number; // centimeters
  thighsRight?: number; // centimeters
  notes?: string;
  createdAt: string; // ISO 8601 date string
}

/* ===== Computed User Summary ===== */
export interface UserProfile {
  user: User;
  settings: UserSettings;
  latestBodyStats: BodyStats | null;
  totalWorkouts: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  joinedDaysAgo: number;
}

/* ===== Onboarding Data (collected before user is created) ===== */
export interface OnboardingData {
  name: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  fitnessLevel: FitnessLevel;
  goal: FitnessGoal;
  weeklyTrainingDays: WeekDay[];
}

/* ===== Default Settings Factory ===== */
export function createDefaultSettings(userId: string): UserSettings {
  return {
    id: crypto.randomUUID(),
    userId,
    unitSystem: UnitSystem.METRIC,
    defaultRestDuration: 60,
    reminderEnabled: false,
    reminderDays: ['mon', 'wed', 'fri'] as WeekDay[],
    reminderTime: '07:30',
    completedOnboarding: true,
    updatedAt: new Date().toISOString(),
  };
}

/* ===== Default User Factory ===== */
export function createUserFromOnboarding(data: OnboardingData): User {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    age: data.age,
    gender: data.gender,
    height: data.height,
    weight: data.weight,
    fitnessLevel: data.fitnessLevel,
    goal: data.goal,
    weeklyTrainingDays: data.weeklyTrainingDays,
    createdAt: now,
    updatedAt: now,
  };
}

/* ===== Validation Helpers ===== */
export function validateOnboardingData(
  data: Partial<OnboardingData>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.age || data.age < 10 || data.age > 120) {
    errors.push('Age must be between 10 and 120');
  }

  if (!data.gender) {
    errors.push('Please select a gender');
  }

  if (!data.height || data.height < 100 || data.height > 250) {
    errors.push('Height must be between 100 and 250 cm');
  }

  if (!data.weight || data.weight < 30 || data.weight > 300) {
    errors.push('Weight must be between 30 and 300 kg');
  }

  if (!data.fitnessLevel) {
    errors.push('Please select a fitness level');
  }

  if (!data.goal) {
    errors.push('Please select a fitness goal');
  }

  if (
    !data.weeklyTrainingDays ||
    data.weeklyTrainingDays.length === 0
  ) {
    errors.push('Please select at least one training day');
  }

  return { valid: errors.length === 0, errors };
}
