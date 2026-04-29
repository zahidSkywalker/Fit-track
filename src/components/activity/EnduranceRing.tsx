import React from 'react';
import { motion } from 'framer-motion';
import { ProgressRingWithLabel } from '@/components/ui/ProgressRing';
import { staggerItem } from '@/animations/stagger';

interface EnduranceRingProps {
  percent: number;
  label: string;
}

export const EnduranceRing: React.FC<EnduranceRingProps> = ({ percent, label }) => {
  return (
    <motion.div className="neu-raised p-4 flex flex-col items-center" variants={staggerItem}>
      <ProgressRingWithLabel
        percent={percent}
        size={120}
        strokeWidth={10}
        color="#8ECDA8"
        colorEnd="#6BB88A"
        trackColor="rgba(142, 205, 168, 0.12)"
        valueSize="lg"
        valueColor="#8ECDA8"
        animationDuration={1.4}
      />
      <p className="text-xs font-semibold text-neu-text-secondary mt-2 text-center">
        {label}
      </p>
      <p className="text-[10px] text-neu-text-tertiary">
        {Math.round(percent)}% success
      </p>
    </motion.div>
  );
};
