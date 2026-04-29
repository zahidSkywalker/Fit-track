import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar } from 'lucide-react';
import { NeuButton } from '@/components/ui/NeuButton';
import type { OnboardingData } from '@/types/user';
import { WEEK_DAYS_ORDER, WEEK_DAY_LABELS, type WeekDay } from '@/types/common';
import { staggerContainer, staggerItem } from '@/animations/stagger';

interface ScheduleStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (partial: Partial<OnboardingData>) => void;
  onFinish: (completeData: OnboardingData) => void;
  onBack: () => void;
}

export const ScheduleStep: React.FC<ScheduleStepProps> = ({
  data,
  onUpdate,
  onFinish,
  onBack,
}) => {
  const [error, setError] = useState('');

  const toggleDay = (day: WeekDay) => {
    const current = data.weeklyTrainingDays || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    onUpdate({ weeklyTrainingDays: updated });
  };

  const handleFinish = () => {
    if (!data.weeklyTrainingDays || data.weeklyTrainingDays.length === 0) {
      setError('Please select at least one training day');
      return;
    }
    setError('');
    onFinish(data as OnboardingData);
  };

  const selectedCount = data.weeklyTrainingDays?.length || 0;

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
          <h2 className="text-lg font-extrabold text-neu-text">Training Schedule</h2>
          <p className="text-xs text-neu-text-secondary">Which days do you plan to work out?</p>
        </div>
      </div>

      {/* Day selector */}
      <motion.div
        className="flex flex-col items-center gap-6 flex-1 justify-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Calendar icon */}
        <motion.div
          className="w-16 h-16 neu-raised-circle flex items-center justify-center"
          variants={staggerItem}
        >
          <Calendar size={28} className="text-neu-blue" />
        </motion.div>

        {/* Day buttons */}
        <motion.div
          className="grid grid-cols-4 gap-3 w-full max-w-xs"
          variants={staggerContainer}
        >
          {WEEK_DAYS_ORDER.map((day) => {
            const isSelected = data.weeklyTrainingDays?.includes(day) || false;

            return (
              <motion.button
                key={day}
                className="flex flex-col items-center gap-1.5"
                variants={staggerItem}
                whileTap={{ scale: 0.92 }}
                onClick={() => toggleDay(day)}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={
                    isSelected
                      ? {
                          background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)',
                          boxShadow: '4px 4px 8px #C8BFB5, -4px -4px 8px #F5EDE5',
                          color: '#FFFFFF',
                        }
                      : {
                          boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
                          backgroundColor: '#E8E0D8',
                          color: '#8A807A',
                        }
                  }
                >
                  {WEEK_DAY_LABELS[day].slice(0, 3)}
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Selected count */}
        <motion.p
          className="text-sm text-neu-text-secondary font-medium"
          variants={staggerItem}
        >
          {selectedCount === 0
            ? 'No days selected'
            : `${selectedCount} day${selectedCount > 1 ? 's' : ''} per week`}
        </motion.p>

        {/* Tip */}
        <motion.div
          className="neu-pressed-sm p-3 rounded-neu-sm w-full max-w-xs"
          variants={staggerItem}
        >
          <p className="text-[11px] text-neu-text-secondary leading-relaxed text-center">
            💡 You can always change this later in Settings. We recommend starting with 3-4 days per week.
          </p>
        </motion.div>
      </motion.div>

      {/* Error */}
      {error && (
        <p className="text-xs text-neu-red font-medium mt-4 text-center">{error}</p>
      )}

      {/* Finish button */}
      <div className="mt-6">
        <NeuButton
          variant="accent"
          accent="green"
          size="lg"
          fullWidth
          onClick={handleFinish}
        >
          Start My Journey 🚀
        </NeuButton>
      </div>
    </div>
  );
};
