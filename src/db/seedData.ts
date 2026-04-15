import { getDB, isOnboardingNeeded } from './database';
import { createUser, saveUserSettings } from './userDb';
import {
  createWorkoutPlan,
  getFeaturedWorkoutPlans,
} from './workoutDb';
import type { User } from '@/types/user';
import type { WorkoutPlan, WorkoutExercise } from '@/types/workout';
import type { Exercise } from '@/types/exercise';
import { EXERCISES } from '@/constants/exercises';
import {
  FitnessLevel,
  Gender,
  FitnessGoal,
  Difficulty,
  Intensity,
  MuscleGroup,
  ExerciseCategory,
} from '@/types/common';
import { createDefaultSettings } from '@/types/user';
import { generateId } from '@/utils/helpers';

/* ===== Build a WorkoutExercise from exercise ID ===== */
function buildWorkoutExercise(
  exerciseId: string,
  order: number,
  targetSets: number,
  targetReps?: number,
  targetDuration?: number,
  restDuration: number = 60,
  notes?: string
): WorkoutExercise {
  const exercise = EXERCISES.find((e) => e.id === exerciseId);
  if (!exercise) {
    throw new Error(`Exercise not found: ${exerciseId}`);
  }
  return {
    id: generateId(),
    exerciseId: exercise.id,
    exercise,
    targetSets,
    targetReps,
    targetDuration,
    restDuration,
    notes,
    order,
  };
}

