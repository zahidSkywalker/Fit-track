import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Clock, Flame, ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuButton } from '@/components/ui/NeuButton';
import { DifficultyBadge, CategoryBadge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EXERCISE_MAP } from '@/constants/exercises';
import { MUSCLE_GROUP_LABELS } from '@/types/common';
import { staggerContainer, staggerItem, staggerItemScale } from '@/animations/stagger';
import { formatNumber, capitalize } from '@/utils/formatters';
import { useUserStore } from '@/store/useUserStore';
import type { Exercise } from '@/types/exercise';

export const ExerciseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const ex = EXERCISE_MAP[id];
      setExercise(ex || null);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="page-container pt-2">
        <PageHeader title="Exercise" showBack />
        <div className="flex flex-col gap-3 mt-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="page-container pt-2">
        <PageHeader title="Not Found" showBack />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-neu-text-secondary">Exercise not found</p>
          <NeuButtonGhost size="sm" onClick={() => navigate('/exercises')} className="mt-4">Back</NeuButtonGhost>
        </div>
      </div>
    );
  }

  const calPerMin = user
    ? Math.round((exercise.metValue * user.weight) / 60 * 10) / 10
    : exercise.caloriesPerMinute;

  return (
    <div className="page-container pt-2 pb-6">
      <PageHeader title={exercise.name} showBack />

      <motion.div className="flex flex-col gap-4 mt-3" variants={staggerContainer} initial="hidden" animate="visible">
        {/* Exercise illustration placeholder */}
        <motion.div className="neu-pressed-lg h-40 rounded-neu-lg flex items-center justify-center" variants={staggerItem}>
          <div className="w-20 h-20 neu-raised-circle flex items-center justify-center">
            <Dumbbell size={32} className="text-neu-text-tertiary" />
          </div>
        </motion.div>

        {/* Description */}
        <motion.p className="text-xs text-neu-text-secondary leading-relaxed" variants={staggerItem}>
          {exercise.description}
        </motion.p>

        {/* Badges */}
        <motion.div className="flex flex-wrap gap-2" variants={staggerItem}>
          <CategoryBadge category={exercise.category} size="md" />
          <DifficultyBadge difficulty={exercise.difficulty} size="md" />
          {exercise.isBodyweight && (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-neu-green-tint text-neu-green">Bodyweight</span>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div className="grid grid-cols-3 gap-3" variants={staggerItem}>
          <div className="neu-raised-sm p-3 flex flex-col items-center gap-1">
            <Flame size={14} className="text-neu-red" />
            <span className="text-sm font-extrabold text-neu-text tabular-nums">{calPerMin}</span>
            <span className="text-[10px] text-neu-text-tertiary">kcal/min</span>
          </div>
          <div className="neu-raised-sm p-3 flex flex-col items-center gap-1">
            <Clock size={14} className="text-neu-blue" />
            <span className="text-sm font-extrabold text-neu-text tabular-nums">{exercise.metValue}</span>
            <span className="text-[10px] text-neu-text-tertiary">MET value</span>
          </div>
          <div className="neu-raised-sm p-3 flex flex-col items-center gap-1">
            <Dumbbell size={14} className="text-neu-peach" />
            <span className="text-sm font-extrabold text-neu-text tabular-nums">{exercise.equipment.length}</span>
            <span className="text-[10px] text-neu-text-tertiary">equipment</span>
          </div>
        </motion.div>

        {/* Muscles */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold text-neu-text-secondary mb-2">Target Muscles</p>
          <div className="flex flex-wrap gap-1.5">
            {exercise.primaryMuscles.map((m) => (
              <span key={m} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neu-peach-tint text-neu-peach">
                {MUSCLE_GROUP_LABELS[m]}
              </span>
            ))}
          </div>
          {exercise.secondaryMuscles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {exercise.secondaryMuscles.map((m) => (
                <span key={m} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neu-bg-dark/10 text-neu-text-tertiary">
                  {MUSCLE_GROUP_LABELS[m]}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Equipment */}
        {exercise.equipment.length > 0 && (
          <motion.div variants={staggerItem}>
            <p className="text-xs font-bold text-neu-text-secondary mb-2">Equipment</p>
            <div className="flex flex-wrap gap-1.5">
              {exercise.equipment.map((eq) => (
                <span key={eq} className="text-[11px] font-medium px-2.5 py-1 rounded-full neu-flat text-neu-text-secondary">
                  {eq}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div className="neu-raised p-4" variants={staggerItem}>
          <p className="text-xs font-bold text-neu-text mb-3">How to Perform</p>
          <div className="flex flex-col gap-2.5">
            {exercise.instructions.map((step, i) => (
              <motion.div key={i} className="flex gap-3" variants={staggerItemScale}>
                <div className="w-6 h-6 rounded-full bg-neu-blue-tint flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-neu-blue">{i + 1}</span>
                </div>
                <p className="text-xs text-neu-text-secondary leading-relaxed">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        {exercise.tips.length > 0 && (
          <motion.div className="neu-pressed-sm p-4 rounded-neu" variants={staggerItem}>
            <p className="text-xs font-bold text-neu-blue mb-2">💡 Tips</p>
            <div className="flex flex-col gap-1.5">
              {exercise.tips.map((tip, i) => (
                <p key={i} className="text-[11px] text-neu-text-secondary leading-relaxed">• {tip}</p>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ExerciseDetailPage;
