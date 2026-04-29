import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Edit3, Calendar, Flame, Dumbbell, Trophy, Target, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuButton } from '@/components/ui/NeuButton';
import { ProgressRingWithLabel } from '@/components/ui/ProgressRing';
import { StatsOverview } from '@/components/profile/StatsOverview';
import { SkeletonCard, SkeletonRing } from '@/components/ui/Skeleton';
import { useUserStore } from '@/store/useUserStore';
import { staggerContainer, staggerItem } from '@/animations/stagger';
import { formatNumber } from '@/utils/formatters';
import { calculateBMI, getBMICategory } from '@/utils/calculations';
import { MUSCLE_GROUP_LABELS } from '@/types/common';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user, latestBodyStats, isLoading } = useUserStore();

  useEffect(() => {
    useUserStore.getState().loadBodyStatsHistory();
  }, []);

  if (isLoading || !user) {
    return (
      <div className="page-container pt-2">
        <PageHeader title="Profile" />
        <div className="flex flex-col gap-4 mt-3">
          <SkeletonRing />
          <SkeletonCard />
          <div className="grid grid-cols-2 gap-3"><SkeletonCard /><SkeletonCard /></div>
        </div>
      </div>
    );
  }

  const bmi = latestBodyStats ? calculateBMI(latestBodyStats.weight, user.height) : 0;
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="page-container pt-2 pb-6">
      <PageHeader
        title="Profile"
        rightAction={
          <motion.button
            className="neu-raised-circle w-10 h-10 flex items-center justify-center neu-pressable"
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/settings')}
          >
            <Settings size={18} className="text-neu-text-secondary" />
          </motion.button>
        }
      />

      <motion.div className="flex flex-col gap-4 mt-3" variants={staggerContainer} initial="hidden" animate="visible">
        {/* Avatar + name */}
        <motion.div className="neu-raised p-5 flex items-center gap-4" variants={staggerItem}>
          <div className="w-16 h-16 rounded-full bg-neu-blue flex items-center justify-center text-white text-xl font-extrabold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-neu-text truncate">{user.name}</h2>
            <p className="text-xs text-neu-text-secondary">
              {user.age} yrs • {user.height}cm • {user.weight}kg
            </p>
            <div className="flex gap-1.5 mt-1.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neu-blue-tint text-neu-blue capitalize">
                {user.fitnessLevel}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neu-peach-tint text-neu-peach capitalize">
                {user.goal.replace('_', ' ')}
              </span>
            </div>
          </div>
          <motion.button
            className="neu-raised-circle w-10 h-10 flex items-center justify-center neu-pressable"
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/settings')}
          >
            <Edit3 size={16} className="text-neu-text-secondary" />
          </motion.button>
        </motion.div>

        {/* Stats rings row */}
        <motion.div className="grid grid-cols-3 gap-3" variants={staggerItem}>
          <div className="neu-raised-sm p-3 flex flex-col items-center">
            <ProgressRingWithLabel
              percent={profile?.currentStreak ? Math.min(100, profile.currentStreak * 10) : 0}
              size={64}
              strokeWidth={6}
              color="#E8A87C"
              valueDisplay={String(profile?.currentStreak || 0)}
              label="Streak"
              valueSize="sm"
              animationDuration={1}
            />
          </div>
          <div className="neu-raised-sm p-3 flex flex-col items-center">
            <ProgressRingWithLabel
              percent={profile?.longestStreak ? Math.min(100, profile.longestStreak * 7) : 0}
              size={64}
              strokeWidth={6}
              color="#7BA7CC"
              valueDisplay={String(profile?.longestStreak || 0)}
              label="Best"
              valueSize="sm"
              animationDuration={1.1}
            />
          </div>
          <div className="neu-raised-sm p-3 flex flex-col items-center">
            <ProgressRingWithLabel
              percent={profile?.joinedDaysAgo ? Math.min(100, (profile.joinedDaysAgo / 365) * 100) : 0}
              size={64}
              strokeWidth={6}
              color="#8ECDA8"
              valueDisplay={String(profile?.joinedDaysAgo || 0)}
              label="Days"
              valueSize="sm"
              animationDuration={1.2}
            />
          </div>
        </motion.div>

        {/* Key stats */}
        <motion.div className="neu-raised p-4" variants={staggerItem}>
          <StatsOverview profile={profile} />
        </motion.div>

        {/* BMI */}
        {bmi > 0 && (
          <motion.div className="neu-raised p-4" variants={staggerItem}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neu-text-secondary font-medium">Body Mass Index</p>
                <p className="text-xl font-extrabold text-neu-text tabular-nums mt-0.5">{bmi}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${bmiCategory.color}20`, color: bmiCategory.color }}>
                {bmiCategory.label}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfilePage;
