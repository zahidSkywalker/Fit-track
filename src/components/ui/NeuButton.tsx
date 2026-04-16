import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'raised' | 'pressed' | 'flat' | 'accent' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface NeuButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  accent?: 'blue' | 'peach' | 'green' | 'red';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const variantClasses: Record<ButtonVariant, string> = {
  raised: 'neu-raised-sm neu-pressable',
  pressed: 'neu-pressed-sm',
  flat: 'neu-flat neu-pressable',
  accent: '',
  ghost: 'hover:bg-neu-bg-dark/10 rounded-neu-sm transition-colors',
};

const accentClasses: Record<string, string> = {
  blue: 'neu-accent-blue text-white',
  peach: 'neu-accent-peach text-white',
  green: 'neu-accent-green text-white',
  red: 'neu-accent-red text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
  icon: 'p-2.5',
};

export const NeuButton: React.FC<NeuButtonProps> = ({
  variant = 'raised',
  size = 'md',
  children,
  accent,
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  className = '',
  ...motionProps
}) => {
  const isDisabled = disabled || loading;
  const isAccent = variant === 'accent';

  const classes = [
    'inline-flex items-center justify-center font-semibold select-none',
    'transition-all duration-150',
    variantClasses[variant],
    isAccent && accent ? accentClasses[accent] : '',
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    !isAccent && !isDisabled ? 'text-neu-text' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconElement = icon && (
    <span className={size === 'icon' ? '' : 'flex-shrink-0'}>{icon}</span>
  );

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={isDisabled ? undefined : onClick}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      transition={{ duration: 0.15 }}
      disabled={isDisabled}
      {...motionProps}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          {size !== 'icon' && <span>Loading...</span>}
        </span>
      ) : (
        <>
          {iconPosition === 'left' && iconElement}
          {size !== 'icon' && <span>{children}</span>}
          {iconPosition === 'right' && iconElement}
        </>
      )}
    </motion.button>
  );
};

/* ===== Loading Spinner ===== */
const LoadingSpinner: React.FC<{ size: number; color?: string }> = ({
  size,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.2"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

/* ===== Preset Button Variants ===== */

export const NeuButtonAccent: React.FC<Omit<NeuButtonProps, 'variant'>> = (props) => (
  <NeuButton variant="accent" {...props} />
);

export const NeuButtonGhost: React.FC<Omit<NeuButtonProps, 'variant'>> = (props) => (
  <NeuButton variant="ghost" {...props} />
);

export const NeuButtonIcon: React.FC<Omit<NeuButtonProps, 'size'>> = (props) => (
  <NeuButton size="icon" variant="raised" {...props} />
);
