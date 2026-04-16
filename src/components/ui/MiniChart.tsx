import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

interface MiniChartProps {
  /** Data points */
  data: number[];
  /** Chart height in pixels */
  height?: number;
  /** Line/bar color */
  color?: string;
  /** Gradient end color (for fill) */
  colorEnd?: string;
  /** Type of chart */
  type?: 'line' | 'bar';
  /** Show dots on line chart */
  showDots?: boolean;
  /** Minimum value for scale */
  minVal?: number;
  /** Maximum value for scale */
  maxVal?: number;
  /** Bar gap ratio (0-1) */
  barGap?: number;
  /** Border radius for bars */
  barRadius?: number;
  /** Animate on mount */
  animate?: boolean;
  /** Additional class */
  className?: string;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  height = 60,
  color = '#7BA7CC',
  colorEnd,
  type = 'line',
  showDots = false,
  minVal,
  maxVal,
  barGap = 0.3,
  barRadius = 4,
  animate = true,
  className = '',
}) => {
  const chartRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-neu-text-tertiary text-xs ${className}`}
        style={{ height }}
      >
        No data
      </div>
    );
  }

  const actualMin = minVal ?? Math.min(...data, 0);
  const actualMax = maxVal ?? Math.max(...data, 1);
  const range = actualMax - actualMin || 1;

  const width = 200;
  const padding = { top: 4, bottom: 4, left: 0, right: 0 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const toY = (val: number) =>
    padding.top + chartH - ((val - actualMin) / range) * chartH;

  // GSAP animation for line chart
  useEffect(() => {
    if (!chartRef.current || !animate || type !== 'line') return;

    const path = chartRef.current.querySelector('.chart-line-path') as SVGPathElement | null;
    const fill = chartRef.current.querySelector('.chart-fill-path') as SVGPathElement | null;

    if (path) {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.3,
      });
    }

    if (fill) {
      gsap.set(fill, { opacity: 0 });
      gsap.to(fill, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.8,
      });
    }

    // Animate dots
    const dots = chartRef.current.querySelectorAll('.chart-dot');
    if (dots.length > 0) {
      gsap.set(dots, { scale: 0, opacity: 0 });
      gsap.to(dots, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: 'back.out(2)',
        delay: 1,
      });
    }
  }, [data, animate, type]);

  if (type === 'bar') {
    const barCount = data.length;
    const totalGapWidth = chartW * barGap;
    const gapSize = totalGapWidth / (barCount + 1);
    const barWidth = (chartW - totalGapWidth) / barCount;

    return (
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className={className}
      >
        {data.map((val, i) => {
          const x = padding.left + gapSize + i * (barWidth + gapSize);
          const barH = Math.max(2, ((val - actualMin) / range) * chartH);
          const y = padding.top + chartH - barH;

          return (
            <motion.rect
              key={i}
              x={x}
              y={animate ? padding.top + chartH : y}
              width={barWidth}
              height={animate ? 0 : barH}
              rx={barRadius}
              fill={colorEnd ? `url(#bar-grad-${className.replace(/\s/g, '')})` : color}
              initial={animate ? { height: 0, y: padding.top + chartH } : undefined}
              animate={{ height: barH, y }}
              transition={{
                duration: 0.5,
                delay: i * 0.05,
                ease: 'easeOut',
              }}
            />
          );
        })}

        {colorEnd && (
          <defs>
            <linearGradient
              id={`bar-grad-${className.replace(/\s/g, '')}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
          </defs>
        )}
      </svg>
    );
  }

  // Line chart
  const points = data.map((val, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: toY(val),
  }));

  const linePath =
    points.length > 1
      ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      : '';

  const fillPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
      : '';

  return (
    <svg
      ref={chartRef}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
    >
      <defs>
        {colorEnd && (
          <linearGradient id={`line-fill-${className.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colorEnd} stopOpacity="0.02" />
          </linearGradient>
        )}
      </defs>

      {/* Fill area */}
      {fillPath && (
        <path
          className="chart-fill-path"
          d={fillPath}
          fill={colorEnd ? `url(#line-fill-${className.replace(/\s/g, '')})` : `${color}15`}
        />
      )}

      {/* Line */}
      {linePath && (
        <path
          className="chart-line-path"
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Dots */}
      {showDots &&
        points.map((p, i) => (
          <circle
            key={i}
            className="chart-dot"
            cx={p.x}
            cy={p.y}
            r={3}
            fill="#E8E0D8"
            stroke={color}
            strokeWidth={2}
          />
        ))}

      {/* Single point fallback */}
      {points.length === 1 && (
        <circle cx={points[0].x} cy={points[0].y} r={4} fill={color} />
      )}
    </svg>
  );
};

/* ===== Sparkline (tiny inline chart) ===== */
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 80,
  height = 24,
  color = '#7BA7CC',
  className = '',
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
