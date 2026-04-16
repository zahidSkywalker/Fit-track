import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  className = '',
}) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    }}
  />
);

/* ===== Pre-built skeleton layouts ===== */

export const SkeletonCard: React.FC = () => (
  <div className="neu-raised p-4 flex flex-col gap-3">
    <Skeleton width="60%" height={14} borderRadius={4} />
    <Skeleton width="100%" height={12} borderRadius={4} />
    <Skeleton width="80%" height={12} borderRadius={4} />
    <div className="flex gap-2 mt-1">
      <Skeleton width={60} height={24} borderRadius={12} />
      <Skeleton width={60} height={24} borderRadius={12} />
    </div>
  </div>
);

export const SkeletonStatCard: React.FC = () => (
  <div className="neu-raised-sm p-3 flex flex-col items-center gap-2">
    <Skeleton width={48} height={48} borderRadius={24} />
    <Skeleton width={40} height={16} borderRadius={4} />
    <Skeleton width={60} height={10} borderRadius={4} />
  </div>
);

export const SkeletonList: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="neu-raised-sm p-3 flex items-center gap-3">
        <Skeleton width={40} height={40} borderRadius={20} />
        <div className="flex-1 flex flex-col gap-1.5">
          <Skeleton width="70%" height={12} borderRadius={4} />
          <Skeleton width="50%" height={10} borderRadius={4} />
        </div>
        <Skeleton width={32} height={32} borderRadius={16} />
      </div>
    ))}
  </div>
);

export const SkeletonRing: React.FC = () => (
  <div className="neu-raised p-5 flex flex-col items-center gap-3">
    <Skeleton width={100} height={100} borderRadius={50} />
    <Skeleton width={60} height={12} borderRadius={4} />
  </div>
);
