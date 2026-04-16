import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  /** Progress value 0-100 */
  percent: number;
  /** Bar height in pixels */
  height?: number;
  /** Track background color */
  trackColor?: string;
  /** Fill color */
  color?: string;
  /** Secondary color for gradient end */
  colorEnd?: string;
  /** Show percentage text */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'right' | 'inside' | 'above';
  /** Animate on mount */
  animate?: boolean;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Border radius override */
  borderRadius?: number;
  /** Additional CSS class */
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  height = 8,
  trackColor = 'rgba(200, 191, 181, 0.3)',
  color = '#7BA7CC',
  colorEnd,
  showLabel = false,
  labelPosition = 'right',
  animate = true,
  animationDuration = 0.8,
  borderRadius,
  className = '',
}) => {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const radius = borderRadius ?? height / 2;

  const fillStyle: React.CSSProperties = colorEnd
    ? {
        background: `linear-gradient(90deg, ${color}, ${colorEnd})`,
      }
    : { backgroundColor: color };

  const labelElement = showLabel && (
    <span className="text-xs font-bold text-neu-text-secondary ml-2 tabular-nums">
      {Math.round(clampedPercent)}%
    </span>
  );

  return (
    <div
      className={`flex items-center w-full ${className}`}
    >
      {showLabel && labelPosition === 'above' && (
        <div className="w-full flex justify-between mb-1">
          <span />
          <span className="text-xs font-bold text-neu-text-secondary tabular-nums">
            {Math.round(clampedPercent)}%
          </span>
        </div>
      )}

      <div className="relative flex-1">
        {/* Track */}
        <div
          className="w-full overflow-hidden"
          style={{
            height,
            backgroundColor: trackColor,
            borderRadius: radius,
          }}
        >
          {/* Fill */}
          <motion.div
            className="h-full"
            style={{
              ...fillStyle,
              borderRadius: radius,
              minWidth: clampedPercent > 0 ? 4 : 0,
            }}
            initial={animate ? { width: 0 } : undefined}
            animate={{ width: `${clampedPercent}%` }}
            transition={{
              duration: animationDuration,
              ease: 'easeOut',
              delay: 0.1,
            }}
          />
        </div>

        {/* Inside label */}
        {showLabel && labelPosition === 'inside' && clampedPercent > 15 && (
          <div className="absolute inset-0 flex items-center justify-end pr-2">
            <span className="text-[10px] font-bold text-white tabular-nums drop-shadow-sm">
              {Math.round(clampedPercent)}%
            </span>
          </div>
        )}
      </div>

      {showLabel && labelPosition === 'right' && labelElement}
    </div>
  );
};

/* ===== Segmented Progress Bar (for multi-step) ===== */
interface SegmentedProgressBarProps {
  /** Total number of segments */
  total: number;
  /** Current active segment (1-indexed) */
  current: number;
  /** Completed segments count */
  completed?: number;
  /** Segment height */
  height?: number;
  /** Active segment color */
  color?: string;
  /** Completed segment color */
  completedColor?: string;
  className?: string;
}

export const SegmentedProgressBar: React.FC<SegmentedProgressBarProps> = ({
  total,
  current,
  completed,
  height = 6,
  color = '#7BA7CC',
  completedColor = '#8ECDA8',
  className = '',
}) => {
  const completedCount = completed ?? current - 1;

  return (
    <div className={`flex gap-1.5 w-full ${className}`}>
      {Array.from({ length: total }, (_, i) => {
        const index = i + 1;
        const isCompleted = index <= completedCount;
        const isActive = index === current && !isCompleted;
        const isFuture = index > current;

        return (
          <div
            key={i}
            className="flex-1 rounded-full overflow-hidden"
            style={{ height, backgroundColor: 'rgba(200, 191, 181, 0.25)' }}
          >
            {(isCompleted || isActive) && (
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: isCompleted ? completedColor : color,
                }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
