import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItemScale } from '@/animations/stagger';
import { MUSCLE_GROUP_LABELS, type MuscleGroup, MUSCLE_GROUP_ORDER } from '@/types/common';

interface MuscleGroupSelectorProps {
  onTap: (muscle: MuscleGroup) => void;
  selected?: MuscleGroup;
}

const MUSCLE_COLORS: Record<string, { bg: string; color: string }> = {
  shoulders: { bg: 'rgba(123, 167, 204, 0.15)', color: '#7BA7CC' },
  back: { bg: 'rgba(123, 167, 204, 0.12)', color: '#7BA7CC' },
  chest: { bg: 'rgba(232, 168, 124, 0.15)', color: '#E8A87C' },
  biceps: { bg: 'rgba(232, 168, 124, 0.12)', color: '#E8A87C' },
  triceps: { bg: 'rgba(232, 168, 124, 0.10)', color: '#E8A87C' },
  legs: { bg: 'rgba(142, 205, 168, 0.15)', color: '#8ECDA8' },
  core: { bg: 'rgba(212, 117, 107, 0.15)', color: '#D4756B' },
  glutes: { bg: 'rgba(142, 205, 168, 0.12)', color: '#8ECDA8' },
  full_body: { bg: 'rgba(123, 167, 204, 0.10)', color: '#7BA7CC' },
};

export const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  onTap,
  selected,
}) => {
  return (
    <motion.div className="mt-5" variants={staggerContainer}>
      <p className="text-sm font-bold text-neu-text mb-3 px-1">
        Muscles Workload
      </p>
      <motion.div
        className="flex gap-2 overflow-x-auto hide-scrollbar scroll-x pb-1"
        variants={staggerContainer}
      >
        {MUSCLE_GROUP_ORDER.map((muscle) => {
          const colors = MUSCLE_COLORS[muscle] || MUSCLE_COLORS.full_body;
          const isSelected = selected === muscle;

          return (
            <motion.button
              key={muscle}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all neu-pressable"
              style={
                isSelected
                  ? {
                      backgroundColor: colors.color,
                      color: '#FFFFFF',
                      boxShadow: `3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5`,
                    }
                  : {
                      backgroundColor: colors.bg,
                      color: colors.color,
                    }
              }
              variants={staggerItemScale}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTap(muscle)}
            >
              {MUSCLE_GROUP_LABELS[muscle]}
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