/* ===== Seed Pre-built Workout Plans ===== */
function getSeedWorkoutPlans(): WorkoutPlan[] {
  const now = new Date().toISOString();

  // Helper to compute primary muscles from exercises
  function getPrimaryMuscles(exercises: WorkoutExercise[]): MuscleGroup[] {
    const muscleCount: Record<string, number> = {};
    for (const we of exercises) {
      for (const m of we.exercise.primaryMuscles) {
        muscleCount[m] = (muscleCount[m] || 0) + 1;
      }
    }
    return Object.entries(muscleCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([m]) => m as MuscleGroup);
  }

  function estimateDuration(exercises: WorkoutExercise[]): number {
    let totalSec = 0;
    for (const we of exercises) {
      if (we.targetDuration) {
        totalSec += we.targetDuration * we.targetSets;
      } else if (we.targetReps) {
        // Assume ~3 seconds per rep + rest
        totalSec += we.targetReps * 3 * we.targetSets;
      }
      totalSec += we.restDuration * (we.targetSets - 1);
      // Add transition time
      totalSec += 15;
    }
    return Math.ceil(totalSec / 60);
  }

  // ===== 1. Full Body Strength =====
  const fullBodyExercises: WorkoutExercise[] = [
    buildWorkoutExercise('squats', 0, 4, 12, undefined, 90),
    buildWorkoutExercise('push-ups', 1, 3, 15, undefined, 60),
    buildWorkoutExercise('barbell-row', 2, 4, 10, undefined, 90),
    buildWorkoutExercise('shoulder-press', 3, 3, 12, undefined, 60),
    buildWorkoutExercise('plank', 4, 3, undefined, 45, 45),
    buildWorkoutExercise('lunges', 5, 3, 12, undefined, 60),
    buildWorkoutExercise('dips', 6, 3, 10, undefined, 60),
  ];

  // ===== 2. Upper Body Power =====
  const upperBodyExercises: WorkoutExercise[] = [
    buildWorkoutExercise('bench-press', 0, 4, 10, undefined, 90),
    buildWorkoutExercise('barbell-row', 1, 4, 10, undefined, 90),
    buildWorkoutExercise('shoulder-press', 2, 3, 12, undefined, 60),
    buildWorkoutExercise('bicep-curl', 3, 3, 12, undefined, 60),
    buildWorkoutExercise('tricep-extension', 4, 3, 12, undefined, 60),
    buildWorkoutExercise('lateral-raise', 5, 3, 15, undefined, 45),
    buildWorkoutExercise('face-pull', 6, 3, 15, undefined, 45),
    buildWorkoutExercise('push-ups', 7, 3, 20, undefined, 60),
  ];

  // ===== 3. Lower Body Blast =====
  const lowerBodyExercises: WorkoutExercise[] = [
    buildWorkoutExercise('squats', 0, 4, 12, undefined, 90),
    buildWorkoutExercise('lunges', 1, 3, 12, undefined, 60),
    buildWorkoutExercise('deadlift', 2, 4, 8, undefined, 120),
    buildWorkoutExercise('leg-press', 3, 3, 12, undefined, 90),
    buildWorkoutExercise('leg-extension', 4, 3, 15, undefined, 60),
    buildWorkoutExercise('leg-curl', 5, 3, 15, undefined, 60),
    buildWorkoutExercise('calf-raise', 6, 4, 20, undefined, 45),
    buildWorkoutExercise('hip-thrust', 7, 3, 12, undefined, 60),
  ];

  // ===== 4. Core Crusher =====
  const coreExercises: WorkoutExercise[] = [
    buildWorkoutExercise('crunch', 0, 3, 20, undefined, 30),
    buildWorkoutExercise('plank', 1, 3, undefined, 60, 30),
    buildWorkoutExercise('russian-twist', 2, 3, 20, undefined, 30),
    buildWorkoutExercise('leg-raise', 3, 3, 15, undefined, 30),
    buildWorkoutExercise('mountain-climber', 4, 3, undefined, 30, 45),
    buildWorkoutExercise('sit-up', 5, 3, 15, undefined, 30),
    buildWorkoutExercise('hanging-leg-raise', 6, 3, 10, undefined, 45),
    buildWorkoutExercise('commando-plank', 7, 3, undefined, 30, 30),
  ];

  // ===== 5. HIIT Cardio Blast =====
  const hiitExercises: WorkoutExercise[] = [
    buildWorkoutExercise('burpee', 0, 4, 10, undefined, 45),
    buildWorkoutExercise('mountain-climber', 1, 4, undefined, 30, 30),
    buildWorkoutExercise('jumping-jacks', 2, 4, undefined, 30, 20),
    buildWorkoutExercise('box-jumps', 3, 3, 12, undefined, 60),
    buildWorkoutExercise('jump-rope-fast', 4, 4, undefined, 45, 30),
    buildWorkoutExercise('sprint-intervals', 5, 6, undefined, 20, 40),
  ];

  // ===== 6. Morning Yoga Flow =====
  const yogaExercises: WorkoutExercise[] = [
    buildWorkoutExercise('yoga-hatha', 0, 1, undefined, 600, 0),
    buildWorkoutExercise('stretching-general', 1, 1, undefined, 300, 0),
    buildWorkoutExercise('mobility-work', 2, 1, undefined, 300, 0),
  ];

  // ===== 7. Push Day =====
  const pushExercises: WorkoutExercise[] = [
    buildWorkoutExercise('bench-press', 0, 4, 10, undefined, 90),
    buildWorkoutExercise('incline-bench-press', 1, 3, 10, undefined, 90),
    buildWorkoutExercise('shoulder-press', 2, 4, 10, undefined, 60),
    buildWorkoutExercise('lateral-raise', 3, 3, 15, undefined, 45),
    buildWorkoutExercise('tricep-pushdown', 4, 3, 12, undefined, 60),
    buildWorkoutExercise('skull-crusher', 5, 3, 12, undefined, 60),
    buildWorkoutExercise('dumbbell-fly', 6, 3, 12, undefined, 60),
  ];

  // ===== 8. Pull Day =====
  const pullExercises: WorkoutExercise[] = [
    buildWorkoutExercise('deadlift', 0, 4, 8, undefined, 120),
    buildWorkoutExercise('pull-down', 1, 4, 10, undefined, 60),
    buildWorkoutExercise('barbell-row', 2, 4, 10, undefined, 90),
    buildWorkoutExercise('dumbbell-row', 3, 3, 12, undefined, 60),
    buildWorkoutExercise('bicep-curl', 4, 3, 12, undefined, 60),
    buildWorkoutExercise('hammer-curl', 5, 3, 12, undefined, 60),
    buildWorkoutExercise('face-pull', 6, 3, 15, undefined, 45),
  ];

  // ===== 9. 10K Marathon Training =====
  const marathonExercises: WorkoutExercise[] = [
    buildWorkoutExercise('running-6mph', 0, 1, undefined, 1800, 0), // 30 min run
    buildWorkoutExercise('stretching-general', 1, 1, undefined, 300, 0), // 5 min stretch
  ];

  // ===== 10. Chest & Shoulders =====
  const chestShoulderExercises: WorkoutExercise[] = [
    buildWorkoutExercise('bench-press', 0, 4, 10, undefined, 90),
    buildWorkoutExercise('incline-bench-press', 1, 3, 10, undefined, 90),
    buildWorkoutExercise('dumbbell-fly', 2, 3, 12, undefined, 60),
    buildWorkoutExercise('shoulder-press', 3, 4, 10, undefined, 60),
    buildWorkoutExercise('lateral-raise', 4, 3, 15, undefined, 45),
    buildWorkoutExercise('front-raise', 5, 3, 12, undefined, 45),
    buildWorkoutExercise('chest-dip', 6, 3, 12, undefined, 60),
  ];

  // ===== 11. Back & Biceps =====
  const backBicepsExercises: WorkoutExercise[] = [
    buildWorkoutExercise('pull-down', 0, 4, 10, undefined, 60),
    buildWorkoutExercise('barbell-row', 1, 4, 10, undefined, 90),
    buildWorkoutExercise('cable-row', 2, 3, 12, undefined, 60),
    buildWorkoutExercise('reverse-fly', 3, 3, 15, undefined, 45),
    buildWorkoutExercise('bicep-curl', 4, 3, 12, undefined, 60),
    buildWorkoutExercise('hammer-curl', 5, 3, 12, undefined, 60),
    buildWorkoutExercise('concentration-curl', 6, 3, 10, undefined, 45),
  ];

  // ===== 12. Legs & Glutes =====
  const legsGlutesExercises: WorkoutExercise[] = [
    buildWorkoutExercise('squats', 0, 4, 12, undefined, 90),
    buildWorkoutExercise('romanian-deadlift', 1, 4, 10, undefined, 90),
    buildWorkoutExercise('lunges', 2, 3, 12, undefined, 60),
    buildWorkoutExercise('leg-press', 3, 3, 12, undefined, 90),
    buildWorkoutExercise('hip-thrust', 4, 4, 12, undefined, 60),
    buildWorkoutExercise('leg-extension', 5, 3, 15, undefined, 60),
    buildWorkoutExercise('leg-curl', 6, 3, 15, undefined, 60),
    buildWorkoutExercise('calf-raise', 7, 4, 20, undefined, 45),
  ];

  // ===== 13. Calisthenics Beginner =====
  const calisthenicsExercises: WorkoutExercise[] = [
    buildWorkoutExercise('push-ups', 0, 3, 10, undefined, 60),
    buildWorkoutExercise('pull-ups', 1, 3, 5, undefined, 90),
    buildWorkoutExercise('squats', 2, 3, 15, undefined, 60),
    buildWorkoutExercise('plank', 3, 3, undefined, 30, 30),
    buildWorkoutExercise('lunges', 4, 3, 10, undefined, 60),
    buildWorkoutExercise('dips', 5, 3, 8, undefined, 60),
    buildWorkoutExercise('hanging-leg-raise', 6, 3, 8, undefined, 45),
  ];

  // ===== 14. Cycling Endurance =====
  const cyclingExercises: WorkoutExercise[] = [
    buildWorkoutExercise('cycling-moderate', 0, 1, undefined, 1800, 0), // 30 min
    buildWorkoutExercise('stretching-general', 1, 1, undefined, 300, 0), // 5 min
  ];

  // ===== 15. Power Pilates =====
  const pilatesExercises: WorkoutExercise[] = [
    buildWorkoutExercise('pilates-mat', 0, 1, undefined, 900, 0), // 15 min
    buildWorkoutExercise('plank', 1, 3, undefined, 45, 30),
    buildWorkoutExercise('leg-raise', 2, 3, 15, undefined, 30),
    buildWorkoutExercise('crunch', 3, 3, 20, undefined, 30),
    buildWorkoutExercise('stretching-general', 4, 1, undefined, 300, 0),
  ];

  const plansData: Array<{
    name: string;
    description: string;
    category: string;
    difficulty: Difficulty;
    intensity: Intensity;
    exercises: WorkoutExercise[];
    isFeatured: boolean;
    tags: string[];
  }> = [
    {
      name: 'Full Body Strength',
      description: 'A balanced workout targeting all major muscle groups for overall strength development.',
      category: 'Strength',
      difficulty: Difficulty.INTERMEDIATE,
      intensity: Intensity.MODERATE,
      exercises: fullBodyExercises,
      isFeatured: true,
      tags: ['full body', 'strength', 'balanced'],
    },
    {
      name: 'Upper Body Power',
      description: 'Intense upper body session focusing on chest, back, shoulders, and arms.',
      category: 'Strength',
      difficulty: Difficulty.INTERMEDIATE,
      intensity: Intensity.HARD,
      exercises: upperBodyExercises,
      isFeatured: false,
      tags: ['upper body', 'chest', 'back', 'arms'],
    },
    {
      name: 'Lower Body Blast',
      description: 'Comprehensive leg and glute workout to build lower body power and stability.',
      category: 'Strength',
      difficulty: Difficulty.INTERMEDIATE,
      intensity: Intensity.HARD,
      exercises: lowerBodyExercises,
      isFeatured: false,
      tags: ['lower body', 'legs', 'glutes'],
    },
    {
      name: 'Core Crusher',
      description: 'Intense core workout targeting abs, obliques, and deep stabilizer muscles.',
      category: 'Strength',
      difficulty: Difficulty.INTERMEDIATE,
      intensity: Intensity.MODERATE,
      exercises: coreExercises,
      isFeatured: false,
      tags: ['core', 'abs', 'six pack'],
    },
    {
      name: 'HIIT Cardio Blast',
      description: 'High-intensity interval training to torch calories and boost cardiovascular fitness.',
      category: 'HIIT',
      difficulty: Difficulty.ADVANCED,
      intensity: Intensity.EXTREME,
      exercises: hiitExercises,
      isFeatured: true,
      tags: ['hiit', 'cardio', 'fat burn'],
    },
    {
      name: 'Morning Yoga Flow',
      description: 'Gentle morning yoga and stretching routine to start your day with energy and flexibility.',
      category: 'Flexibility',
      difficulty: Difficulty.BEGINNER,
      intensity: Intensity.LIGHT,
      exercises: yogaExercises,
      isFeatured: false,
      tags: ['yoga', 'stretching', 'morning', 'flexibility'],
    },
    {
      name: 'Push Day',
      description: 'Chest, shoulders, and triceps focused pushing workout for hypertrophy.',
      category: 'Strength',
      difficulty: Difficulty.INTERMEDIATE,
      intensity: Intensity.HARD,
      exercises: pushExercises,
      isFeatured: false,
      tags: ['push', 'chest', 'shoulders', 'triceps', 'PPL'],
    },
    {
      name: 'Pull Day',
      description: 'Back and biceps focused pulling workout for a thick, wide back.',
      category: 'Strength',
      difficulty: Difficulty.INTERMEDIATE,
      intensity: Intensity.HARD,
      exercises: pullExercises,
      isFeatured: false,
      tags: ['pull', 'back', 'biceps', 'PPL'],
    },
    {
      name: '10K Marathon Prep',
      description: 'Steady-state running session to build endurance for a 10K race.',
      category: 'Cardio',
      difficulty: Difficulty.INTERMEDIATE,
      intensity: Intensity.MODERATE,
      exercises: marathonExercises,
      isFeatured: true,
      tags: ['running', 'marathon', '10K', 'endurance'],
    },
    {
      name: 'Chest & Shoulders',
      description: 'Targeted workout for a strong, sculpted upper body push frame.',
      category: 'Strength',
      difficulty: Difficulty.INTERMEDIATE,
      intensity: Intensity.MODERATE,
      exercises: chestShoulderExercises,
      isFeatured: false,
      tags: ['chest', 'shoulders', 'push'],
    },
    {
      name: 'Back & Biceps',
      description: 'Build a wide back and peaked biceps with this pull-focused session.',
      category: 'Strength',
      difficulty: Difficulty.INTERMEDIATE,
      intensity: Intensity.MODERATE,
      exercises: backBicepsExercises,
      isFeatured: false,
      tags: ['back', 'biceps', 'pull'],
    },
    {
      name: 'Legs & Glutes',
      description: 'Complete lower body demolition — quads, hamstrings, glutes, and calves.',
      category: 'Strength',
      difficulty: Difficulty.ADVANCED,
      intensity: Intensity.HARD,
      exercises: legsGlutesExercises,
      isFeatured: false,
      tags: ['legs', 'glutes', 'lower body'],
    },
    {
      name: 'Calisthenics Beginner',
      description: 'Bodyweight-only workout perfect for beginners starting their fitness journey.',
      category: 'Calisthenics',
      difficulty: Difficulty.BEGINNER,
      intensity: Intensity.LIGHT,
      exercises: calisthenicsExercises,
      isFeatured: false,
      tags: ['calisthenics', 'bodyweight', 'beginner'],
    },
    {
      name: 'Cycling Endurance',
      description: 'Steady cycling session to build leg endurance and cardiovascular capacity.',
      category: 'Cardio',
      difficulty: Difficulty.BEGINNER,
      intensity: Intensity.MODERATE,
      exercises: cyclingExercises,
      isFeatured: false,
      tags: ['cycling', 'cardio', 'endurance'],
    },
    {
      name: 'Power Pilates',
      description: 'Core-focused Pilates session combining strength, flexibility, and control.',
      category: 'Flexibility',
      difficulty: Difficulty.INTERMEDIATE,
      intensity: Intensity.MODERATE,
      exercises: pilatesExercises,
      isFeatured: false,
      tags: ['pilates', 'core', 'flexibility'],
    },
  ];

  return plansData.map((pd) => ({
    id: generateId(),
    name: pd.name,
    description: pd.description,
    category: pd.category,
    difficulty: pd.difficulty,
    intensity: pd.intensity,
    estimatedDuration: estimateDuration(pd.exercises),
    exercises: pd.exercises,
    primaryMuscles: getPrimaryMuscles(pd.exercises),
    isCustom: false,
    isFeatured: pd.isFeatured,
    tags: pd.tags,
    createdAt: now,
    updatedAt: now,
  }));
}

