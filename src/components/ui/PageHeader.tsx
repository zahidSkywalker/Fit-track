import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  backTo,
  onBack,
  rightAction,
  className = '',
  transparent = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.header
      className={[
        'sticky top-0 z-30 flex items-center gap-3 px-5 py-3',
        transparent
          ? 'bg-transparent'
          : 'bg-neu-bg/80 backdrop-blur-md border-b border-neu-bg-dark/10',
        className,
      ].join(' ')}
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))' }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Back button */}
      {showBack && (
        <motion.button
          onClick={handleBack}
          className="neu-raised-circle w-10 h-10 flex items-center justify-center flex-shrink-0 neu-pressable"
          whileTap={{ scale: 0.92 }}
          aria-label="Go back"
        >
          <ChevronLeft size={20} className="text-neu-text" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Title area */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-extrabold text-neu-text truncate leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-neu-text-secondary font-medium truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right action */}
      {rightAction && (
        <div className="flex-shrink-0">{rightAction}</div>
      )}
    </motion.header>
  );
};
