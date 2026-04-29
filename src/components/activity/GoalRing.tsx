import React from 'react';
import { motion } from 'framer-motion';
import { ProgressRingWithLabel } from '@/components/ui/ProgressRing';
import { staggerItem } from '@/animations/stagger';

interface GoalRingProps {
  percent: number;
  label: string;
}

export const GoalRing: React.FC<GoalRingProps> = ({ percent, label }) => {
  return (
    <motion.div className="neu-raised p-4 flex flex-col items-center" variants={staggerItem}>
      <ProgressRingWithLabel
        percent={percent}
        size={120}
        strokeWidth={10}
        color="#7BA7CC"
        colorEnd="#5A8DB8"
        trackColor="rgba(123, 167, 204, 0.12)"
        valueSize="lg"
        valueColor="#7BA7CC"
        animationDuration={1.4}
      />
      <p className="text-xs font-semibold text-neu-text-secondary mt-2 text-center">
        {label}
      </p>
      <p className="text-[10px] text-neu-text-tertiary">
        {Math.round(percent)}% completed
      </p>
    </motion.div>
  );
};
