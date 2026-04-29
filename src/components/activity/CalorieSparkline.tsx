import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Sparkline } from '@/components/ui/MiniChart';
import { formatNumber } from '@/utils/formatters';
import { staggerItem } from '@/animations/stagger';
import type { DailyStats } from '@/types/activity';

interface CalorieSparklineProps {
  data: number[];
}

export const CalorieSparkline: React.FC<CalorieSparklineProps> = ({ data }) => {
  const total = data.reduce((sum, v) => sum + v, 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;
  const peak = Math.max(...data, 0);

  // Day labels
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <motion.div className="neu-raised p-4" variants={staggerItem}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-neu-text">Calorie Trend</span>
        <span className="text-[10px] text-neu-text-tertiary font-medium">Last 7 days</span>
      </div>

      <div className="flex items-end gap-3 mt-2">
        {/* Left stats */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div>
            <p className="text-[10px] text-neu-text-tertiary font-medium">Total</p>
            <p className="text-base font-extrabold text-neu-red tabular-nums">
              {formatNumber(total)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neu-text-tertiary font-medium">Avg/day</p>
            <p className="text-sm font-bold text-neu-text-secondary tabular-nums">
              {formatNumber(avg)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neu-text-tertiary font-medium">Peak</p>
            <p className="text-sm font-bold text-neu-peach tabular-nums">
              {formatNumber(peak)}
            </p>
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex-1 min-w-0">
          <Sparkline
            data={data}
            width={200}
            height={50}
            color="#D4756B"
          />
          {/* Day labels */}
          <div className="flex justify-between mt-1">
            {dayLabels.map((d) => (
              <span key={d} className="text-[8px] text-neu-text-tertiary font-medium">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
