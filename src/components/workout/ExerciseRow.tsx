import React from 'react';
import { motion } from 'framer-motion';
import type { Exercise } from '@/types/exercise';
import { staggerItem } from '@/animations/stagger';
import { formatTime } from '@/utils/formatters';
import { DifficultyBadge } from '@/components/ui/Badge';

interface ExerciseRowProps {
  exercise: Exercise;
  sets?: number;
  reps?: number;
  duration?: number;
  restDuration?: number;
  order: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isCurrentSet?: boolean;
  currentSet?: number;
  completedSets?: number;
}

export const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  sets,
  reps,
  duration,
  restDuration,
  order,
  isActive = false,
  isCompleted = false,
  currentSet,
  completedSets = 0,
}) => {
  const setInfo = duration
    ? `${sets || 1}set × ${formatTime(duration)}`
    : `${sets || 1}set × ${reps || 0}rep`;

  return (
    <motion.div
      className={`
        flex items-center gap-3 p-3 rounded-neu transition-all
        ${isActive
          ? 'neu-pressed'
          : 'hover:bg-neu-bg-dark/5'
        }
        ${isCompleted ? 'opacity-60' : ''}
      `}
      variants={staggerItem}
    >
      {/* Order number */}
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
          ${isActive ? 'text-white' : 'text-neu-text-secondary'}
        `}
        style={
          isActive
            ? {
                background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)',
                boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
              }
            : {
                boxShadow: '2px 2px 4px #C8BFB5, -2px -2px 4px #F5EDE5',
                backgroundColor: '#E8E0D8',
              }
        }
      >
        {order}
      </div>

      {/* Exercise info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCompleted ? 'line-through' : 'text-neu-text'}`}>
          {exercise.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-neu-text-tertiary font-medium">{setInfo}</span>
          {restDuration && restDuration > 0 && (
            <span className="text-[10px] text-neu-blue/60 font-medium">
              rest {restDuration}s
            </span>
          )}
        </div>

        {/* Set dots for active exercise */}
        {isActive && sets && sets > 0 && (
          <div className="flex gap-1 mt-1.5">
            {Array.from({ length: sets }, (_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    i < completedSets
                      ? '#8ECDA8'
                      : i === currentSet
                      ? '#7BA7CC'
                      : 'rgba(200, 191, 181, 0.35)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
