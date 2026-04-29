import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { GoalRing } from '@/components/activity/GoalRing';
import { EnduranceRing } from '@/components/activity/EnduranceRing';
import { StatCard } from '@/components/activity/StatCard';
import { CalorieSparkline } from '@/components/activity/CalorieSparkline';
import { ActivityBreakdown } from '@/components/activity/ActivityBreakdown';
import { WeeklyChart } from '@/components/activity/WeeklyChart';
import { useActivityStore } from '@/store/useActivityStore';
import { useUserStore } from '@/store/useUserStore';
import { staggerContainer } from '@/animations/stagger';
import { SkeletonRing, SkeletonCard, SkeletonStatCard } from '@/components/ui/Skeleton';
import { formatDateMedium } from '@/utils/dateUtils';

export const ActivityPage: React.FC = () => {
  const { user } = useUserStore();
  const {
    todayStats,
    weeklyPoints,
    last7Days,
    loadTodayStats,
    loadWeeklyPoints,
    loadLast7Days,
    isLoading,
  } = useActivityStore();

  useEffect(() => {
    loadTodayStats();
    loadWeeklyPoints();
    loadLast7Days();
  }, [loadTodayStats, loadWeeklyPoints, loadLast7Days]);

  const today = new Date();

  if (isLoading) {
    return (
      <div className="page-container-no-nav pt-2">
        <PageHeader
          title="Today's Activity"
          subtitle={formatDateMedium(today)}
        />
        <div className="flex flex-col gap-4 mt-3">
          <div className="grid grid-cols-2 gap-4">
            <SkeletonRing />
            <SkeletonRing />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <SkeletonStatCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const stats = todayStats;

  return (
    <motion.div
      className="page-container-no-nav pt-2"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <PageHeader
        title="Today's Activity"
        subtitle={formatDateMedium(today)}
      />

      {/* Rings row */}
      <motion.div className="grid grid-cols-2 gap-4 mt-4" variants={staggerContainer}>
        <GoalRing
          percent={stats?.goalCompletionPercent || 0}
          label="Level Activity"
        />
        <EnduranceRing
          percent={stats?.enduranceSuccessPercent || 0}
          label="Success Endurance"
        />
      </motion.div>

      {/* Stats row */}
      <motion.div className="grid grid-cols-2 gap-3 mt-5" variants={staggerContainer}>
        <StatCard
          label="Calories"
          value={stats?.totalCalories || 0}
          unit="kcal"
          color="#D4756B"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4756B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 12c-2-2.67-4-4.33-4-6a4 4 0 0 1 8 0c0 1.67-2 3.33-4 6z"/>
              <path d="M12 12c2 2.67 4 4.33 4 6a4 4 0 0 1-8 0c0-1.67 2-3.33 4-6z"/>
            </svg>
          }
        />
        <StatCard
          label="Steps"
          value={stats?.totalSteps || 0}
          unit="steps"
          color="#7BA7CC"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7BA7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0z"/>
              <path d="M20 20v-2.38c0-2.12-1.03-3.12-1-5.62.03-2.72 1.49-6 4.5-6 1.87 0 2.5 1.8 2.5 3.5 0 3.11-2 5.66-2 8.68V20a2 2 0 1 1-4 0z"/>
            </svg>
          }
        />
        <StatCard
          label="Heart Rate"
          value={stats?.avgHeartRate || 0}
          unit="bpm"
          color="#E8A87C"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A87C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19.5 12.572l-7.5 7.428l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"/>
            </svg>
          }
        />
        <StatCard
          label="Duration"
          value={Math.round((stats?.totalWorkoutDuration || 0) / 60)}
          unit="min"
          color="#8ECDA8"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8ECDA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          }
        />
      </motion.div>

      {/* Calorie sparkline */}
      <motion.div className="mt-5" variants={staggerContainer}>
        <CalorieSparkline data={last7Days.map((d) => d.totalCalories)} />
      </motion.div>

      {/* Activity breakdown */}
      <motion.div className="mt-5" variants={staggerContainer}>
        <ActivityBreakdown
          cardio={stats?.cardioMinutes || 0}
          strength={stats?.strengthMinutes || 0}
          flexibility={stats?.flexibilityMinutes || 0}
          hiit={stats?.hiitMinutes || 0}
        />
      </motion.div>

      {/* Weekly chart */}
      <motion.div className="mt-5 mb-6" variants={staggerContainer}>
        <WeeklyChart data={last7Days} />
      </motion.div>
    </motion.div>
  );
};

export default ActivityPage;
