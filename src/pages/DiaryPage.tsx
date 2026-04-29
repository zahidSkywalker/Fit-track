import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { NeuButton, NeuButtonGhost } from '@/components/ui/NeuButton';
import { Tabs } from '@/components/ui/Tabs';
import { SkeletonList } from '@/components/ui/Skeleton';
import { DiaryEntry } from '@/components/diary/DiaryEntry';
import { BottomSheet } from '@/components/ui/Modal';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { staggerContainer, staggerItem } from '@/animations/stagger';
import { formatMonthYear, getWeekStart, formatDateISO } from '@/utils/dateUtils';
import { WorkoutStatus } from '@/types/common';

export const DiaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, sessionsLoading, loadSessions } = useWorkoutStore();
  const [viewDate, setViewDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let result = sessions.filter((s) => s.status === WorkoutStatus.COMPLETED);

    // Month filter
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    result = result.filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    // Category filter
    if (filterCategory && filterCategory !== 'all') {
      result = result.filter((s) =>
        s.workoutPlanName.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [sessions, viewDate, filterCategory]);

  // Count by tab
  const allCount = filteredSessions.length;

  const goToPrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const categories = ['all', 'Strength', 'Cardio', 'HIIT', 'Flexibility', 'Calisthenics'];

  return (
    <div className="page-container pt-2">
      <PageHeader title="Workout Diary" subtitle="Your training history" />

      {/* Month navigator */}
      <motion.div
        className="flex items-center justify-between mt-4 px-1"
        variants={staggerItem}
      >
        <motion.button
          className="neu-raised-circle w-9 h-9 flex items-center justify-center neu-pressable"
          whileTap={{ scale: 0.9 }}
          onClick={goToPrevMonth}
        >
          <ChevronLeft size={16} className="text-neu-text-secondary" />
        </motion.button>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-neu-blue" />
          <span className="text-sm font-bold text-neu-text">
            {formatMonthYear(viewDate)}
          </span>
        </div>
        <motion.button
          className="neu-raised-circle w-9 h-9 flex items-center justify-center neu-pressable"
          whileTap={{ scale: 0.9 }}
          onClick={goToNextMonth}
        >
          <ChevronRight size={16} className="text-neu-text-secondary" />
        </motion.button>
      </motion.div>

      {/* Filter + count */}
      <motion.div
        className="flex items-center justify-between mt-4 px-1"
        variants={staggerItem}
      >
        <span className="text-xs text-neu-text-secondary font-medium">
          {allCount} workout{allCount !== 1 ? 's' : ''}
        </span>
        <motion.button
          className={`neu-raised-sm px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold neu-pressable ${filterCategory && filterCategory !== 'all' ? 'text-neu-blue' : 'text-neu-text-secondary'}`}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(true)}
        >
          <Filter size={12} />
          Filter
        </motion.button>
      </motion.div>

      {/* List */}
      {sessionsLoading ? (
        <div className="mt-3">
          <SkeletonList rows={5} />
        </div>
      ) : filteredSessions.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 neu-raised-circle flex items-center justify-center mb-4">
            <Calendar size={24} className="text-neu-text-tertiary" />
          </div>
          <p className="text-sm font-bold text-neu-text-secondary">No workouts this month</p>
          <p className="text-xs text-neu-text-tertiary mt-1">Complete a workout to see it here</p>
          <NeuButton
            variant="accent"
            accent="blue"
            size="sm"
            onClick={() => navigate('/workouts')}
            className="mt-4"
          >
            Browse Workouts
          </NeuButton>
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col gap-3 mt-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredSessions.map((session) => (
            <DiaryEntry
              key={session.id}
              session={session}
              onTap={() => {}}
            />
          ))}
        </motion.div>
      )}

      {/* Filter bottom sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter by Type"
        dragHandle
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterCategory(cat)}
              >
                <span
                  className={`
                    text-xs font-semibold px-3 py-1.5 rounded-full capitalize
                    ${filterCategory === cat
                      ? 'bg-neu-blue text-white'
                      : 'neu-flat text-neu-text-secondary'
                    }
                  `}
                  style={
                    filterCategory === cat
                      ? {
                          background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)',
                          boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
                        }
                      : undefined
                  }
                >
                  {cat}
                </span>
              </motion.button>
            ))}
          </div>
          <NeuButton
            variant="accent"
            accent="blue"
            size="md"
            fullWidth
            onClick={() => setShowFilters(false)}
          >
            Apply
          </NeuButton>
        </div>
      </BottomSheet>
    </div>
  );
};

export default DiaryPage;
