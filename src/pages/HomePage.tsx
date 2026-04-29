import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { useActivityStore } from '@/store/useActivityStore';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { GreetingCard } from '@/components/home/GreetingCard';
import { QuickStats } from '@/components/home/QuickStats';
import { WeeklyPoints } from '@/components/home/WeeklyPoints';
import { ChallengeBanner } from '@/components/home/ChallengeBanner';
import { ExerciseTypeGrid } from '@/components/home/ExerciseTypeGrid';
import { MuscleGroupSelector } from '@/components/home/MuscleGroupSelector';
import { MiniCalendar } from '@/components/home/MiniCalendar';
import { staggerContainer } from '@/animations/stagger';
import { SkeletonCard, SkeletonStatCard, SkeletonRing } from '@/components/ui/Skeleton';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: userLoading } = useUserStore();
  const { todayStats, weeklyPoints, loadTodayStats, loadWeeklyPoints, isLoading: actLoading } = useActivityStore();
  const { featuredPlans, loadFeaturedPlans, plansLoading } = useWorkoutStore();

  useEffect(() => {
    loadTodayStats();
    loadWeeklyPoints();
    loadFeaturedPlans();
  }, [loadTodayStats, loadWeeklyPoints, loadFeaturedPlans]);

  const isLoading = userLoading || actLoading || plansLoading;

  if (isLoading) {
    return (
      <div className="page-container pt-4">
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <div className="grid grid-cols-3 gap-3">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <SkeletonRing />
          <SkeletonCard />
          <div className="grid grid-cols-3 gap-2">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="page-container pt-4 pb-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <GreetingCard
        name={user?.name || 'User'}
        date={new Date()}
      />

      <QuickStats
        totalDuration={todayStats?.totalWorkoutDuration || 0}
        tasksCompleted={todayStats?.workoutsCompleted || 0}
        tasksTotal={todayStats?.workoutsPlanned || 1}
      />

      <WeeklyPoints
        points={weeklyPoints?.totalPoints || 0}
        target={weeklyPoints?.targetPoints || 2400}
        percent={weeklyPoints?.completionPercent || 0}
        dailyBreakdown={weeklyPoints?.dailyBreakdown || null}
      />

      {featuredPlans.length > 0 && (
        <ChallengeBanner
          plans={featuredPlans}
          onTap={(plan) => navigate(`/workouts/${plan.id}`)}
        />
      )}

      <ExerciseTypeGrid onTap={(category) => navigate('/workouts')} />

      <MuscleGroupSelector onTap={(muscle) => navigate('/exercises')} />

      <MiniCalendar />
    </motion.div>
  );
};

export default HomePage;
