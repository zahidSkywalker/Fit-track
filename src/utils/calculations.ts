import { FitnessGoal, Gender, Intensity, IntensityMultiplier } from '@/types/common';

/* ===== Body Mass Index ===== */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): {
  label: string;
  color: 'blue' | 'green' | 'peach' | 'red';
} {
  if (bmi < 18.5) return { label: 'Underweight', color: 'blue' };
  if (bmi < 25) return { label: 'Normal', color: 'green' };
  if (bmi < 30) return { label: 'Overweight', color: 'peach' };
  return { label: 'Obese', color: 'red' };
}

/* ===== Basal Metabolic Rate (Mifflin-St Jeor Equation) ===== */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 0;
  let bmr: number;
  if (gender === Gender.MALE) {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return Math.round(bmr);
}

/* ===== Total Daily Energy Expenditure ===== */
export function calculateTDEE(bmr: number, activityFactor: number): number {
  return Math.round(bmr * activityFactor);
}

/* Activity Factors */
export const ACTIVITY_FACTORS: Record<string, { label: string; value: number }> = {
  sedentary: { label: 'Sedentary (little or no exercise)', value: 1.2 },
  light: { label: 'Light (1-3 days/week)', value: 1.375 },
  moderate: { label: 'Moderate (3-5 days/week)', value: 1.55 },
  active: { label: 'Active (6-7 days/week)', value: 1.725 },
  veryActive: { label: 'Very Active (2x per day)', value: 1.9 },
};

/* ===== Estimated Max Heart Rate ===== */
export function estimateMaxHeartRate(age: number): number {
  // Tanaka formula (more accurate than 220-age for wider range)
  return Math.round(208 - (0.7 * age));
}

/* ===== Heart Rate Zones ===== */
export interface HeartRateZone {
  name: string;
  minPercent: number;
  maxPercent: number;
  minBPM: number;
  maxBPM: number;
  color: string;
}

export function getHeartRateZones(age: number): HeartRateZone[] {
  const maxHR = estimateMaxHeartRate(age);
  const zones = [
    { name: 'Rest', minPercent: 0.5, maxPercent: 0.6, color: '#8ECDA8' },
    { name: 'Fat Burn', minPercent: 0.6, maxPercent: 0.7, color: '#7BA7CC' },
    { name: 'Cardio', minPercent: 0.7, maxPercent: 0.8, color: '#E8A87C' },
    { name: 'Peak', minPercent: 0.8, maxPercent: 0.9, color: '#D4756B' },
    { name: 'Max', minPercent: 0.9, maxPercent: 1.0, color: '#C05A50' },
  ];

  return zones.map((z) => ({
    ...z,
    minBPM: Math.round(maxHR * z.minPercent),
    maxBPM: Math.round(maxHR * z.maxPercent),
  }));
}

/* ===== Estimate Heart Rate During Exercise ===== */
export function estimateExerciseHeartRate(
  age: number,
  intensity: Intensity,
  elapsedMinutes: number
): number {
  const maxHR = estimateMaxHeartRate(age);
  const restingHR = 65; // average resting HR assumption

  // Intensity maps to target HR zone percentage
  const intensityHRPercent: Record<Intensity, number> = {
    [Intensity.LIGHT]: 0.55,
    [Intensity.MODERATE]: 0.65,
    [Intensity.HARD]: 0.78,
    [Intensity.EXTREME]: 0.88,
  };

  // Karvonen formula: HR = ((maxHR - restingHR) × intensity%) + restingHR
  const targetHR =
    (maxHR - restingHR) * intensityHRPercent[intensity] + restingHR;

  // Add warmup ramp (first 3 minutes)
  const rampFactor = Math.min(1, elapsedMinutes / 3);
  const rampedHR = restingHR + (targetHR - restingHR) * rampFactor;

  // Add slight random variation (±3 BPM) to feel realistic
  const variation = (Math.random() - 0.5) * 6;

  return Math.round(Math.max(restingHR, Math.min(maxHR, rampedHR + variation)));
}

