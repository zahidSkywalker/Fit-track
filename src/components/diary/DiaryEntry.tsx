import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Dumbbell, Trophy, ChevronRight } from 'lucide-react';
import type { WorkoutSession } from '@/types/workout';
import { staggerItem } from '@/animations/stagger';
import { formatDuration, formatNumber, formatDateShort, formatTimeOfDay } from '@/utils/formatters';

interface DiaryEntryProps {
  session: WorkoutSession;
  onTap: () => void;
}

export const DiaryEntry: React.FC<DiaryEntryProps> = ({ session, onTap }) => {
  const completedExercises = session.exercises.filter(
    (e) => !e.wasSkipped && e.sets.some((s) => s.completed)
  ).length;
  const totalExercises = session.exercises.length;

  return (
    <motion.div
      className="neu-raised p-4 neu-pressable"
      variants={staggerItem}
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
    >
      {/* Top row: name + date */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-neu-text truncate">
            {session.workoutPlanName}
          </h3>
          <p className="text-[10px] text-neu-text-tertiary font-medium mt-0.5">
            {formatDateShort(session.date)} • {formatTimeOfDay(session.startedAt)}
          </p>
        </div>
        <ChevronRight size={16} className="text-neu-text-tertiary flex-shrink-0 mt-0.5" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neu-bg-dark/10">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-neu-blue" />
          <span className="text-[11px] text-neu-text-secondary font-medium tabular-nums">
            {formatDuration(session.totalDuration)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame size={12} className="text-neu-red" />
          <span className="text-[11px] text-neu-text-secondary font-medium tabular-nums">
            {formatNumber(session.totalCalories)} kcal
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Dumbbell size={12} className="text-neu-peach" />
          <span className="text-[11px] text-neu-text-secondary font-medium tabular-nums">
            {completedExercises}/{totalExercises}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy size={12} className="text-neu-green" />
          <span className="text-[11px] text-neu-text-secondary font-medium tabular-nums">
            {session.pointsEarned} pts
          </span>
        </div>
      </div>

      {/* Completion bar */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-neu-text-tertiary font-medium">Completion</span>
          <span className="text-[10px] font-bold text-neu-blue tabular-nums">
            {session.completionPercentage}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-neu-bg-dark/15 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#7BA7CC' }}
            initial={{ width: 0 }}
            animate={{ width: `${session.completionPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
};
