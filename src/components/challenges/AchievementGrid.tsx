import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { staggerContainer, staggerItemScale } from '@/animations/stagger';
import { RARITY_CONFIG, type Rarity } from '@/constants/achievements';
import type { Achievement, AchievementCondition } from '@/types/challenge';

interface AchievementGridProps {
  achievements: Achievement[];
  unlockedIds: Set<string>;
}

const CONDITION_LABELS: Record<string, string> = {
  total_workouts: 'Workouts',
  total_points: 'Points',
  streak: 'Streak',
  longest_streak: 'Best Streak',
  total_calories: 'Calories Burned',
  total_minutes: 'Minutes',
  total_steps: 'Steps',
  challenges_completed: 'Challenges',
  custom_workouts_created: 'Custom Plans',
  body_weight_logged: 'Weight Logs',
  muscle_groups_trained: 'Muscle Groups',
  workout_on_each_weekday: 'Full Week',
};

const FORMATTERS: Record<string, (v: number) => string> = {
  total_workouts: (v) => String(v),
  total_points: (v) => `${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}K`,
  streak: (v) => `${v} days`,
  longest_streak: (v) => `${v} days`,
  total_calories: (v) => `${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}K`,
  total_minutes: (v) => `${Math.round(v / 60)}h`,
  total_steps: (v) => `${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}K`,
  challenges_completed: (v) => String(v),
  custom_workouts_created: (v) => String(v),
  body_weight_logged: (v) => `${v}x`,
  muscle_groups_trained: (v) => `${v}/9`,
  workout_on_each_weekday: (v) => `${v}/7`,
};

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  unlockedIds,
}) => {
  return (
    <motion.div
      className="flex flex-col gap-3"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Group by rarity */}
      {(['common', 'rare', 'epic', 'legendary'] as Rarity[]).map((rarity) => {
        const items = achievements.filter((a) => {
          const rarityMap: Record<string, string> = { common: 'common', rare: 'rare', epic: 'epic', legendary: 'legendary' };
          return rarityMap[a.rarity] === rarity;
        });

        if (items.length === 0) return null;

        const config = RARITY_CONFIG[rarity];

        return (
          <div key={rarity}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider"
                style={{ color: config.color }}
              >
                {config.label}
              </span>
              <span className="text-[10px] text-neu-text-tertiary">
                {items.filter((a) => unlockedIds.has(a.id)).length}/{items.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {items.map((achievement) => {
                const isUnlocked = unlockedIds.has(achievement.id);
                const cond = achievement.condition;
                const currentLabel = FORMATTERS[cond.type]
                  ? FORMATTERS[cond.type](cond.value)
                  : String(cond.value);
                const conditionLabel = CONDITION_LABELS[cond.type] || cond.type;

                return (
                  <motion.div
                    key={achievement.id}
                    className="neu-pressed-sm p-3 flex flex-col items-center gap-2 relative overflow-hidden"
                    variants={staggerItemScale}
                    style={{
                      opacity: isUnlocked ? 1 : 0.45,
                    }}
                    whileTap={isUnlocked ? { scale: 0.97 } : undefined}
                  >
                    {/* Glow for unlocked */}
                    {isUnlocked && (
                      <motion.div
                        className="absolute inset-0 rounded-neu-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'sine.inOut' }}
                        style={{
                          background: `radial-gradient(circle, ${config.color}15 0%, transparent 70%)`,
                        }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center relative z-10"
                      style={{
                        backgroundColor: isUnlocked ? config.bg : 'rgba(200, 191, 181, 0.15)',
                        color: isUnlocked ? config.color : '#B0A8A2',
                      }}
                    >
                      <Icon
                        name={achievement.icon}
                        size={config.iconSize}
                        color={isUnlocked ? config.color : '#B0A8A2'}
                      />
                    </div>

                    {/* Label */}
                    <div className="text-center relative z-10">
                      <p
                        className={`text-[11px] font-bold leading-tight ${
                          isUnlocked ? 'text-neu-text' : 'text-neu-text-tertiary'
                        }`}
                      >
                        {achievement.name}
                      </p>
                      <p className="text-[9px] text-neu-text-tertiary mt-0.5">
                        {conditionLabel}: {currentLabel}
                      </p>
                    </div>

                    {/* Points badge */}
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded-full relative z-10"
                      style={{
                        backgroundColor: isUnlocked ? `${config.color}20` : 'rgba(200, 191, 181, 0.1)',
                        color: isUnlocked ? config.color : '#B0A8A2',
                      }}
                    >
                      +{achievement.pointsReward}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};
