import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Trophy,
  Flame,
  Clock,
  Dumbbell,
  Target,
  TrendingUp,
  Home,
  Share2,
} from 'lucide-react';
import { NeuButton } from '@/components/ui/NeuButton';
import { NeuCard } from '@/components/ui/NeuCard';
import { useUserStore } from '@/store/useUserStore';
import { useChallengeStore } from '@/store/useChallengeStore';
import { staggerContainer, staggerItem, staggerItemScale } from '@/animations/stagger';
import { formatNumber, formatDuration, formatCalories } from '@/utils/formatters';
import { MUSCLE_GROUP_LABELS, INTENSITY_LABELS } from '@/types/common';
import type { WorkoutSummary } from '@/types/workout';
import { useToast } from '@/components/ui/Toast';
import { copyToClipboard } from '@/utils/helpers';

export const WorkoutSummaryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshProfile } = useUserStore();
  const { checkAndUnlockAchievements } = useChallengeStore();

  const [summary, setSummary] = useState<WorkoutSummary | null>(null);

  useEffect(() => {
    const state = location.state as { summary?: WorkoutSummary } | null;
    if (state?.summary) {
      setSummary(state.summary);
      refreshProfile();
      // Check achievements async
      setTimeout(() => checkAndUnlockAchievements(), 1000);
    } else {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate, refreshProfile, checkAndUnlockAchievements]);

  const handleShare = async () => {
    if (!summary) return;
    const text = `🏆 Workout Complete!\n${summary.session.workoutPlanName}\n⏱ ${formatDuration(summary.session.totalDuration)}\n🔥 ${formatCalories(summary.session.totalCalories)}\n⭐ ${summary.session.pointsEarned} points\n#FitTrack`;
    const ok = await copyToClipboard(text);
    if (ok) toast.success('Results copied to clipboard!');
    else toast.error('Could not copy');
  };

  if (!summary) {
    return (
      <div className="min-h-dvh bg-neu-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-neu-bg-dark/30 border-t-neu-blue animate-spin" />
      </div>
    );
  }

  const s = summary.session;

  return (
    <motion.div
      className="min-h-dvh bg-neu-bg flex flex-col safe-top"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Success header */}
      <motion.div
        className="flex flex-col items-center pt-10 pb-6"
        variants={staggerItem}
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-neu-green-tint flex items-center justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
        >
          <CheckCircle2 size={40} className="text-neu-green" />
        </motion.div>
        <h1 className="text-2xl font-extrabold text-neu-text">Workout Complete!</h1>
        <p className="text-sm text-neu-text-secondary mt-1">{s.workoutPlanName}</p>
      </motion.div>

      {/* Main stats */}
      <motion.div className="px-5" variants={staggerItem}>
        <div className="neu-raised-lg p-5 grid grid-cols-2 gap-4">
          <StatItem
            icon={<Flame size={18} className="text-neu-red" />}
            label="Calories"
            value={formatNumber(s.totalCalories)}
            unit="kcal"
            color="#D4756B"
          />
          <StatItem
            icon={<Clock size={18} className="text-neu-blue" />}
            label="Duration"
            value={formatDuration(s.totalDuration)}
            unit=""
            color="#7BA7CC"
          />
          <StatItem
            icon={<Trophy size={18} className="text-neu-peach" />}
            label="Points"
            value={formatNumber(s.pointsEarned)}
            unit="pts"
            color="#E8A87C"
          />
          <StatItem
            icon={<Target size={18} className="text-neu-green" />}
            label="Completion"
            value={`${s.completionPercentage}%`}
            unit=""
            color="#8ECDA8"
          />
        </div>
      </motion.div>

      {/* Exercise breakdown */}
      <motion.div className="px-5 mt-5" variants={staggerItem}>
        <div className="neu-raised p-4">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell size={16} className="text-neu-peach" />
            <span className="text-sm font-bold text-neu-text">Exercises</span>
            <span className="text-xs text-neu-text-tertiary ml-auto">
              {summary.completedExercises}/{summary.totalExercises} completed
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {s.exercises.map((ex, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-neu-sm"
                variants={staggerItemScale}
                style={{
                  backgroundColor: ex.wasSkipped ? 'rgba(200, 191, 181, 0.1)' : 'transparent',
                  opacity: ex.wasSkipped ? 0.5 : 1,
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{
                    backgroundColor: ex.sets.some((s) => s.completed)
                      ? 'rgba(142, 205, 168, 0.2)'
                      : 'rgba(200, 191, 181, 0.2)',
                    color: ex.sets.some((s) => s.completed) ? '#6BB88A' : '#B0A8A2',
                  }}
                >
                  {ex.sets.some((s) => s.completed) ? '✓' : '−'}
                </span>
                <span className="text-xs font-medium text-neu-text flex-1 truncate">
                  {ex.exerciseName}
                </span>
                <span className="text-[10px] text-neu-text-tertiary tabular-nums">
                  {ex.estimatedCalories} kcal
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Personal Records */}
      {summary.personalRecords.length > 0 && (
        <motion.div className="px-5 mt-5" variants={staggerItem}>
          <div className="neu-raised p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-neu-peach" />
              <span className="text-sm font-bold text-neu-text">New Personal Records!</span>
            </div>
            <div className="flex flex-col gap-2">
              {summary.personalRecords.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between px-3 py-2 rounded-neu-sm bg-neu-peach-tint"
                >
                  <div>
                    <p className="text-xs font-semibold text-neu-text">{pr.exerciseName}</p>
                    <p className="text-[10px] text-neu-text-secondary">
                      Max {pr.field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-neu-peach tabular-nums">
                      {formatNumber(pr.value)} {pr.unit}
                    </p>
                    {pr.previousValue > 0 && (
                      <p className="text-[9px] text-neu-green font-medium">
                        +{formatNumber(pr.value - pr.previousValue)} {pr.unit}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Muscle groups */}
      <motion.div className="px-5 mt-5" variants={staggerItem}>
        <div className="neu-raised p-4">
          <span className="text-sm font-bold text-neu-text">Muscles Worked</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {summary.muscleGroupsWorked.map((m) => (
              <span
                key={m}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-neu-blue-tint text-neu-blue"
              >
                {MUSCLE_GROUP_LABELS[m as keyof typeof MUSCLE_GROUP_LABELS] || m}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats summary */}
      <motion.div className="px-5 mt-5" variants={staggerItem}>
        <div className="grid grid-cols-3 gap-3">
          <div className="neu-raised-sm p-3 text-center">
            <p className="text-lg font-extrabold text-neu-text tabular-nums">{summary.totalSetsCompleted}</p>
            <p className="text-[10px] text-neu-text-tertiary">Sets Done</p>
          </div>
          <div className="neu-raised-sm p-3 text-center">
            <p className="text-lg font-extrabold text-neu-text tabular-nums">{summary.totalRepsCompleted}</p>
            <p className="text-[10px] text-neu-text-tertiary">Total Reps</p>
          </div>
          <div className="neu-raised-sm p-3 text-center">
            <p className="text-lg font-extrabold text-neu-peach tabular-nums">{s.avgHeartRate}</p>
            <p className="text-[10px] text-neu-text-tertiary">Avg BPM</p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div className="px-5 mt-8 mb-6 flex flex-col gap-3" variants={staggerItem}>
        <NeuButton
          variant="accent"
          accent="blue"
          size="lg"
          fullWidth
          onClick={() => navigate('/')}
          icon={<Home size={18} />}
        >
          Back to Home
        </NeuButton>
        <NeuButtonGhost
          size="md"
          fullWidth
          onClick={handleShare}
          icon={<Share2 size={16} />}
        >
          Share Results
        </NeuButtonGhost>
      </motion.div>
    </motion.div>
  );
};

/* ===== Local stat item component ===== */
const StatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
}> = ({ icon, label, value, unit, color }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center"
      style={{ backgroundColor: `${color}18` }}
    >
      {icon}
    </div>
    <span className="text-lg font-extrabold tabular-nums" style={{ color }}>
      {value}
    </span>
    <span className="text-[10px] text-neu-text-tertiary font-medium">
      {label} {unit}
    </span>
  </div>
);

export default WorkoutSummaryPage;
