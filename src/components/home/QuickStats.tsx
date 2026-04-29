import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';
import { formatDurationShort } from '@/utils/formatters';
import { staggerItem } from '@/animations/stagger';

interface QuickStatsProps {
  totalDuration: number; // seconds
  tasksCompleted: number;
  tasksTotal: number;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalDuration,
  tasksCompleted,
  tasksTotal,
}) => {
  return (
    <motion.div
      className="grid grid-cols-3 gap-3 mt-5"
      variants={staggerItem}
    >
      {/* Duration */}
      <div className="neu-raised-sm p-3 flex flex-col items-center gap-1.5">
        <div className="w-9 h-9 rounded-full bg-neu-blue-tint flex items-center justify-center">
          <Clock size={16} className="text-neu-blue" />
        </div>
        <span className="text-sm font-extrabold text-neu-text tabular-nums">
          {formatDurationShort(totalDuration)}
        </span>
        <span className="text-[10px] text-neu-text-tertiary font-medium">Duration</span>
      </div>

      {/* Tasks */}
      <div className="neu-raised-sm p-3 flex flex-col items-center gap-1.5">
        <div className="w-9 h-9 rounded-full bg-neu-green-tint flex items-center justify-center">
          <CheckCircle2 size={16} className="text-neu-green" />
        </div>
        <span className="text-sm font-extrabold text-neu-text tabular-nums">
          {tasksCompleted}<span className="text-neu-text-tertiary font-semibold">/{tasksTotal}</span>
        </span>
        <span className="text-[10px] text-neu-text-tertiary font-medium">Tasks</span>
      </div>

      {/* Placeholder for weekly rank (static display) */}
      <div className="neu-raised-sm p-3 flex flex-col items-center gap-1.5">
        <div className="w-9 h-9 rounded-full bg-neu-peach-tint flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8A87C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <span className="text-sm font-extrabold text-neu-text tabular-nums">
          #{Math.max(1, 50 - tasksCompleted * 5)}
        </span>
        <span className="text-[10px] text-neu-text-tertiary font-medium">Rank</span>
      </div>
    </motion.div>
  );
};
