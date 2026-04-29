import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { formatMonthYear } from '@/utils/dateUtils';
import { staggerItem } from '@/animations/stagger';

interface GreetingCardProps {
  name: string;
  date: Date;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({ name, date }) => {
  const hour = date.getHours();
  let greeting: string;
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';
  else greeting = 'Good Evening';

  const firstName = name.split(' ')[0];

  return (
    <motion.div
      className="flex items-center justify-between"
      variants={staggerItem}
    >
      <div>
        <h1 className="text-2xl font-extrabold text-neu-text leading-tight">
          {greeting},{' '}
          <span className="text-neu-blue">{firstName}</span>
        </h1>
        <p className="text-xs text-neu-text-secondary font-medium mt-1">
          {formatMonthYear(date)}
        </p>
      </div>
      <motion.button
        className="neu-raised-circle w-10 h-10 flex items-center justify-center neu-pressable relative"
        whileTap={{ scale: 0.92 }}
        aria-label="Notifications"
      >
        <Bell size={18} className="text-neu-text-secondary" />
        {/* Notification dot (static for now) */}
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neu-red" />
      </motion.button>
    </motion.div>
  );
};