/* ===== Main Seed Function ===== */
export async function seedDatabase(): Promise<void> {
  const needsOnboarding = await isOnboardingNeeded();
  const db = await getDB();

  // Always seed workout plans (they're shared templates, not user-specific)
  const existingPlans = await db.count('workoutPlans');
  if (existingPlans === 0) {
    console.log('[Seed] Seeding workout plans...');
    const plans = getSeedWorkoutPlans();
    for (const plan of plans) {
      await createWorkoutPlan(plan);
    }
    console.log(`[Seed] Seeded ${plans.length} workout plans`);
  }

  // If no user exists, we don't create one — onboarding will handle that
  if (needsOnboarding) {
    console.log('[Seed] No user found — onboarding required');
  } else {
    console.log('[Seed] User exists — skipping user seed');
  }
}

/* ===== Seed Demo User (optional, for development) ===== */
export async function seedDemoUser(): Promise<string> {
  const demoUser: User = {
    id: 'demo-user-001',
    name: 'Sophia',
    age: 28,
    gender: Gender.FEMALE,
    height: 165,
    weight: 60,
    fitnessLevel: FitnessLevel.INTERMEDIATE,
    goal: FitnessGoal.GENERAL,
    weeklyTrainingDays: ['mon', 'wed', 'fri', 'sat'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const db = await getDB();
  const existing = await db.get('users', demoUser.id);
  if (!existing) {
    await createUser(demoUser);
    const settings = createDefaultSettings(demoUser.id);
    await saveUserSettings(settings);
    console.log('[Seed] Demo user "Sophia" created');
  }

  return demoUser.id;
}
