import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, Trophy, Target, Calendar } from 'lucide-react';
import { staggerItemScale } from '@/animations/stagger';
import { formatNumber, formatDuration } from '@/utils/formatters';
import type { UserProfile } from '@/types/user';

interface StatsOverviewProps {
  profile: UserProfile | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ profile }) => {
  const p = profile;
  const totalMinutes = p ? Math.round(p.totalPoints / 3) : 0;

  const stats = [
    { icon: <Dumbbell size={16} className="text-neu-peach" />, label: 'Workouts', value: formatNumber(p?.totalWorkouts || 0), color: '#E8A87C' },
    { icon: <Flame size={16} className="text-neu-red" />, label: 'Calories', value: formatNumber(p?.totalPoints ? p.totalPoints * 5 : 0), color: '#D4756B' },
    { icon: <Trophy size={16} className="text-neu-blue" />, label: 'Points', value: formatNumber(p?.totalPoints || 0), color: '#7BA7CC' },
    { icon: <Target size={16} className="text-neu-green" />, label: 'Best Streak', value: `${p?.longestStreak || 0} days`, color: '#8ECDA8' },
    { icon: <Calendar size={16} className="text-neu-peach" />, label: 'This Week', value: `${p?.currentStreak || 0} day streak`, color: '#E8A87C' },
    { icon: <Flame size={16} className="text-neu-blue" />, label: 'Total Time', value: p ? formatDuration(totalMinutes * 60) : '0m', color: '#7BA7CC' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          className="flex flex-col items-center gap-1 py-2 rounded-neu-sm"
          variants={staggerItemScale}
        >
          {stat.icon}
          <span className="text-xs font-extrabold tabular-nums" style={{ color: stat.color }}>
            {stat.value}
          </span>
          <span className="text-[9px] text-neu-text-tertiary font-medium">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
};
