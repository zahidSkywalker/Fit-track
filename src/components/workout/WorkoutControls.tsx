import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Square, X } from 'lucide-react';

interface WorkoutControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSkipForward: () => void;
  onSkipBack: () => void;
  onStop: () => void;
  onCancel: () => void;
  exerciseIndex: number;
  totalExercises: number;
}

export const WorkoutControls: React.FC<WorkoutControlsProps> = ({
  isRunning,
  isPaused,
  onPlay,
  onPause,
  onSkipForward,
  onSkipBack,
  onStop,
  onCancel,
  exerciseIndex,
  totalExercises,
}) => {
  const isFirst = exerciseIndex === 0;
  const isLast = exerciseIndex === totalExercises - 1;

  return (
    <div className="flex items-center justify-between px-6 py-3">
      {/* Cancel */}
      <motion.button
        className="w-12 h-12 rounded-full flex items-center justify-center text-neu-text-tertiary neu-pressable"
        style={{ boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5', backgroundColor: '#E8E0D8' }}
        whileTap={{ scale: 0.9 }}
        onClick={onCancel}
      >
        <X size={18} />
      </motion.button>

      {/* Previous */}
      <motion.button
        className="w-12 h-12 rounded-full flex items-center justify-center neu-pressable"
        style={{
          boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
          backgroundColor: '#E8E0D8',
          opacity: isFirst ? 0.3 : 1,
          pointerEvents: isFirst ? 'none' : 'auto',
        }}
        whileTap={isFirst ? undefined : { scale: 0.9 }}
        onClick={onSkipBack}
      >
        <SkipBack size={18} className="text-neu-text-secondary" />
      </motion.button>

      {/* Play/Pause - Main button */}
      <motion.button
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: isRunning
            ? 'linear-gradient(145deg, #DD857B, #C5655B)'
            : 'linear-gradient(145deg, #8AB3D5, #6C99BD)',
          boxShadow: '5px 5px 10px #C8BFB5, -5px -5px 10px #F5EDE5',
        }}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.03 }}
        onClick={isRunning ? onPause : onPlay}
      >
        {isRunning ? (
          <Pause size={26} className="text-white" fill="white" />
        ) : (
          <Play size={26} className="text-white" fill="white" style={{ marginLeft: 2 }} />
        )}
      </motion.button>

      {/* Next / Finish */}
      <motion.button
        className="w-12 h-12 rounded-full flex items-center justify-center neu-pressable"
        style={{
          boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
          backgroundColor: isLast ? 'rgba(142, 205, 168, 0.3)' : '#E8E0D8',
        }}
        whileTap={{ scale: 0.9 }}
        onClick={onSkipForward}
      >
        {isLast ? (
          <Square size={16} className="text-neu-green" fill="rgba(142, 205, 168, 0.5)" />
        ) : (
          <SkipForward size={18} className="text-neu-text-secondary" />
        )}
      </motion.button>

      {/* Stop/Finish */}
      <motion.button
        className="w-12 h-12 rounded-full flex items-center justify-center text-neu-text-tertiary neu-pressable"
        style={{ boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5', backgroundColor: '#E8E0D8' }}
        whileTap={{ scale: 0.9 }}
        onClick={onStop}
      >
        <Square size={16} fill="currentColor" />
      </motion.button>
    </div>
  );
};
