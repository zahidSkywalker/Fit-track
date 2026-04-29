import React from 'react';
import { motion } from 'framer-motion';
import { MiniChart } from '@/components/ui/MiniChart';
import { staggerItem } from '@/animations/stagger';
import { formatNumber } from '@/utils/formatters';
import type { DailyStats } from '@/types/activity';
import { WEEK_DAY_LABELS, type WeekDay, WEEK_DAYS_ORDER } from '@/types/common';

interface WeeklyChartProps {
  data: DailyStats[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  // Map data to day order, filling missing days with 0
  const dayMap = new Map<string, DailyStats>();
  data.forEach((d) => dayMap.set(d.date, d));

  const sortedData = WEEK_DAYS_ORDER.map((day) => {
    // Find the stat for this weekday
    const matchingStat = data.find((d) => {
      const dDate = new Date(d.date);
      const dDay = dDate.getDay();
      const dayIndex = dDay === 0 ? 6 : dDay - 1;
      return WEEK_DAYS_ORDER[dayIndex] === day;
    });
    return matchingStat ? Math.round(matchingStat.totalCalories) : 0;
  });

  const totalCalories = sortedData.reduce((s, v) => s + v, 0);
  const maxCalories = Math.max(...sortedData, 1);
  const avgCalories = Math.round(totalCalories / 7);

  return (
    <motion.div className="neu-raised p-4" variants={staggerItem}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-neu-text">Weekly Overview</span>
        <span className="text-[10px] text-neu-text-tertiary font-medium">
          {formatNumber(totalCalories)} kcal total
        </span>
      </div>

      {/* Chart */}
      <div className="mt-3 -mx-1">
        <MiniChart
          data={sortedData}
          height={80}
          type="bar"
          color="#7BA7CC"
          colorEnd="#5A8DB8"
          barGap={0.35}
          barRadius={5}
          animate
          animationDuration={0.8}
        />
      </div>

      {/* Day labels + values */}
      <div className="flex justify-between mt-2 px-1">
        {WEEK_DAYS_ORDER.map((day, i) => (
          <div key={day} className="flex flex-col items-center gap-0.5">
            <span
              className="text-[9px] font-bold tabular-nums"
              style={{ color: sortedData[i] > 0 ? '#7BA7CC' : '#B0A8A2' }}
            >
              {sortedData[i] > 0 ? formatNumber(sortedData[i]) : '-'}
            </span>
            <span className="text-[9px] text-neu-text-tertiary font-semibold">
              {WEEK_DAY_LABELS[day].slice(0, 3)}
            </span>
          </div>
        ))}
      </div>

      {/* Average */}
      <div className="mt-3 pt-3 border-t border-neu-bg-dark/15 flex items-center justify-between">
        <span className="text-[11px] text-neu-text-secondary font-medium">Daily Average</span>
        <span className="text-xs font-bold text-neu-blue tabular-nums">
          {formatNumber(avgCalories)} kcal
        </span>
      </div>
    </motion.div>
  );
};
