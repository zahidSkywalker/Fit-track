import React from 'react';
import { motion } from 'framer-motion';

interface NeuToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
  className?: string;
}

const trackSizes = {
  sm: { width: 40, height: 22, padding: 2, knob: 18 },
  md: { width: 52, height: 28, padding: 3, knob: 22 },
};

export const NeuToggle: React.FC<NeuToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  id,
  className = '',
}) => {
  const track = trackSizes[size];
  const knobPosition = checked
    ? track.width - track.knob - track.padding
    : track.padding;

  return (
    <label
      className={[
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
    >
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="relative flex-shrink-0"
        style={{
          width: track.width,
          height: track.height,
        }}
      >
        {/* Track */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: checked
              ? 'inset 2px 2px 4px #C8BFB5, inset -2px -2px 4px #F5EDE5'
              : '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
            background: checked
              ? 'linear-gradient(145deg, #8AB3D5, #6C99BD)'
              : '#E8E0D8',
          }}
          layout
          transition={{ duration: 0.2 }}
        />

        {/* Knob */}
        <motion.div
          className="absolute top-0 rounded-full bg-white"
          style={{
            width: track.knob,
            height: track.knob,
            boxShadow: '2px 2px 4px rgba(0,0,0,0.15)',
          }}
          animate={{ left: knobPosition, top: track.padding }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>

      {label && (
        <span className="text-sm text-neu-text font-medium">{label}</span>
      )}
    </label>
  );
};
