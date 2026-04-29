import React from 'react';
import { motion } from 'framer-motion';
import { ProgressRingWithLabel } from '@/components/ui/ProgressRing';
import { formatNumber } from '@/utils/formatters';
import { staggerItem } from '@/animations/stagger';
import { type WeekDay, WEEK_DAYS_ORDER, WEEK_DAY_LABELS } from '@/types/common';

interface WeeklyPointsProps {
  points: number;
  target: number;
  percent: number;
  dailyBreakdown: Record<WeekDay, number> | null;
}

const DAY_SHORT: Record<WeekDay, string> = {
  mon: 'M',
  tue: 'T',
  wed: 'W',
  thu: 'T',
  fri: 'F',
  sat: 'S',
  sun: 'S',
};

export const WeeklyPoints: React.FC<WeeklyPointsProps> = ({
  points,
  target,
  percent,
  dailyBreakdown,
}) => {
  const maxDayPoints = target / 7;

  return (
    <motion.div
      className="neu-raised p-4 mt-5"
      variants={staggerItem}
    >
      <div className="flex items-center gap-5">
        {/* Ring */}
        <ProgressRingWithLabel
          percent={percent}
          size={100}
          strokeWidth={8}
          color="#E8A87C"
          colorEnd="#D4906A"
          trackColor="rgba(232, 168, 124, 0.15)"
          valueDisplay={formatNumber(points)}
          label="Points"
          valueSize="md"
          valueColor="#E8A87C"
          animationDuration={1.2}
        />

        {/* Info + daily bars */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neu-text-secondary mb-1">Weekly Score</p>
          <p className="text-[11px] text-neu-text-tertiary mb-3">
            Target: {formatNumber(target)} pts
          </p>

          {/* Daily mini bars */}
          {dailyBreakdown && (
            <div className="flex items-end gap-1.5 h-10">
              {WEEK_DAYS_ORDER.map((day) => {
                const val = dailyBreakdown[day] || 0;
                const heightPct = maxDayPoints > 0
                  ? Math.min(100, (val / maxDayPoints) * 100)
                  : 0;
                const hasActivity = val > 0;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      className="w-full rounded-sm"
                      style={{
                        minHeight: 2,
                        backgroundColor: hasActivity ? '#E8A87C' : 'rgba(200, 191, 181, 0.25)',
                        borderRadius: 2,
                      }}
                      initial={{ height: 2 }}
                      animate={{ height: `${Math.max(2, heightPct)}%` }}
                      transition={{
                        duration: 0.6,
                        delay: 0.4 + WEEK_DAYS_ORDER.indexOf(day) * 0.05,
                        ease: 'easeOut',
                      }}
                    />
                    <span className="text-[8px] text-neu-text-tertiary font-semibold">
                      {DAY_SHORT[day]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
