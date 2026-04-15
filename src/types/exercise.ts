import { MuscleGroup, ExerciseCategory, Difficulty } from './common';

/* ===== Single Exercise Definition ===== */
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  difficulty: Difficulty;
  metValue: number; // Metabolic Equivalent of Task
  caloriesPerMinute: number; // at 70kg bodyweight reference
  description: string;
  instructions: string[];
  tips: string[];
  equipment: string[];
  isBodyweight: boolean;
  imageKeyword: string; // used for SVG placeholder rendering
}

/* ===== Exercise Filter Options ===== */
export interface ExerciseFilters {
  search: string;
  categories: ExerciseCategory[];
  muscles: MuscleGroup[];
  difficulties: Difficulty[];
  bodyweightOnly: boolean;
}

/* ===== Default Filter Factory ===== */
export function createDefaultExerciseFilters(): ExerciseFilters {
  return {
    search: '',
    categories: [],
    muscles: [],
    difficulties: [],
    bodyweightOnly: false,
  };
}

/* ===== Filter Logic ===== */
export function filterExercises(
  exercises: Exercise[],
  filters: ExerciseFilters
): Exercise[] {
  return exercises.filter((ex) => {
    // Search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      if (
        !ex.name.toLowerCase().includes(query) &&
        !ex.description.toLowerCase().includes(query) &&
        !ex.equipment.some((e) => e.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    // Category
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(ex.category)
    ) {
      return false;
    }

    // Primary or secondary muscle
    if (filters.muscles.length > 0) {
      const allMuscles = [...ex.primaryMuscles, ...ex.secondaryMuscles];
      if (!filters.muscles.some((m) => allMuscles.includes(m))) {
        return false;
      }
    }

    // Difficulty
    if (
      filters.difficulties.length > 0 &&
      !filters.difficulties.includes(ex.difficulty)
    ) {
      return false;
    }

    // Bodyweight only
    if (filters.bodyweightOnly && !ex.isBodyweight) {
      return false;
    }

    return true;
  });
}