/* ===== Workout Calorie Estimation ===== */
export function estimateWorkoutCalories(
  metValue: number,
  weightKg: number,
  durationSeconds: number
): number {
  if (metValue <= 0 || weightKg <= 0 || durationSeconds <= 0) return 0;
  const durationHours = durationSeconds / 3600;
  return Math.round(metValue * weightKg * durationHours);
}

/* ===== Points Calculation ===== */
export function calculateWorkoutPoints(
  durationMinutes: number,
  intensity: Intensity,
  completionPercentage: number
): number {
  const basePoints = durationMinutes * 2;
  const intensityMultiplier = IntensityMultiplier[intensity];
  const completionFactor = Math.max(0, completionPercentage) / 100;
  const points = Math.round(basePoints * intensityMultiplier * completionFactor);
  return Math.max(0, points);
}

/* ===== Calorie Goal Based on Fitness Goal ===== */
export function getCalorieGoal(
  tdee: number,
  goal: FitnessGoal
): number {
  switch (goal) {
    case FitnessGoal.LOSE_WEIGHT:
      return Math.round(tdee * 0.8); // 20% deficit
    case FitnessGoal.BUILD_MUSCLE:
      return Math.round(tdee * 1.15); // 15% surplus
    case FitnessGoal.ENDURANCE:
      return Math.round(tdee * 1.05); // 5% surplus
    case FitnessGoal.FLEXIBILITY:
      return tdee; // maintenance
    case FitnessGoal.GENERAL:
      return tdee; // maintenance
    default:
      return tdee;
  }
}

/* ===== One Rep Max Estimation (Epley Formula) ===== */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/* ===== Total Volume Calculation ===== */
export function calculateTotalVolume(
  sets: Array<{ weight?: number; reps?: number; duration?: number }>
): number {
  return sets.reduce((total, set) => {
    if (set.weight && set.reps) {
      return total + set.weight * set.reps;
    }
    return total;
  }, 0);
}

/* ===== Unit Conversions ===== */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462 * 10) / 10;
}

export function cmToInches(cm: number): number {
  return Math.round(cm / 2.54 * 10) / 10;
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371 * 100) / 100;
}

export function milesToKm(miles: number): number {
  return Math.round(miles / 0.621371 * 100) / 100;
}

/* ===== Pace Calculation (min/km or min/mi) ===== */
export function calculatePace(
  distanceKm: number,
  durationSeconds: number,
  isImperial: boolean = false
): string {
  if (distanceKm <= 0 || durationSeconds <= 0) return '--:--';
  const distance = isImperial ? kmToMiles(distanceKm) : distanceKm;
  const totalMinutes = durationSeconds / 60;
  const paceMinutes = Math.floor(totalMinutes / distance);
  const paceSeconds = Math.round((totalMinutes / distance - paceMinutes) * 60);
  const unit = isImperial ? 'mi' : 'km';
  return `${paceMinutes}:${String(paceSeconds).padStart(2, '0')} /${unit}`;
}

/* ===== Weekly point target based on fitness level ===== */
export function getWeeklyPointTarget(level: string): number {
  switch (level) {
    case 'beginner': return 1200;
    case 'intermediate': return 2400;
    case 'advanced': return 3600;
    default: return 2400;
  }
}

/* ===== Daily calorie burn target ===== */
export function getDailyCalorieTarget(level: string): number {
  switch (level) {
    case 'beginner': return 200;
    case 'intermediate': return 400;
    case 'advanced': return 600;
    default: return 400;
  }
}

/* ===== Endurance success rate (based on meeting duration targets) ===== */
export function calculateEnduranceSuccess(
  plannedMinutes: number,
  completedMinutes: number
): number {
  if (plannedMinutes <= 0) return 0;
  return Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100));
}
