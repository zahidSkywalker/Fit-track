import React from 'react';
import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/NeuButton';
import { staggerContainer, staggerItem } from '@/animations/stagger';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const features = [
    { icon: '🎯', title: 'Smart Workouts', desc: '80+ exercises, 15+ plans, custom builder' },
    { icon: '📊', title: 'Track Everything', desc: 'Calories, heart rate, steps, points' },
    { icon: '🏆', title: 'Challenges', desc: 'Gamified challenges & achievements' },
    { icon: '📈', title: 'Analytics', desc: 'Weekly charts, streaks, personal records' },
    { icon: '💾', title: '100% Offline', desc: 'All data stored locally, no account needed' },
    { icon: '🔒', title: 'Fully Private', desc: 'Zero data leaves your device' },
  ];

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 py-10 text-center"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <motion.div
        className="w-20 h-20 neu-raised-circle flex items-center justify-center mb-5"
        variants={staggerItem}
      >
        <svg width="40" height="40" viewBox="0 0 512 512" fill="none">
          <g transform="translate(256, 256) scale(0.5)">
            <rect x="-130" y="-28" width="40" height="56" rx="8" fill="#7BA7CC" opacity="0.9" />
            <rect x="-90" y="-10" width="50" height="20" rx="4" fill="#8A807A" />
            <rect x="-40" y="-14" width="80" height="28" rx="14" fill="#8A807A" />
            <rect x="40" y="-10" width="50" height="20" rx="4" fill="#8A807A" />
            <rect x="90" y="-28" width="40" height="56" rx="8" fill="#7BA7CC" opacity="0.9" />
            <rect x="-125" y="-24" width="30" height="8" rx="4" fill="white" opacity="0.25" />
            <rect x="95" y="-24" width="30" height="8" rx="4" fill="white" opacity="0.25" />
          </g>
        </svg>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-3xl font-extrabold text-neu-text mb-2"
        variants={staggerItem}
      >
        FitTrack
      </motion.h1>
      <motion.p
        className="text-sm text-neu-text-secondary mb-8 max-w-xs"
        variants={staggerItem}
      >
        Your personal fitness companion. Track workouts, crush goals, and build habits — all offline and private.
      </motion.p>

      {/* Features */}
      <motion.div
        className="grid grid-cols-2 gap-3 w-full max-w-sm mb-10"
        variants={staggerContainer}
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            className="neu-raised-sm p-3 text-left"
            variants={staggerItemScale}
          >
            <span className="text-xl mb-1 block">{f.icon}</span>
            <p className="text-xs font-bold text-neu-text">{f.title}</p>
            <p className="text-[10px] text-neu-text-secondary mt-0.5 leading-snug">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div variants={staggerItem} className="w-full max-w-xs">
        <NeuButton
          variant="accent"
          accent="blue"
          size="lg"
          fullWidth
          onClick={onNext}
        >
          Get Started
        </NeuButton>
        <p className="text-[10px] text-neu-text-tertiary mt-3">
          Takes about 1 minute to set up
        </p>
      </motion.div>
    </motion.div>
  );
};
