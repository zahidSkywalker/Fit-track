import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Flame } from 'lucide-react';
import type { Exercise } from '@/types/exercise';
import { staggerItem } from '@/animations/stagger';
import { DifficultyBadge, CategoryBadge } from '@/components/ui/Badge';
import { MUSCLE_GROUP_LABELS } from '@/types/common';
import { useUserStore } from '@/store/useUserStore';
import { calculateCaloriesFromMET } from '@/utils/calculations';

interface ExerciseCardProps {
  exercise: Exercise;
  onTap: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onTap }) => {
  const user = useUserStore((s) => s.user);

  const calPerMin = user
    ? Math.round((exercise.metValue * user.weight) / 60 * 10) / 10
    : exercise.caloriesPerMinute;

  return (
    <motion.div
      className="neu-raised p-3.5 neu-pressable"
      variants={staggerItem}
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
    >
      <div className="flex items-start gap-3">
        {/* Icon placeholder */}
        <div className="w-10 h-10 rounded-neu flex items-center justify-center flex-shrink-0 bg-neu-blue-tint">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#7BA7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="3"/>
            <path d="M6.5 8h11"/>
            <path d="M6.5 8v11M9.5 14.5h5M12 14.5V19"/>
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-neu-text truncate">{exercise.name}</h3>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <CategoryBadge category={exercise.category} size="sm" />
            <DifficultyBadge difficulty={exercise.difficulty} size="sm" />
          </div>

          {/* Muscles */}
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {exercise.primaryMuscles.slice(0, 3).map((m) => (
              <span
                key={m}
                className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-neu-bg-dark/10 text-neu-text-tertiary"
              >
                {MUSCLE_GROUP_LABELS[m]}
              </span>
            ))}
            {exercise.isBodyweight && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-neu-green-tint text-neu-green">
                No Equipment
              </span>
            )}
          </div>
        </div>

        {/* Right: chevron + calorie */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <ChevronRight size={16} className="text-neu-text-tertiary" />
          <div className="flex items-center gap-0.5">
            <Flame size={10} className="text-neu-red" />
            <span className="text-[10px] font-bold text-neu-red tabular-nums">{calPerMin}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
