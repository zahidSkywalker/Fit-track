import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { ProfileStep } from '@/components/onboarding/ProfileStep';
import { GoalsStep } from '@/components/onboarding/GoalsStep';
import { ScheduleStep } from '@/components/onboarding/ScheduleStep';
import { useUserStore } from '@/store/useUserStore';
import type { OnboardingData } from '@/types/user';
import {
  Gender,
  FitnessLevel,
  FitnessGoal,
  type WeekDay,
  WEEK_DAYS_ORDER,
} from '@/types/common';

const STEPS = ['welcome', 'profile', 'goals', 'schedule'] as const;
const STEP_INDEX = { welcome: 0, profile: 1, goals: 2, schedule: 3 };

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const [step, setStep] = useState<typeof STEPS[number]>('welcome');
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});

  const currentIndex = STEP_INDEX[step];

  const goNext = () => {
    if (currentIndex < STEPS.length - 1) {
      setDirection(1);
      setStep(STEPS[currentIndex + 1]);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setStep(STEPS[currentIndex - 1]);
    }
  };

  const handleFinish = async (data: OnboardingData) => {
    await completeOnboarding(data);
    navigate('/', { replace: true });
  };

  const updateData = (partial: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="min-h-dvh bg-neu-bg flex flex-col safe-top">
      {/* Progress dots */}
      {step !== 'welcome' && (
        <div className="flex items-center justify-center gap-2 pt-5 pb-2">
          {STEPS.filter((s) => s !== 'welcome').map((s, i) => (
            <motion.div
              key={s}
              className="rounded-full"
              style={{
                width: i === STEP_INDEX[step] - 1 ? 24 : 8,
                height: 8,
                backgroundColor:
                  i <= STEP_INDEX[step] - 1 ? '#7BA7CC' : 'rgba(200, 191, 181, 0.5)',
              }}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex flex-col"
          >
            {step === 'welcome' && (
              <WelcomeStep onNext={goNext} />
            )}
            {step === 'profile' && (
              <ProfileStep
                data={formData}
                onUpdate={updateData}
                onNext={goNext}
                onBack={goBack}
              />
            )}
            {step === 'goals' && (
              <GoalsStep
                data={formData}
                onUpdate={updateData}
                onNext={goNext}
                onBack={goBack}
              />
            )}
            {step === 'schedule' && (
              <ScheduleStep
                data={formData}
                onUpdate={updateData}
                onFinish={handleFinish}
                onBack={goBack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;
