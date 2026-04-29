import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart } from 'lucide-react';
import type { Exercise, ExerciseRecord } from '@/types/exercise';
import type { WorkoutExercise } from '@/types/workout';
import { staggerItem } from '@/animations/stagger';
import { formatTime, formatNumber } from '@/utils/formatters';

interface ActiveExerciseProps {
  workoutExercise: WorkoutExercise;
  exerciseRecord: ExerciseRecord;
  elapsedSeconds: number;
  isResting: boolean;
  restRemaining: number;
  totalCalories: number;
  heartRate: number;
}

export const ActiveExercise: React.FC<ActiveExerciseProps> = ({
  workoutExercise,
  exerciseRecord,
  elapsedSeconds,
  isResting,
  restRemaining,
  totalCalories,
  heartRate,
}) => {
  const { exercise, targetSets, targetReps, targetDuration } = workoutExercise;
  const completedSets = exerciseRecord.sets.filter((s) => s.completed).length;
  const currentSetIndex = Math.min(completedSets, targetSets - 1);

  const isTimed = !!targetDuration;
  const displayTime = isResting ? formatTime(restRemaining) : formatTime(elapsedSeconds);

  return (
    <motion.div
      className="flex flex-col items-center"
      variants={staggerItem}
      key={workoutExercise.id}
    >
      {/* Exercise name */}
      <motion.h2
        className="text-lg font-extrabold text-neu-text text-center mb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {exercise.name}
      </motion.h2>

      {/* Set info */}
      <motion.p
        className="text-xs text-neu-text-secondary font-medium mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {isTimed
          ? `${completedSets + 1} of ${targetSets} sets • ${formatTime(targetDuration)} per set`
          : `${completedSets + 1} of ${targetSets} sets • ${targetReps || 0} reps`
        }
      </motion.p>

      {/* Timer display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isResting ? 'rest' : 'work'}
          className="neu-pressed-lg w-48 h-48 rounded-full flex flex-col items-center justify-center relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {isResting && (
            <span className="absolute top-4 text-[10px] font-bold text-neu-green uppercase tracking-wider">
              Rest
            </span>
          )}

          <span
            className="text-4xl font-extrabold tabular-nums"
            style={{ color: isResting ? '#8ECDA8' : '#7BA7CC' }}
          >
            {displayTime}
          </span>

          {!isResting && (
            <span className="absolute bottom-4 text-[10px] font-semibold text-neu-text-tertiary">
              {isTimed ? 'remaining' : 'elapsed'}
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Stats row */}
      <div className="flex items-center gap-6 mt-6">
        <div className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 rounded-full bg-neu-red-tint flex items-center justify-center">
            <Flame size={16} className="text-neu-red" />
          </div>
          <span className="text-sm font-extrabold text-neu-red tabular-nums">
            {totalCalories}
          </span>
          <span className="text-[9px] text-neu-text-tertiary font-medium">kcal</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 rounded-full bg-neu-peach-tint flex items-center justify-center">
            <Heart size={16} className="text-neu-peach" />
          </div>
          <span className="text-sm font-extrabold text-neu-peach tabular-nums">
            {heartRate}
          </span>
          <span className="text-[9px] text-neu-text-tertiary font-medium">bpm</span>
        </div>
      </div>

      {/* Set dots */}
      <div className="flex gap-2 mt-5">
        {Array.from({ length: targetSets }, (_, i) => {
          const isDone = i < completedSets;
          const isCurrent = i === currentSetIndex && !isDone;
          return (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: isDone
                  ? '#8ECDA8'
                  : isCurrent
                  ? '#7BA7CC'
                  : 'rgba(200, 191, 181, 0.4)',
              }}
              animate={isCurrent ? { scale: [1, 1.3, 1] } : {}}
              transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
            />
          );
        })}
      </div>
    </motion.div>
  );
};
