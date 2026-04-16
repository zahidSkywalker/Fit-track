import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type NeuVariant = 'raised' | 'raised-sm' | 'raised-lg' | 'pressed' | 'pressed-sm' | 'pressed-lg' | 'flat' | 'none';

interface NeuCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: NeuVariant;
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  accent?: 'blue' | 'peach' | 'green' | 'red';
  accentBorder?: boolean;
  onClick?: () => void;
  layout?: boolean;
  animate?: boolean;
}

const variantClasses: Record<NeuVariant, string> = {
  'raised': 'neu-raised',
  'raised-sm': 'neu-raised-sm',
  'raised-lg': 'neu-raised-lg',
  'pressed': 'neu-pressed',
  'pressed-sm': 'neu-pressed-sm',
  'pressed-lg': 'neu-pressed-lg',
  'flat': 'neu-flat',
  'none': '',
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const accentBorderClasses = {
  blue: 'border-l-4 border-l-neu-blue',
  peach: 'border-l-4 border-l-neu-peach',
  green: 'border-l-4 border-l-neu-green',
  red: 'border-l-4 border-l-neu-red',
};

export const NeuCard: React.FC<NeuCardProps> = ({
  variant = 'raised',
  children,
  className = '',
  as = 'div',
  padding = 'md',
  accent,
  accentBorder = false,
  onClick,
  layout = false,
  animate = false,
  ...motionProps
}) => {
  const isClickable = !!onClick;

  const classes = [
    variantClasses[variant],
    paddingClasses[padding],
    accentBorder && accent ? accentBorderClasses[accent] : '',
    isClickable ? 'neu-pressable cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const motionComponent = as as 'div';

  if (animate || layout) {
    return (
      <motion.div
        className={classes}
        onClick={onClick}
        layout={layout}
        initial={animate ? { opacity: 0, y: 12 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={classes}
      onClick={onClick}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

/* ===== Preset Card Variants ===== */

/** Small info card with minimal padding */
export const NeuCardSm: React.FC<Omit<NeuCardProps, 'variant' | 'padding'>> = (props) => (
  <NeuCard variant="raised-sm" padding="sm" {...props} />
);

/** Large featured card */
export const NeuCardLg: React.FC<Omit<NeuCardProps, 'variant' | 'padding'>> = (props) => (
  <NeuCard variant="raised-lg" padding="lg" {...props} />
);

/** Pressed/inset card */
export const NeuCardInset: React.FC<Omit<NeuCardProps, 'variant'>> = (props) => (
  <NeuCard variant="pressed" {...props} />
);

/** Flat subtle card */
export const NeuCardFlat: React.FC<Omit<NeuCardProps, 'variant'>> = (props) => (
  <NeuCard variant="flat" {...props} />
);
