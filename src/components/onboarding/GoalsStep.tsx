import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Target, Flame, Wind, Stretch, Heart } from 'lucide-react';
import { NeuButton } from '@/components/ui/NeuButton';
import type { OnboardingData } from '@/types/user';
import { FitnessGoal, FITNESS_GOAL_LABELS } from '@/types/common';
import { staggerContainer, staggerItemScale } from '@/animations/stagger';

interface GoalsStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const GOAL_ICONS: Record<FitnessGoal, React.ReactNode> = {
  [FitnessGoal.LOSE_WEIGHT]: <Flame size={22} />,
  [FitnessGoal.BUILD_MUSCLE]: <Target size={22} />,
  [FitnessGoal.ENDURANCE]: <Wind size={22} />,
  [FitnessGoal.FLEXIBILITY]: <Stretch size={22} />,
  [FitnessGoal.GENERAL]: <Heart size={22} />,
};

const GOAL_COLORS: Record<FitnessGoal, string> = {
  [FitnessGoal.LOSE_WEIGHT]: '#D4756B',
  [FitnessGoal.BUILD_MUSCLE]: '#E8A87C',
  [FitnessGoal.ENDURANCE]: '#7BA7CC',
  [FitnessGoal.FLEXIBILITY]: '#8ECDA8',
  [FitnessGoal.GENERAL]: '#7BA7CC',
};

const GOAL_DESCS: Record<FitnessGoal, string> = {
  [FitnessGoal.LOSE_WEIGHT]: 'Burn fat with cardio & HIIT focused plans',
  [FitnessGoal.BUILD_MUSCLE]: 'Progressive overload strength programs',
  [FitnessGoal.ENDURANCE]: 'Running, cycling & cardio conditioning',
  [FitnessGoal.FLEXIBILITY]: 'Yoga, stretching & mobility routines',
  [FitnessGoal.GENERAL]: 'Balanced mix of everything',
};

export const GoalsStep: React.FC<GoalsStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!data.goal) {
      setError('Please select a fitness goal');
      return;
    }
    setError('');
    onNext();
  };

  const goals = Object.entries(FITNESS_GOAL_LABELS) as [FitnessGoal, string][];

  return (
    <div className="flex flex-col px-5 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          onClick={onBack}
          className="neu-raised-circle w-10 h-10 flex items-center justify-center neu-pressable"
          whileTap={{ scale: 0.92 }}
        >
          <ChevronLeft size={20} className="text-neu-text" />
        </motion.button>
        <div>
          <h2 className="text-lg font-extrabold text-neu-text">Your Goal</h2>
          <p className="text-xs text-neu-text-secondary">What do you want to achieve?</p>
        </div>
      </div>

      {/* Goal cards */}
      <motion.div
        className="flex flex-col gap-3 flex-1"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {goals.map(([value, label]) => {
          const isSelected = data.goal === value;
          const color = GOAL_COLORS[value];

          return (
            <motion.button
              key={value}
              className={`
                w-full text-left p-4 rounded-neu-lg flex items-center gap-4 transition-all
                ${isSelected ? '' : 'neu-raised neu-pressable'}
              `}
              style={
                isSelected
                  ? {
                      background: `linear-gradient(145deg, ${color}22, ${color}11)`,
                      boxShadow: `inset 4px 4px 8px ${color}20, inset -4px -4px 8px ${color}08`,
                      border: `2px solid ${color}40`,
                    }
                  : undefined
              }
              variants={staggerItemScale}
              whileTap={!isSelected ? { scale: 0.98 } : undefined}
              onClick={() => onUpdate({ goal: value })}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${color}20`,
                  color,
                }}
              >
                {GOAL_ICONS[value]}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold"
                  style={{ color: isSelected ? color : '#4A4240' }}
                >
                  {label}
                </p>
                <p className="text-[11px] text-neu-text-secondary mt-0.5">
                  {GOAL_DESCS[value]}
                </p>
              </div>
              {isSelected && (
                <motion.div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Error */}
      {error && (
        <p className="text-xs text-neu-red font-medium mt-4 text-center">{error}</p>
      )}

      {/* Next button */}
      <div className="mt-6">
        <NeuButton
          variant="accent"
          accent="blue"
          size="lg"
          fullWidth
          onClick={handleNext}
        >
          Continue
        </NeuButton>
      </div>
    </div>
  );
};
