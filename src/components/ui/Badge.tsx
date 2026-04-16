import React from 'react';

type BadgeVariant = 'filled' | 'outline' | 'soft';
type BadgeAccent = 'blue' | 'peach' | 'green' | 'red' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  accent?: BadgeAccent;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const accentColors: Record<BadgeAccent, { main: string; bg: string; border: string }> = {
  blue: { main: '#7BA7CC', bg: 'rgba(123, 167, 204, 0.15)', border: 'rgba(123, 167, 204, 0.3)' },
  peach: { main: '#E8A87C', bg: 'rgba(232, 168, 124, 0.15)', border: 'rgba(232, 168, 124, 0.3)' },
  green: { main: '#8ECDA8', bg: 'rgba(142, 205, 168, 0.15)', border: 'rgba(142, 205, 168, 0.3)' },
  red: { main: '#D4756B', bg: 'rgba(212, 117, 107, 0.15)', border: 'rgba(212, 117, 107, 0.3)' },
  gray: { main: '#8A807A', bg: 'rgba(138, 128, 122, 0.15)', border: 'rgba(138, 128, 122, 0.3)' },
};

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'soft',
  accent = 'blue',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const colors = accentColors[accent];

  const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    filled: {
      backgroundColor: colors.main,
      color: '#FFFFFF',
    },
    soft: {
      backgroundColor: colors.bg,
      color: colors.main,
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.main,
      border: `1px solid ${colors.border}`,
    },
  };

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap',
        sizeClasses[size],
        className,
      ].join(' ')}
      style={variantStyles[variant]}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: variant === 'filled' ? '#FFFFFF' : colors.main }}
        />
      )}
      {children}
    </span>
  );
};

/* ===== Difficulty Badge ===== */
interface DifficultyBadgeProps {
  difficulty: string;
  size?: 'sm' | 'md';
}

const DIFFICULTY_MAP: Record<string, BadgeAccent> = {
  beginner: 'green',
  intermediate: 'blue',
  advanced: 'peach',
  expert: 'red',
};

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty, size }) => (
  <Badge accent={DIFFICULTY_MAP[difficulty] || 'gray'} variant="soft" size={size}>
    {difficulty}
  </Badge>
);

/* ===== Category Badge ===== */
interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

const CATEGORY_MAP: Record<string, BadgeAccent> = {
  Strength: 'peach',
  Cardio: 'blue',
  HIIT: 'red',
  Calisthenics: 'green',
  Flexibility: 'green',
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size }) => (
  <Badge accent={CATEGORY_MAP[category] || 'gray'} variant="soft" size={size}>
    {category}
  </Badge>
);

/* ===== Intensity Badge ===== */
interface IntensityBadgeProps {
  intensity: string;
  size?: 'sm' | 'md';
}

const INTENSITY_MAP: Record<string, BadgeAccent> = {
  light: 'green',
  moderate: 'blue',
  hard: 'peach',
  extreme: 'red',
};

export const IntensityBadge: React.FC<IntensityBadgeProps> = ({ intensity, size }) => (
  <Badge accent={INTENSITY_MAP[intensity] || 'gray'} variant="soft" size={size}>
    {intensity}
  </Badge>
);
