import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { NeuInput } from '@/components/ui/NeuInput';
import { NeuButton } from '@/components/ui/NeuButton';
import { Tabs } from '@/components/ui/Tabs';
import { WorkoutPlanCard } from '@/components/workout/WorkoutPlanCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { staggerContainer } from '@/animations/stagger';
import { filterWorkoutPlans, type WorkoutFilters } from '@/types/workout';
import { EXERCISE_CATEGORY_LABELS, DIFFICULTY_LABELS, type ExerciseCategory, type Difficulty } from '@/types/common';
import { BottomSheet } from '@/components/ui/Modal';
import { DifficultyBadge, CategoryBadge } from '@/components/ui/Badge';

const ALL_TAB = 'all';
const FEATURED_TAB = 'featured';
const CUSTOM_TAB = 'custom';

export const WorkoutsPage: React.FC = () => {
  const navigate = useNavigate();
  const { workoutPlans, customPlans, featuredPlans, plansLoading, loadWorkoutPlans, loadCustomPlans, loadFeaturedPlans } = useWorkoutStore();
  const [activeTab, setActiveTab] = useState(ALL_TAB);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterDifficulties, setFilterDifficulties] = useState<string[]>([]);

  React.useEffect(() => {
    loadWorkoutPlans();
    loadCustomPlans();
    loadFeaturedPlans();
  }, [loadWorkoutPlans, loadCustomPlans, loadFeaturedPlans]);

  const filters: WorkoutFilters = useMemo(() => ({
    search: searchQuery,
    categories: filterCategories,
    difficulties: filterDifficulties as Difficulty[],
    muscles: [],
    customOnly: false,
    featuredOnly: false,
  }), [searchQuery, filterCategories, filterDifficulties]);

  const sourcePlans = useMemo(() => {
    if (activeTab === FEATURED_TAB) return featuredPlans;
    if (activeTab === CUSTOM_TAB) return customPlans;
    return workoutPlans;
  }, [activeTab, featuredPlans, customPlans, workoutPlans]);

  const filteredPlans = useMemo(() => {
    let result = sourcePlans;
    if (activeTab === ALL_TAB) {
      result = filterWorkoutPlans(result, filters);
    } else {
      // For featured/custom, just apply search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
      }
    }
    return result;
  }, [sourcePlans, filters, activeTab, searchQuery]);

  const tabs = [
    { id: ALL_TAB, label: 'All', count: workoutPlans.length },
    { id: FEATURED_TAB, label: 'Featured', count: featuredPlans.length },
    { id: CUSTOM_TAB, label: 'My Plans', count: customPlans.length },
  ];

  const toggleCategory = (cat: string) => {
    setFilterCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleDifficulty = (diff: string) => {
    setFilterDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const clearFilters = () => {
    setFilterCategories([]);
    setFilterDifficulties([]);
    setSearchQuery('');
  };

  const hasActiveFilters = filterCategories.length > 0 || filterDifficulties.length > 0;

  return (
    <div className="page-container pt-2">
      <PageHeader
        title="Workouts"
        subtitle={`${workoutPlans.length} plans available`}
        rightAction={
          <NeuButtonIcon
            onClick={() => navigate('/workouts/new')}
            accent="blue"
            icon={<Plus size={18} className="text-neu-blue" />}
          />
        }
      />

      {/* Search + filter toggle */}
      <div className="flex gap-2 mt-3">
        <div className="flex-1">
          <NeuInput
            placeholder="Search workouts..."
            variant="pressed"
            inputSize="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
        <motion.button
          className={`neu-pressed-sm w-10 h-10 flex items-center justify-center neu-pressable ${hasActiveFilters ? 'text-neu-blue' : 'text-neu-text-secondary'}`}
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={16} />
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="mt-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pill"
        />
      </div>

      {/* Workout list */}
      {plansLoading ? (
        <div className="flex flex-col gap-3 mt-4">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 neu-raised-circle flex items-center justify-center mb-4">
            <Search size={24} className="text-neu-text-tertiary" />
          </div>
          <p className="text-sm font-bold text-neu-text-secondary">No workouts found</p>
          <p className="text-xs text-neu-text-tertiary mt-1">Try adjusting your search or filters</p>
          {hasActiveFilters && (
            <NeuButtonGhost size="sm" onClick={clearFilters} className="mt-4">
              Clear Filters
            </NeuButtonGhost>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col gap-3 mt-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredPlans.map((plan) => (
            <WorkoutPlanCard
              key={plan.id}
              plan={plan}
              onTap={() => navigate(`/workouts/${plan.id}`)}
            />
          ))}
        </motion.div>
      )}

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Workouts"
        dragHandle
      >
        <div className="flex flex-col gap-5">
          {/* Categories */}
          <div>
            <p className="text-xs font-bold text-neu-text-secondary mb-2.5">Category</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(EXERCISE_CATEGORY_LABELS) as [string, string][]).map(([key, label]) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleCategory(key)}
                >
                  <CategoryBadge
                    category={label}
                    size="md"
                    variant={filterCategories.includes(key) ? 'filled' : 'outline'}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-xs font-bold text-neu-text-secondary mb-2.5">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(DIFFICULTY_LABELS) as [string, string][]).map(([key, label]) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleDifficulty(key)}
                >
                  <DifficultyBadge
                    difficulty={label}
                    size="md"
                    variant={filterDifficulties.includes(key) ? 'filled' : 'outline'}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <NeuButtonGhost size="md" fullWidth onClick={clearFilters}>
              Reset
            </NeuButtonGhost>
            <NeuButton variant="accent" accent="blue" size="md" fullWidth onClick={() => setShowFilters(false)}>
              Apply
            </NeuButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

// Small helper for the header icon button
import { NeuButtonIcon } from '@/components/ui/NeuButton';
export default WorkoutsPage;
