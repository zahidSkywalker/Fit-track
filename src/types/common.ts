/* ===== Fitness Level ===== */
export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/* ===== Gender ===== */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

/* ===== Fitness Goals ===== */
export enum FitnessGoal {
  LOSE_WEIGHT = 'lose_weight',
  BUILD_MUSCLE = 'build_muscle',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  GENERAL = 'general',
}

/* ===== Exercise Difficulty ===== */
export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

/* ===== Exercise Category ===== */
export enum ExerciseCategory {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  HIIT = 'hiit',
  CALISTHENICS = 'calisthenics',
}

/* ===== Muscle Groups ===== */
export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  LEGS = 'legs',
  CORE = 'core',
  GLUTES = 'glutes',
  FULL_BODY = 'full_body',
}

/* ===== Unit System ===== */
export enum UnitSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

/* ===== Workout Intensity ===== */
export enum Intensity {
  LIGHT = 'light',
  MODERATE = 'moderate',
  HARD = 'hard',
  EXTREME = 'extreme',
}

/* ===== Workout Status ===== */
export enum WorkoutStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/* ===== Timer State ===== */
export enum TimerState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

/* ===== Challenge Type ===== */
export enum ChallengeType {
  DAILY = 'daily',
  DISTANCE = 'distance',
  DURATION = 'duration',
  REPETITION = 'repetition',
  STREAK = 'streak',
}

/* ===== Week Day ===== */
export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const WEEK_DAYS_ORDER: WeekDay[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

/* ===== Display Label Maps ===== */
export const FITNESS_LEVEL_LABELS: Record<FitnessLevel, string> = {
  [FitnessLevel.BEGINNER]: 'Beginner',
  [FitnessLevel.INTERMEDIATE]: 'Intermediate',
  [FitnessLevel.ADVANCED]: 'Advanced',
};

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Male',
  [Gender.FEMALE]: 'Female',
  [Gender.OTHER]: 'Other',
};

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  [FitnessGoal.LOSE_WEIGHT]: 'Lose Weight',
  [FitnessGoal.BUILD_MUSCLE]: 'Build Muscle',
  [FitnessGoal.ENDURANCE]: 'Endurance',
  [FitnessGoal.FLEXIBILITY]: 'Flexibility',
  [FitnessGoal.GENERAL]: 'General Fitness',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.BEGINNER]: 'Beginner',
  [Difficulty.INTERMEDIATE]: 'Intermediate',
  [Difficulty.ADVANCED]: 'Advanced',
  [Difficulty.EXPERT]: 'Expert',
};

export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  [ExerciseCategory.STRENGTH]: 'Strength',
  [ExerciseCategory.CARDIO]: 'Cardio',
  [ExerciseCategory.FLEXIBILITY]: 'Flexibility',
  [ExerciseCategory.HIIT]: 'HIIT',
  [ExerciseCategory.CALISTHENICS]: 'Calisthenics',
};

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: 'Chest',
  [MuscleGroup.BACK]: 'Back',
  [MuscleGroup.SHOULDERS]: 'Shoulders',
  [MuscleGroup.BICEPS]: 'Biceps',
  [MuscleGroup.TRICEPS]: 'Triceps',
  [MuscleGroup.LEGS]: 'Legs',
  [MuscleGroup.CORE]: 'Core',
  [MuscleGroup.GLUTES]: 'Glutes',
  [MuscleGroup.FULL_BODY]: 'Full Body',
};

export const INTENSITY_LABELS: Record<Intensity, string> = {
  [Intensity.LIGHT]: 'Light',
  [Intensity.MODERATE]: 'Moderate',
  [Intensity.HARD]: 'Hard',
  [Intensity.EXTREME]: 'Extreme',
};

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export const INTENSITY_MULTIPLIERS: Record<Intensity, number> = {
  [Intensity.LIGHT]: 1.0,
  [Intensity.MODERATE]: 1.5,
  [Intensity.HARD]: 2.0,
  [Intensity.EXTREME]: 2.5,
};

export const DIFFICULTY_ORDER: Difficulty[] = [
  Difficulty.BEGINNER,
  Difficulty.INTERMEDIATE,
  Difficulty.ADVANCED,
  Difficulty.EXPERT,
];

export const MUSCLE_GROUP_ORDER: MuscleGroup[] = [
  MuscleGroup.SHOULDERS,
  MuscleGroup.BACK,
  MuscleGroup.CHEST,
  MuscleGroup.BICEPS,
  MuscleGroup.TRICEPS,
  MuscleGroup.LEGS,
  MuscleGroup.CORE,
  MuscleGroup.GLUTES,
  MuscleGroup.FULL_BODY,
];

export const EXERCISE_CATEGORY_ORDER: ExerciseCategory[] = [
  ExerciseCategory.STRENGTH,
  ExerciseCategory.CARDIO,
  ExerciseCategory.HIIT,
  ExerciseCategory.CALISTHENICS,
  ExerciseCategory.FLEXIBILITY,
];
