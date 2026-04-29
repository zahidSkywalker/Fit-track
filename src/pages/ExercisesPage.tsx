import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { NeuInput } from '@/components/ui/NeuInput';
import { Tabs } from '@/components/ui/Tabs';
import { BottomSheet } from '@/components/ui/Modal';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { DifficultyBadge, CategoryBadge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EXERCISES } from '@/constants/exercises';
import { filterExercises, createDefaultExerciseFilters, type ExerciseFilters } from '@/types/exercise';
import {
  EXERCISE_CATEGORY_LABELS,
  EXERCISE_CATEGORY_ORDER,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUP_ORDER,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  ExerciseCategory,
  MuscleGroup,
  Difficulty,
} from '@/types/common';
import { staggerContainer } from '@/animations/stagger';

export const ExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ExerciseFilters>(createDefaultExerciseFilters());
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');

  const filteredExercises = useMemo(() => {
    let result = filterExercises(EXERCISES, filters);
    if (activeCategoryTab !== 'all') {
      result = result.filter((e) => e.category === activeCategoryTab);
    }
    return result;
  }, [filters, activeCategoryTab]);

  const categoryTabs = [
    { id: 'all', label: 'All', count: EXERCISES.length },
    ...EXERCISE_CATEGORY_ORDER.map((cat) => ({
      id: cat,
      label: EXERCISE_CATEGORY_LABELS[cat],
      count: EXERCISES.filter((e) => e.category === cat).length,
    })),
  ];

  const toggleMuscle = (m: MuscleGroup) => {
    setFilters((prev) => ({
      ...prev,
      muscles: prev.muscles.includes(m)
        ? prev.muscles.filter((x) => x !== m)
        : [...prev.muscles, m],
    }));
  };

  const toggleDifficulty = (d: Difficulty) => {
    setFilters((prev) => ({
      ...prev,
      difficulties: prev.difficulties.includes(d)
        ? prev.difficulties.filter((x) => x !== d)
        : [...prev.difficulties, d],
    }));
  };

  const toggleBodyweight = () => {
    setFilters((prev) => ({ ...prev, bodyweightOnly: !prev.bodyweightOnly }));
  };

  const clearFilters = () => {
    setFilters(createDefaultExerciseFilters());
  };

  const hasFilters = filters.search || filters.muscles.length > 0 || filters.difficulties.length > 0 || filters.bodyweightOnly;

  return (
    <div className="page-container pt-2">
      <PageHeader
        title="Exercises"
        subtitle={`${EXERCISES.length} exercises`}
      />

      {/* Search */}
      <div className="mt-3">
        <NeuInput
          placeholder="Search exercises..."
          variant="pressed"
          inputSize="sm"
          value={filters.search}
          onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
          leftIcon={<Search size={14} />}
          rightIcon={
            <motion.button
              onClick={() => setShowFilters(true)}
              className={`p-0.5 ${hasFilters ? 'text-neu-blue' : 'text-neu-text-tertiary'}`}
              whileTap={{ scale: 0.9 }}
            >
              <SlidersHorizontal size={14} />
            </motion.button>
          }
        />
      </div>

      {/* Category tabs */}
      <div className="mt-4">
        <Tabs
          tabs={categoryTabs}
          activeTab={activeCategoryTab}
          onTabChange={setActiveCategoryTab}
          variant="pill"
        />
      </div>

      {/* Exercise list */}
      {filteredExercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 neu-raised-circle flex items-center justify-center mb-4">
            <Search size={24} className="text-neu-text-tertiary" />
          </div>
          <p className="text-sm font-bold text-neu-text-secondary">No exercises found</p>
          <NeuButtonGhost size="sm" onClick={clearFilters} className="mt-4">
            Clear Filters
          </NeuButtonGhost>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-3 mt-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onTap={() => navigate(`/exercises/${exercise.id}`)}
            />
          ))}
        </motion.div>
      )}

      {/* Filter sheet */}
      <BottomSheet isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filter Exercises" dragHandle>
        <div className="flex flex-col gap-5">
          {/* Muscles */}
          <div>
            <p className="text-xs font-bold text-neu-text-secondary mb-2.5">Muscle Group</p>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_GROUP_ORDER.filter((m) => m !== 'full_body').map((m) => (
                <motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => toggleMuscle(m)}>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      filters.muscles.includes(m)
                        ? 'bg-neu-blue text-white'
                        : 'neu-flat text-neu-text-secondary'
                    }`}
                    style={filters.muscles.includes(m) ? { background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)', boxShadow: '2px 2px 4px #C8BFB5, -2px -2px 4px #F5EDE5' } : undefined}
                  >
                    {MUSCLE_GROUP_LABELS[m]}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-xs font-bold text-neu-text-secondary mb-2.5">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_ORDER.map((d) => (
                <motion.button key={d} whileTap={{ scale: 0.95 }} onClick={() => toggleDifficulty(d)}>
                  <DifficultyBadge
                    difficulty={DIFFICULTY_LABELS[d]}
                    size="md"
                    variant={filters.difficulties.includes(d) ? 'filled' : 'outline'}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Bodyweight only */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neu-text-secondary">Bodyweight Only</span>
            <button
              className={`w-11 h-6 rounded-full transition-all ${filters.bodyweightOnly ? 'bg-neu-blue' : 'neu-flat'}`}
              style={filters.bodyweightOnly ? { background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)', boxShadow: '2px 2px 4px #C8BFB5, -2px -2px 4px #F5EDE5' } : { boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5', backgroundColor: '#E8E0D8' }}
              onClick={toggleBodyweight}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${filters.bodyweightOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <NeuButtonGhost size="md" fullWidth onClick={clearFilters}>Reset</NeuButtonGhost>
            <NeuButton variant="accent" accent="blue" size="md" fullWidth onClick={() => setShowFilters(false)}>Apply</NeuButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default ExercisesPage;
