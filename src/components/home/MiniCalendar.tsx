import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { staggerItem } from '@/animations/stagger';
import {
  generateCalendarGrid,
  type CalendarDay,
  formatMonthYear,
} from '@/utils/dateUtils';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { getWeekStart } from '@/utils/dateUtils';

export const MiniCalendar: React.FC = () => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const sessions = useWorkoutStore((s) => s.sessions);
  const workoutDates = useMemo(() => {
    return new Set(
      sessions.filter((s) => s.status === 'completed').map((s) => s.date)
    );
  }, [sessions]);

  const calendarDays = useMemo(
    () => generateCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const weekStart = useMemo(() => getWeekStart(now), []);
  const currentWeekDates = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return new Set(dates);
  }, [weekStart]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return (
    <motion.div className="neu-raised p-4 mt-5" variants={staggerItem}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <motion.button
          className="neu-raised-circle w-8 h-8 flex items-center justify-center neu-pressable"
          whileTap={{ scale: 0.9 }}
          onClick={goToPrevMonth}
        >
          <ChevronLeft size={14} className="text-neu-text-secondary" />
        </motion.button>
        <span className="text-sm font-bold text-neu-text">
          {formatMonthYear(new Date(viewYear, viewMonth))}
        </span>
        <motion.button
          className="neu-raised-circle w-8 h-8 flex items-center justify-center neu-pressable"
          whileTap={{ scale: 0.9 }}
          onClick={goToNextMonth}
        >
          <ChevronRight size={14} className="text-neu-text-secondary" />
        </motion.button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-neu-text-tertiary py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid — show only 5 rows (35 cells) */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.slice(0, 35).map((day: CalendarDay, i: number) => {
          const hasWorkout = workoutDates.has(day.isoDate);
          const isCurrentWeek = currentWeekDates.has(day.isoDate);
          const isToday = day.isToday;

          return (
            <div
              key={i}
              className={`
                aspect-square rounded-full flex items-center justify-center text-[11px] font-semibold relative
                ${day.isCurrentMonth ? '' : 'opacity-20'}
                ${isCurrentWeek && day.isCurrentMonth ? 'text-neu-blue' : 'text-neu-text-secondary'}
                ${isToday ? 'font-extrabold' : ''}
              `}
            >
              {day.dayNumber}

              {/* Workout dot */}
              {hasWorkout && day.isCurrentMonth && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: isCurrentWeek ? '#7BA7CC' : '#8ECDA8' }}
                />
              )}

              {/* Today ring */}
              {isToday && (
                <span className="absolute inset-0.5 rounded-full border-2 border-neu-blue/40" />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
