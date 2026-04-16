import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  /** Progress value 0-100 */
  percent: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Ring background color (track) */
  trackColor?: string;
  /** Ring progress color */
  color?: string;
  /** Secondary ring color (for gradient-like dual color effect) */
  colorEnd?: string;
  /** Content rendered inside the ring */
  children?: React.ReactNode;
  /** Rotation offset in degrees (default -90 for top-start) */
  rotation?: number;
  /** Animate on mount */
  animate?: boolean;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** CSS class for the wrapper */
  className?: string;
  /** Line cap style */
  lineCap?: 'round' | 'butt' | 'square';
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percent,
  size = 120,
  strokeWidth = 10,
  trackColor = 'rgba(200, 191, 181, 0.3)',
  color = '#7BA7CC',
  colorEnd,
  rotation = -90,
  children,
  animate = true,
  animationDuration = 1,
  className = '',
  lineCap = 'round',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clampedPercent / 100) * circumference;

  const gradientId = useRef(`ring-grad-${Math.random().toString(36).slice(2, 8)}`);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <defs>
          {colorEnd && (
            <linearGradient
              id={gradientId.current}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
          )}
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorEnd ? `url(#${gradientId.current})` : color}
          strokeWidth={strokeWidth}
          strokeLinecap={lineCap}
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: animationDuration,
            ease: 'easeOut',
            delay: 0.2,
          }}
        />
      </svg>

      {/* Center content */}
      {children && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

/* ===== Compact Ring with built-in text ===== */
interface ProgressRingWithLabelProps extends Omit<ProgressRingProps, 'children'> {
  /** Label text below the value */
  label?: string;
  /** Value display format */
  valueDisplay?: string;
  /** Value text size class */
  valueSize?: 'sm' | 'md' | 'lg';
  /** Value text color */
  valueColor?: string;
}

export const ProgressRingWithLabel: React.FC<ProgressRingWithLabelProps> = ({
  label,
  valueDisplay,
  valueSize = 'md',
  valueColor,
  percent,
  ...ringProps
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <ProgressRing percent={percent} {...ringProps}>
      <div className="flex flex-col items-center justify-center text-center px-1">
        {valueDisplay !== undefined ? (
          <span
            className={`${sizeClasses[valueSize]} font-extrabold leading-tight`}
            style={{ color: valueColor || ringProps.color || '#4A4240' }}
          >
            {valueDisplay}
          </span>
        ) : (
          <span
            className={`${sizeClasses[valueSize]} font-extrabold leading-tight`}
            style={{ color: valueColor || ringProps.color || '#4A4240' }}
          >
            {Math.round(percent)}%
          </span>
        )}
        {label && (
          <span className="text-[10px] text-neu-text-secondary font-medium mt-0.5 leading-tight">
            {label}
          </span>
        )}
      </div>
    </ProgressRing>
  );
};
