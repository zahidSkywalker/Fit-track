import React from 'react';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { staggerItem, staggerContainer, staggerItemScale } from '@/animations/stagger';
import { formatMinutesShort } from '@/utils/formatters';

interface ActivityBreakdownProps {
  cardio: number;
  strength: number;
  flexibility: number;
  hiit: number;
}

const BREAKDOWN_ITEMS = [
  { key: 'cardio' as const, label: 'Cardio', color: '#7BA7CC', bgColor: 'rgba(123, 167, 204, 0.15)', icon: '🫀' },
  { key: 'strength' as const, label: 'Strength', color: '#E8A87C', bgColor: 'rgba(232, 168, 124, 0.15)', icon: '💪' },
  { key: 'flexibility' as const, label: 'Flexibility', color: '#8ECDA8', bgColor: 'rgba(142, 205, 168, 0.15)', icon: '🧘' },
  { key: 'hiit' as const, label: 'HIIT', color: '#D4756B', bgColor: 'rgba(212, 117, 107, 0.15)', icon: '⚡' },
];

export const ActivityBreakdown: React.FC<ActivityBreakdownProps> = ({
  cardio,
  strength,
  flexibility,
  hiit,
}) => {
  const values = { cardio, strength, flexibility, hiit };
  const total = cardio + strength + flexibility + hiit || 1;

  return (
    <motion.div className="neu-raised p-4" variants={staggerItem}>
      <p className="text-sm font-bold text-neu-text mb-3">Activity Breakdown</p>

      <motion.div
        className="flex flex-col gap-3"
        variants={staggerContainer}
      >
        {BREAKDOWN_ITEMS.map((item) => {
          const value = values[item.key];
          const percent = (value / total) * 100;

          return (
            <motion.div key={item.key} variants={staggerItemScale}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs font-semibold text-neu-text">{item.label}</span>
                </div>
                <span className="text-xs font-bold tabular-nums" style={{ color: item.color }}>
                  {formatMinutesShort(value)}
                </span>
              </div>
              <ProgressBar
                percent={percent}
                height={6}
                color={item.color}
                trackColor={item.bgColor}
                animate
                animationDuration={0.8}
                borderRadius={3}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
