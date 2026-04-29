import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Dumbbell, ChevronRight, Star } from 'lucide-react';
import type { WorkoutPlan } from '@/types/workout';
import { staggerItem } from '@/animations/stagger';
import { formatDurationShort } from '@/utils/formatters';
import { DifficultyBadge, CategoryBadge } from '@/components/ui/Badge';
import { MUSCLE_GROUP_LABELS } from '@/types/common';
import { calculateCaloriesFromMET } from '@/utils/calculations';
import { useUserStore } from '@/store/useUserStore';

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  onTap: () => void;
}

export const WorkoutPlanCard: React.FC<WorkoutPlanCardProps> = ({ plan, onTap }) => {
  const user = useUserStore((s) => s.user);

  const estimatedCalories = user
    ? plan.exercises.reduce((sum, we) => {
        const estSecPerSet = we.targetDuration || (we.targetReps || 10) * 3;
        const totalSec = estSecPerSet * we.targetSets;
        return sum + calculateCaloriesFromMET(we.exercise.metValue, user.weight, totalSec / 60);
      }, 0)
    : 0;

  return (
    <motion.div
      className="neu-raised p-4 neu-pressable"
      variants={staggerItem}
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
    >
      <div className="flex items-start gap-3">
        {/* Left: icon */}
        <div className="w-11 h-11 rounded-neu flex items-center justify-center flex-shrink-0 bg-neu-blue-tint">
          <Dumbbell size={18} className="text-neu-blue" />
        </div>

        {/* Middle: content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-sm font-bold text-neu-text truncate">{plan.name}</h3>
            {plan.isFeatured && (
              <Star size={12} className="text-neu-peach fill-neu-peach flex-shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-neu-text-secondary line-clamp-2 leading-snug mb-2">
            {plan.description}
          </p>

          {/* Tags row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={plan.category} size="sm" />
            <DifficultyBadge difficulty={plan.difficulty} size="sm" />
            {plan.isCustom && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-neu-peach-tint text-neu-peach">
                Custom
              </span>
            )}
          </div>
        </div>

        {/* Right: chevron */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <ChevronRight size={16} className="text-neu-text-tertiary" />
        </div>
      </div>

      {/* Bottom stats */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neu-bg-dark/10">
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-neu-text-tertiary" />
          <span className="text-[11px] text-neu-text-secondary font-medium tabular-nums">
            {formatDurationShort(plan.estimatedDuration * 60)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Dumbbell size={12} className="text-neu-text-tertiary" />
          <span className="text-[11px] text-neu-text-secondary font-medium tabular-nums">
            {plan.exercises.length} exercises
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-neu-text-secondary font-medium tabular-nums">
            ~{Math.round(estimatedCalories)} kcal
          </span>
        </div>
      </div>
    </motion.div>
  );
};
