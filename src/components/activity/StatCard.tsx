import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from '@/utils/formatters';
import { staggerItem } from '@/animations/stagger';

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  color,
  icon,
}) => {
  return (
    <motion.div className="neu-raised-sm p-3" variants={staggerItem}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          {icon}
        </div>
        <span className="text-[11px] text-neu-text-secondary font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-xl font-extrabold tabular-nums"
          style={{ color }}
        >
          {formatNumber(value)}
        </span>
        <span className="text-[10px] text-neu-text-tertiary font-medium">{unit}</span>
      </div>
    </motion.div>
  );
};
