import React from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, X } from 'lucide-react';
import { NeuButton, NeuButtonGhost } from '@/components/ui/NeuButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { staggerItem } from '@/animations/stagger';
import { formatNumber } from '@/utils/formatters';
import type { Challenge, ChallengeProgress } from '@/types/challenge';
import { getChallengeCompletionPercent, getChallengeRemainingDays } from '@/types/challenge';
import { RARITY_CONFIG } from '@/constants/achievements';
import { useChallengeStore } from '@/store/useChallengeStore';
import { useToast } from '@/components/ui/Toast';

interface ChallengeCardProps {
  challenge: Challenge;
  progress: ChallengeProgress | undefined;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#8ECDA8',
  medium: '#7BA7CC',
  hard: '#E8A87C',
};

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, progress }) => {
  const { startChallenge, abandonChallenge } = useChallengeStore();
  const toast = useToast();

  const percent = progress
    ? getChallengeCompletionPercent(progress, challenge)
    : 0;
  const remainingDays = progress
    ? getChallengeRemainingDays(progress, challenge)
    : challenge.durationDays;
  const isActive = progress?.status === 'in_progress';
  const isCompleted = progress?.status === 'completed';

  const handleStart = async () => {
    await startChallenge(challenge.id);
    toast.success(`Started "${challenge.name}"!`);
  };

  const handleAbandon = async () => {
    if (!progress) return;
    await abandonChallenge(progress.id);
    toast.info('Challenge abandoned');
  };

  return (
    <motion.div
      className={`neu-raised p-4 ${isCompleted ? 'opacity-60' : ''}`}
      variants={staggerItem}
      layout
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-neu flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${DIFFICULTY_COLORS[challenge.difficulty]}18`,
          }}
        >
          <Icon
            name={challenge.icon}
            size={20}
            color={DIFFICULTY_COLORS[challenge.difficulty]}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-neu-text truncate">{challenge.name}</h3>
          <p className="text-[11px] text-neu-text-secondary mt-0.5 line-clamp-2 leading-snug">
            {challenge.description}
          </p>
        </div>

        {isCompleted && (
          <div className="w-7 h-7 rounded-full bg-neu-green-tint flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={14} className="text-neu-green" />
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-neu-text-tertiary font-medium">
            {progress ? formatNumber(progress.currentValue) : 0} / {formatNumber(challenge.targetValue)} {challenge.unit}
          </span>
          <span className="text-[11px] font-bold tabular-nums" style={{ color: DIFFICULTY_COLORS[challenge.difficulty] }}>
            {Math.round(percent)}%
          </span>
        </div>
        <ProgressBar
          percent={percent}
          height={8}
          color={DIFFICULTY_COLORS[challenge.difficulty]}
          trackColor={`${DIFFICULTY_COLORS[challenge.difficulty]}20`}
          animate={!isCompleted}
          animationDuration={0.8}
          borderRadius={4}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 mb-3">
        <Badge variant="soft" accent={challenge.difficulty === 'easy' ? 'green' : challenge.difficulty === 'medium' ? 'blue' : 'peach'} size="sm">
          {challenge.difficulty}
        </Badge>
        <span className="text-[10px] text-neu-text-tertiary font-medium">
          {remainingDays} days left
        </span>
        <span className="text-[10px] text-neu-text-tertiary font-medium">
          🏆 {challenge.pointsReward} pts
        </span>
      </div>

      {/* Instructions preview */}
      {challenge.instructions.length > 0 && (
        <div className="neu-pressed-sm p-2.5 rounded-neu-sm mb-3">
          <p className="text-[10px] text-neu-text-tertiary leading-snug">
            {challenge.instructions[0]}
          </p>
        </div>
      )}

      {/* Action button */}
      {isCompleted ? (
        <div className="flex items-center justify-center gap-2 py-2 rounded-neu-sm bg-neu-green-tint">
          <CheckCircle2 size={14} className="text-neu-green" />
          <span className="text-xs font-bold text-neu-green">Challenge Complete!</span>
        </div>
      ) : isActive ? (
        <NeuButtonGhost size="sm" fullWidth icon={<X size={14} />} onClick={handleAbandon}>
          Abandon Challenge
        </NeuButtonGhost>
      ) : (
        <NeuButton
          variant="accent"
          accent={challenge.difficulty === 'easy' ? 'green' : challenge.difficulty === 'medium' ? 'blue' : 'peach'}
          size="sm"
          fullWidth
          onClick={handleStart}
          icon={<Play size={14} />}
        >
          Start Challenge
        </NeuButton>
      )}
    </motion.div>
  );
};
