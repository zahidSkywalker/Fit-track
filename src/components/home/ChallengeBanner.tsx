import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Flame } from 'lucide-react';
import type { WorkoutPlan } from '@/types/workout';
import { staggerItem } from '@/animations/stagger';
import { DifficultyBadge, CategoryBadge } from '@/components/ui/Badge';
import { formatDurationShort } from '@/utils/formatters';

interface ChallengeBannerProps {
  plans: WorkoutPlan[];
  onTap: (plan: WorkoutPlan) => void;
}

export const ChallengeBanner: React.FC<ChallengeBannerProps> = ({
  plans,
  onTap,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.offsetWidth * 0.85;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(index);
  };

  return (
    <motion.div className="mt-5" variants={staggerItem}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-neu-peach" />
          <span className="text-sm font-bold text-neu-text">Challenge With Pro Coach</span>
        </div>
        <ChevronRight size={16} className="text-neu-text-tertiary" />
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar scroll-x pb-1"
        onScroll={handleScroll}
      >
        {plans.map((plan, index) => (
          <motion.button
            key={plan.id}
            className="flex-shrink-0 w-[85vw] max-w-[340px] rounded-neu-lg overflow-hidden text-left"
            style={{
              background: 'linear-gradient(135deg, #7BA7CC 0%, #5A8DB8 50%, #4A7DA8 100%)',
              boxShadow: '6px 6px 12px #C8BFB5, -6px -6px 12px #F5EDE5',
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTap(plan)}
            layout
          >
            <div className="p-4 flex flex-col justify-between h-full min-h-[120px]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-white/60 bg-white/15 px-2 py-0.5 rounded-full">
                    FEATURED
                  </span>
                  <DifficultyBadge
                    difficulty={plan.difficulty}
                    size="sm"
                  />
                </div>
                <h3 className="text-base font-extrabold text-white leading-tight">
                  {plan.name}
                </h3>
                <p className="text-[11px] text-white/70 mt-1 line-clamp-2 leading-snug">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-white/80 font-semibold">
                    🕐 {formatDurationShort(plan.estimatedDuration * 60)}
                  </span>
                  <span className="text-[11px] text-white/80 font-semibold">
                    {plan.exercises.length} exercises
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <ChevronRight size={14} className="text-white" />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Pagination dots */}
      {plans.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {plans.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                backgroundColor: i === activeIndex ? '#7BA7CC' : 'rgba(200, 191, 181, 0.5)',
              }}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
