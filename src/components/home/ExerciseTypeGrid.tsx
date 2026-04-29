import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItemScale } from '@/animations/stagger';
import {
  Dumbbell,
  Bike,
  Wind,
  StretchHorizontal,
  Zap,
  Footprints,
} from 'lucide-react';

interface ExerciseTypeGridProps {
  onTap: (category: string) => void;
}

const EXERCISE_TYPES = [
  { id: 'strength', label: 'Strength', icon: <Dumbbell size={20} />, color: '#E8A87C', bg: 'rgba(232, 168, 124, 0.15)' },
  { id: 'cardio', label: 'Cardio', icon: <Bike size={20} />, color: '#7BA7CC', bg: 'rgba(123, 167, 204, 0.15)' },
  { id: 'hiit', label: 'HIIT', icon: <Zap size={20} />, color: '#D4756B', bg: 'rgba(212, 117, 107, 0.15)' },
  { id: 'calisthenics', label: 'Calisthenics', icon: <Footprints size={20} />, color: '#8ECDA8', bg: 'rgba(142, 205, 168, 0.15)' },
  { id: 'flexibility', label: 'Flexibility', icon: <StretchHorizontal size={20} />, color: '#8ECDA8', bg: 'rgba(142, 205, 168, 0.12)' },
  { id: 'running', label: 'Running', icon: <Wind size={20} />, color: '#7BA7CC', bg: 'rgba(123, 167, 204, 0.12)' },
];

export const ExerciseTypeGrid: React.FC<ExerciseTypeGridProps> = ({ onTap }) => {
  return (
    <motion.div className="mt-5" variants={staggerContainer}>
      <p className="text-sm font-bold text-neu-text mb-3 px-1">
        Select Exercise Type
      </p>
      <motion.div
        className="grid grid-cols-3 gap-3"
        variants={staggerContainer}
      >
        {EXERCISE_TYPES.map((type) => (
          <motion.button
            key={type.id}
            className="neu-pressed-sm p-3 flex flex-col items-center gap-2 neu-pressable"
            variants={staggerItemScale}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTap(type.id)}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: type.bg, color: type.color }}
            >
              {type.icon}
            </div>
            <span className="text-[10px] font-semibold text-neu-text-secondary">
              {type.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};
