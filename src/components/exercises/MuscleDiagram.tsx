import React from 'react';
import { motion } from 'framer-motion';

interface MuscleDiagramProps {
  highlightedMuscles: string[];
  size?: number;
  className?: string;
}

/*
 * Simplified SVG muscle diagram showing front-view human figure silhouette.
 * Highlighted muscles glow with accent color.
 * This is a pure SVG implementation — no images needed.
 */

const MUSCLE_PATHS: Record<string, string> = {
  // Shoulders
  leftShoulder: 'M 72 62 Q 60 50 50 42 Q 40 38 42 28 L 58 28 Q 68 30 72 38 Z',
  rightShoulder: 'M 128 62 Q 140 50 150 42 Q 160 38 158 28 L 142 28 Q 132 30 128 38 Z',

  // Chest
  leftChest: 'M 72 42 Q 68 60 70 52 L 70 72 Q 72 80 80 80 L 100 80 Q 102 80 102 72 L 102 52 Q 102 44 100 42 Z',
  rightChest: 'M 128 42 Q 132 60 130 52 L 130 72 Q 128 80 120 80 L 100 80 Q 98 80 98 72 L 98 52 Q 98 44 100 42 Z',

  // Back
  leftBack: 'M 72 82 Q 60 90 58 100 L 58 140 Q 60 150 72 150 Q 80 150 80 140 L 100 140 Q 102 150 100 150 L 100 100 Q 102 90 100 82 Z',
  rightBack: 'M 128 82 Q 140 90 142 100 L 142 140 Q 140 150 128 150 Q 120 150 120 140 L 100 140 Q 98 150 100 150 L 100 100 Q 98 90 100 82 Z',

  // Biceps
  leftBicep: 'M 68 48 Q 56 50 54 60 L 52 90 Q 52 100 60 100 Q 66 100 68 90 Z',
  rightBicep: 'M 132 48 Q 144 50 146 60 L 148 90 Q 148 100 140 100 Q 134 100 132 90 Z',

  // Triceps
  leftTricep: 'M 78 42 Q 72 38 74 34 L 74 70 Q 74 78 80 78 L 96 78 Q 98 78 96 70 Z',
  rightTricep: 'M 122 42 Q 128 38 126 34 L 126 70 Q 126 78 120 78 L 104 78 Q 102 78 104 70 Z',

  // Abs / Core
  core: 'M 82 100 L 82 150 Q 84 160 88 160 L 112 160 Q 116 160 118 150 L 118 100 Q 116 90 112 90 L 88 90 Q 84 90 82 100 Z',

  // Upper Legs / Quads
  leftQuad: 'M 74 150 Q 62 155 60 170 L 58 210 Q 60 225 74 225 Q 85 225 88 210 L 88 170 Q 86 155 74 150 Z',
  rightQuad: 'M 126 150 Q 138 155 140 170 L 142 210 Q 140 225 126 225 Q 115 225 112 210 L 112 170 Q 114 155 126 150 Z',

  // Lower Legs / Calves
  leftCalf: 'M 62 225 Q 54 230 52 245 L 50 280 Q 52 295 62 295 Q 70 295 72 280 L 74 245 Q 72 230 62 225 Z',
  rightCalf: 'M 138 225 Q 146 230 148 245 L 150 280 Q 148 295 138 295 Q 130 295 128 280 L 126 245 Q 128 230 138 225 Z',

  // Glutes
  leftGlute: 'M 68 155 Q 54 160 52 175 L 50 210 Q 52 225 68 225 Q 78 220 80 210 L 80 175 Q 78 160 68 155 Z',
  rightGlute: 'M 132 155 Q 146 160 148 175 L 150 210 Q 148 225 132 225 Q 122 220 120 210 L 120 175 Q 122 160 132 155 Z',
};

const HIGHLIGHT_COLORS: Record<string, string> = {
  shoulders: '#7BA7CC',
  back: '#7BA7CC',
  chest: '#E8A87C',
  biceps: '#E8A87C',
  triceps: '#E8A87C',
  core: '#D4756B',
  legs: '#8ECDA8',
  glutes: '#8ECDA8',
  full_body: '#7BA7CC',
};

