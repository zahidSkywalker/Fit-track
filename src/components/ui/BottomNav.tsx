import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Activity, Dumbbell, BookOpen, User } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: <Home size={22} strokeWidth={2} /> },
  { path: '/activity', label: 'Activity', icon: <Activity size={22} strokeWidth={2} /> },
  { path: '/workouts', label: 'Workouts', icon: <Dumbbell size={22} strokeWidth={2} /> },
  { path: '/diary', label: 'Diary', icon: <BookOpen size={22} strokeWidth={2} /> },
  { path: '/profile', label: 'Profile', icon: <User size={22} strokeWidth={2} /> },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active index
  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.path);
  });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-neu-bg border-t border-neu-bg-dark/20"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        boxShadow: '0 -4px 12px rgba(200, 191, 181, 0.15)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-0.5"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon */}
              <motion.span
                className="relative flex items-center justify-center"
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
              >
                {/* Background pill for active state */}
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-neu-blue-tint"
                    layoutId="nav-pill"
                    style={{ width: 40, height: 32 }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}

                <span
                  className="relative z-10 transition-colors duration-200"
                  style={{
                    color: isActive ? '#7BA7CC' : '#B0A8A2',
                  }}
                >
                  {item.icon}
                </span>
              </motion.span>

              {/* Label */}
              <span
                className="text-[10px] font-semibold transition-colors duration-200"
                style={{
                  color: isActive ? '#7BA7CC' : '#B0A8A2',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
