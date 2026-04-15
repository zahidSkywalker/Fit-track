/* ===== MET (Metabolic Equivalent of Task) Values =====
 * Source: Ainsworth BE, et al. (2011) Compendium of Physical Activities.
 * Public domain data — no license required.
 *
 * MET × body_weight_kg × hours = kilocalories
 * At rest (sitting quietly) = 1.0 MET
 */

export const MET_VALUES: Record<string, number> = {
  // ===== STRENGTH EXERCISES =====
  'push-ups': 3.8,
  'pull-ups': 8.0,
  'chin-ups': 8.0,
  'dips': 5.0,
  'squats': 5.0,
  'lunges': 5.0,
  'deadlift': 6.0,
  'bench-press': 5.0,
  'incline-bench-press': 5.0,
  'dumbbell-fly': 4.0,
  'shoulder-press': 4.5,
  'lateral-raise': 3.5,
  'front-raise': 3.0,
  'bicep-curl': 3.0,
  'hammer-curl': 3.0,
  'tricep-extension': 3.0,
  'tricep-pushdown': 3.0,
  'skull-crusher': 3.5,
  'barbell-row': 5.0,
  'dumbbell-row': 4.5,
  'pull-down': 4.5,
  'cable-row': 4.0,
  'leg-press': 4.5,
  'leg-extension': 3.5,
  'leg-curl': 3.5,
  'calf-raise': 3.0,
  'plank': 3.8,
  'crunch': 3.5,
  'sit-up': 3.8,
  'russian-twist': 3.5,
  'leg-raise': 3.5,
  'mountain-climber': 8.0,
  'burpee': 8.0,
  'kettlebell-swing': 6.0,
  'turkish-get-up': 4.5,
  'hip-thrust': 4.0,
  'romanian-deadlift': 5.0,
  'good-morning': 4.0,
  'face-pull': 3.0,
  'shrug': 3.0,
  'preacher-curl': 3.0,
  'concentration-curl': 2.8,
  'reverse-fly': 3.0,
  'chest-dip': 5.5,
  'close-grip-bench-press': 4.5,
  'overhead-tricep-extension': 3.2,

  // ===== CARDIO EXERCISES =====
  'running-5mph': 8.3,
  'running-6mph': 9.8,
  'running-7mph': 11.0,
  'running-8mph': 12.5,
  'running-10mph': 14.5,
  'running-treadmill': 9.0,
  'walking-3mph': 3.5,
  'walking-4mph': 4.3,
  'walking-brisk': 5.0,
  'cycling-light': 6.8,
  'cycling-moderate': 8.0,
  'cycling-vigorous': 10.0,
  'cycling-stationary-light': 6.0,
  'cycling-stationary-moderate': 8.5,
  'cycling-stationary-vigorous': 10.5,
  'jump-rope-slow': 10.0,
  'jump-rope-moderate': 11.5,
  'jump-rope-fast': 12.5,
  'rowing-machine-light': 4.5,
  'rowing-machine-moderate': 7.0,
  'rowing-machine-vigorous': 8.5,
  'elliptical-light': 5.0,
  'elliptical-moderate': 6.5,
  'elliptical-vigorous': 8.0,
  'stair-climbing': 9.0,
  'stair-stepper': 7.0,
  'swimming-light': 6.0,
  'swimming-moderate': 8.0,
  'swimming-vigorous': 10.0,
  'dancing': 5.5,
  'jumping-jacks': 7.0,

  // ===== HIIT EXERCISES =====
  'hiit-general': 8.5,
  'tabata': 10.0,
  'sprint-intervals': 12.0,
  'box-jumps': 8.0,
  'battle-ropes': 10.0,
  'sledgehammer': 9.0,
  'tire-flip': 8.5,

  // ===== CALISTHENICS =====
  'handstand': 2.8,
  'handstand-push-up': 8.0,
  'l-sit': 3.5,
  'muscle-up': 10.0,
  'pistol-squat': 6.0,
  'hanging-leg-raise': 5.0,
  'toes-to-bar': 6.0,
  'commando-plank': 5.0,

  // ===== FLEXIBILITY =====
  'yoga-hatha': 2.5,
  'yoga-vinyasa': 4.0,
  'yoga-power': 5.5,
  'yoga-bikram': 5.0,
  'stretching-general': 2.3,
  'foam-rolling': 2.5,
  'pilates-mat': 3.0,
  'pilates-reformer': 4.0,
  'mobility-work': 2.8,
};

/* ===== Calorie calculation from MET ===== */
export function calculateCaloriesFromMET(
  met: number,
  weightKg: number,
  durationMinutes: number
): number {
  if (weightKg <= 0 || durationMinutes <= 0 || met <= 0) return 0;
  return Math.round(met * weightKg * (durationMinutes / 60));
}

/* ===== Calories per minute at reference weight (70kg) ===== */
export function caloriesPerMinute(met: number, weightKg: number = 70): number {
  return Math.round((met * weightKg) / 60 * 10) / 10;
}