/* Map each SVG path ID to its muscle group category */
const PATH_TO_MUSCLE: Record<string, string> = {
  leftShoulder: 'shoulders',
  rightShoulder: 'shoulders',
  leftChest: 'chest',
  rightChest: 'chest',
  leftBack: 'back',
  rightBack: 'back',
  leftBicep: 'biceps',
  rightBicep: 'biceps',
  leftTricep: 'triceps',
  rightTricep: 'triceps',
  core: 'core',
  leftQuad: 'legs',
  rightQuad: 'legs',
  leftCalf: 'legs',
  rightCalf: 'legs',
  leftGlute: 'glutes',
  rightGlute: 'glutes',
};

/* Map muscle group to its SVG path IDs */
const MUSCLE_TO_PATHS: Record<string, string[]> = {
  shoulders: ['leftShoulder', 'rightShoulder'],
  chest: ['leftChest', 'rightChest'],
  back: ['leftBack', 'rightBack'],
  biceps: ['leftBicep', 'rightBicep'],
  triceps: ['leftTricep', 'rightTricep'],
  core: ['core'],
  legs: ['leftQuad', 'rightQuad', 'leftCalf', 'rightCalf'],
  glutes: ['leftGlute', 'rightGlute'],
  full_body: Object.keys(MUSCLE_PATHS),
};

export const MuscleDiagram: React.FC<MuscleDiagramProps> = ({
  highlightedMuscles = [],
  size = 200,
  className = '',
}) => {
  const allPathIds = Object.keys(MUSCLE_PATHS);
  const activeColors = new Set<string>();

  highlightedMuscles.forEach((muscle) => {
    const paths = MUSCLE_TO_PATHS[muscle];
    if (paths) {
      const color = HIGHLIGHT_COLORS[muscle] || '#7BA7CC';
      paths.forEach((p) => activeColors.add(`${p}:${color}`));
    }
  });

  const getPathStyle = (pathId: string): React.CSSProperties => {
    const defaultStyle: React.CSSProperties = {
      fill: 'rgba(200, 191, 181, 0.12)',
      stroke: 'rgba(200, 191, 181, 0.3)',
      strokeWidth: 0.5,
    };

    for (const [id, color] of activeColors) {
      if (id === pathId) {
        return {
          fill: `${color}30`,
          stroke: color,
          strokeWidth: 1.2,
        };
      }
    }

    return defaultStyle;
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.svg
        width={size}
        height={size * 1.5}
        viewBox="0 0 200 300"
        fill="none"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Body outline silhouette */}
        <ellipse cx="100" cy="40" rx="24" ry="12" fill="rgba(200,191,181,0.08)" stroke="none" />
        <ellipse cx="100" cy="300" rx="22" ry="10" fill="rgba(200,191,181,0.08)" stroke="none" />

        {/* Torso outline */}
        <rect x="80" y="42" width="40" height="108" rx="12" fill="none" stroke="rgba(200,191,181,0.2)" strokeWidth="0.5" />

        {/* Muscle groups */}
        {allPathIds.map((pathId) => (
          <motion.path
            key={pathId}
            d={MUSCLE_PATHS[pathId]}
            initial={false}
            animate={true}
            style={getPathStyle(pathId)}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ))}

        {/* Center line for symmetry reference */}
        <line x1="100" y1="30" x2="100" y2="295" stroke="none" strokeWidth="0" />

        {/* Labels for highlighted muscles */}
        {highlightedMuscles.length > 0 && (
          <>
            {/* Shoulders label */}
            {highlightedMuscles.includes('shoulders') && (
              <motion.text
                x="100" y="55"
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill={HIGHLIGHT_COLORS.shoulders}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.3 }}
              >
                Shoulders
              </motion.text>
            )}
            {/* Chest label */}
            {highlightedMuscles.includes('chest') && (
              <motion.text
                x="100" y="75"
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill={HIGHLIGHT_COLORS.chest}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.4 }}
              >
                Chest
              </motion.text>
            )}
            {/* Core label */}
            {highlightedMuscles.includes('core') && (
              <motion.text
                x="100" y="135"
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill={HIGHLIGHT_COLORS.core}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.5 }}
              >
                Core
              </motion.text>
            )}
            {/* Legs label */}
            {highlightedMuscles.includes('legs') && (
              <motion.text
                x="100" y="200"
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill={HIGHLIGHT_COLORS.legs}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.6 }}
              >
                Legs
              </motion.text>
            )}
          </>
        )}
      </motion.svg>
    </div>
  );
};
