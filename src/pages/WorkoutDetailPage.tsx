import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Dumbbell, Flame, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { NeuButton } from '@/components/ui/NeuButton';
import { NeuCard } from '@/components/ui/NeuCard';
import { ExerciseRow } from '@/components/workout/ExerciseRow';
import { DifficultyBadge, CategoryBadge, IntensityBadge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useUserStore } from '@/store/useUserStore';
import { staggerContainer, staggerItem } from '@/animations/stagger';
import { formatDurationShort, formatNumber } from '@/utils/formatters';
import { calculateCaloriesFromMET } from '@/utils/calculations';
import { MUSCLE_GROUP_LABELS } from '@/types/common';
import { useToast } from '@/components/ui/Toast';
import type { WorkoutPlan } from '@/types/workout';

export const WorkoutDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlanById, startWorkoutFromPlan, removePlan } = useWorkoutStore();
  const { user } = useUserStore();
  const toast = useToast();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const p = await getPlanById(id);
      setPlan(p || null);
      setLoading(false);
    }
    load();
  }, [id, getPlanById]);

  const handleStart = () => {
    if (!plan) return;
    startWorkoutFromPlan(plan);
    navigate(`/workouts/${plan.id}/active`);
  };

  const handleDelete = async () => {
    if (!plan) return;
    if (!plan.isCustom) {
      toast.warning('Built-in workouts cannot be deleted');
      return;
    }
    await removePlan(plan.id);
    toast.success('Workout deleted');
    navigate('/workouts', { replace: true });
  };

  // Estimated calories for entire workout
  const estimatedCalories = plan && user
    ? plan.exercises.reduce((sum, we) => {
        const met = we.exercise.metValue;
        // Estimate time: reps * 3sec or duration
        const estSecPerSet = we.targetDuration || (we.targetReps || 10) * 3;
        const totalSec = estSecPerSet * we.targetSets;
        return sum + calculateCaloriesFromMET(met, user.weight, totalSec / 60);
      }, 0)
    : 0;

  if (loading) {
    return (
      <div className="page-container pt-2">
        <PageHeader title="Workout" showBack />
        <div className="flex flex-col gap-3 mt-3">
          <SkeletonCard />
          <SkeletonCard />
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="page-container pt-2">
        <PageHeader title="Not Found" showBack />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-neu-text-secondary">Workout not found</p>
          <NeuButtonGhost size="sm" onClick={() => navigate('/workouts')} className="mt-4">
            Back to Workouts
          </NeuButtonGhost>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-2 pb-6">
      <PageHeader
        title={plan.name}
        showBack
        rightAction={
          plan.isCustom ? (
            <motion.button
              className="neu-raised-circle w-10 h-10 flex items-center justify-center neu-pressable"
              whileTap={{ scale: 0.92 }}
              onClick={handleDelete}
            >
              <Trash2 size={16} className="text-neu-red" />
            </motion.button>
          ) : undefined
        }
      />

      <motion.div
        className="flex flex-col gap-4 mt-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Description */}
        <motion.p className="text-xs text-neu-text-secondary leading-relaxed" variants={staggerItem}>
          {plan.description}
        </motion.p>

        {/* Badges */}
        <motion.div className="flex flex-wrap gap-2" variants={staggerItem}>
          <CategoryBadge category={plan.category} size="md" />
          <DifficultyBadge difficulty={plan.difficulty} size="md" />
          <IntensityBadge intensity={plan.intensity} size="md" />
        </motion.div>

        {/* Stats row */}
        <motion.div className="grid grid-cols-3 gap-3" variants={staggerItem}>
          <div className="neu-raised-sm p-3 flex flex-col items-center gap-1">
            <Clock size={14} className="text-neu-blue" />
            <span className="text-sm font-extrabold text-neu-text tabular-nums">
              {formatDurationShort(plan.estimatedDuration * 60)}
            </span>
            <span className="text-[10px] text-neu-text-tertiary">Duration</span>
          </div>
          <div className="neu-raised-sm p-3 flex flex-col items-center gap-1">
            <Dumbbell size={14} className="text-neu-peach" />
            <span className="text-sm font-extrabold text-neu-text tabular-nums">
              {plan.exercises.length}
            </span>
            <span className="text-[10px] text-neu-text-tertiary">Exercises</span>
          </div>
          <div className="neu-raised-sm p-3 flex flex-col items-center gap-1">
            <Flame size={14} className="text-neu-red" />
            <span className="text-sm font-extrabold text-neu-text tabular-nums">
              {formatNumber(estimatedCalories)}
            </span>
            <span className="text-[10px] text-neu-text-tertiary">Est. kcal</span>
          </div>
        </motion.div>

        {/* Muscle groups */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold text-neu-text-secondary mb-2">Muscle Groups</p>
          <div className="flex flex-wrap gap-1.5">
            {plan.primaryMuscles.map((m) => (
              <span
                key={m}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-neu-bg-dark/15 text-neu-text-secondary"
              >
                {MUSCLE_GROUP_LABELS[m]}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Exercise list */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold text-neu-text-secondary mb-2">Exercises</p>
          <div className="flex flex-col gap-2">
            {plan.exercises.map((we, index) => (
              <ExerciseRow
                key={we.id}
                exercise={we.exercise}
                sets={we.targetSets}
                reps={we.targetReps}
                duration={we.targetDuration}
                restDuration={we.restDuration}
                order={index + 1}
              />
            ))}
          </div>
        </motion.div>

        {/* Start button */}
        <motion.div className="mt-4" variants={staggerItem}>
          <NeuButton
            variant="accent"
            accent="blue"
            size="lg"
            fullWidth
            onClick={handleStart}
            icon={<Play size={18} />}
          >
            Start Workout
          </NeuButton>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WorkoutDetailPage;
