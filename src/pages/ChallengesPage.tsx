import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { AchievementGrid } from '@/components/challenges/AchievementGrid';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useChallengeStore } from '@/store/useChallengeStore';
import { staggerContainer } from '@/animations/stagger';
import { CHALLENGES, ACHIEVEMENTS } from '@/constants/challenges';

export const ChallengesPage: React.FC = () => {
  const {
    allProgress,
    activeProgress,
    unlockedAchievements,
    unlockedCount,
    totalAchievements,
    loadProgress,
    loadAchievements,
    loading,
  } = useChallengeStore();
  const [activeTab, setActiveTab] = useState('challenges');

  useEffect(() => {
    loadProgress();
    loadAchievements();
  }, [loadProgress, loadAchievements]);

  const tabs = [
    { id: 'challenges', label: 'Challenges', count: CHALLENGES.length },
    { id: 'active', label: 'Active', count: activeProgress.length },
    { id: 'achievements', label: 'Achievements', count: `${unlockedCount}/${totalAchievements}` },
  ];

  const displayChallenges = activeTab === 'active'
    ? CHALLENGES.filter((c) => activeProgress.some((p) => p.challengeId === c.id))
    : activeTab === 'achievements'
    ? []
    : CHALLENGES;

  return (
    <div className="page-container pt-2 pb-6">
      <PageHeader title="Challenges" subtitle="Push your limits" />

      <div className="mt-4">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pill" />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 mt-4">
          {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : activeTab === 'achievements' ? (
        <motion.div initial="hidden" animate="visible">
          <AchievementGrid
            achievements={ACHIEVEMENTS}
            unlockedIds={new Set(unlockedAchievements.map((a) => a.achievementId))}
          />
        </motion.div>
      ) : displayChallenges.length === 0 ? (
        <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm font-bold text-neu-text-secondary">
            {activeTab === 'active' ? 'No active challenges' : 'No challenges available'}
          </p>
        </motion.div>
      ) : (
        <motion.div className="flex flex-col gap-3 mt-4" variants={staggerContainer} initial="hidden" animate="visible">
          {displayChallenges.map((challenge) => {
            const progress = allProgress.find((p) => p.challengeId === challenge.id);
            return (
              <ChallengeCard key={challenge.id} challenge={challenge} progress={progress} />
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default ChallengesPage;
