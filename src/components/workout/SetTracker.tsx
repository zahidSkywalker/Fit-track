import React from 'react';
import { motion } from 'framer-motion';
import { Check, SkipForward, Minus, Plus } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/animations/stagger';
import { useToast } from '@/components/ui/Toast';
import { NeuButton, NeuButtonIcon } from '@/components/ui/NeuButton';
import { NeuInput } from '@/components/ui/NeuInput';
import { hapticFeedback } from '@/utils/helpers';
import type { SetRecord } from '@/types/workout';

interface SetTrackerProps {
  sets: SetRecord[];
  currentSetIndex: number;
  isTimed: boolean;
  onSetComplete: (reps?: number, duration?: number, weight?: number) => void;
  onSetSkip: () => void;
  targetReps?: number;
  targetDuration?: number;
}

export const SetTracker: React.FC<SetTrackerProps> = ({
  sets,
  currentSetIndex,
  isTimed,
  onSetComplete,
  onSetSkip,
  targetReps,
  targetDuration,
}) => {
  const [repInput, setRepInput] = useState(targetReps ? String(targetReps) : '');
  const [weightInput, setWeightInput] = useState('');
  const toast = useToast();

  const handleComplete = () => {
    if (!isTimed) {
      const reps = parseInt(repInput);
      if (!reps || reps <= 0) {
        toast.warning('Enter the number of reps you completed');
        return;
      }
      const weight = weightInput ? parseFloat(weightInput) : undefined;
      hapticFeedback('medium');
      onSetComplete(reps, undefined, weight);
      setRepInput(targetReps ? String(targetReps) : '');
      setWeightInput('');
    } else {
      hapticFeedback('medium');
      onSetComplete(undefined, targetDuration, undefined);
    }
  };

  const handleSkip = () => {
    hapticFeedback('light');
    onSetSkip();
  };

  const adjustReps = (delta: number) => {
    const current = parseInt(repInput) || 0;
    const next = Math.max(0, current + delta);
    setRepInput(String(next));
  };

  return (
    <motion.div
      className="flex flex-col gap-3 mt-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Set list */}
      <div className="flex flex-col gap-1.5">
        {sets.map((set, i) => {
          const isCurrent = i === currentSetIndex;
          const isDone = set.completed;
          const isSkipped = set.skipped;

          return (
            <motion.div
              key={i}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-neu-sm
                ${isCurrent ? 'neu-pressed-sm' : ''}
                ${isDone ? 'opacity-70' : ''}
                ${isSkipped ? 'opacity-40' : ''}
              `}
              variants={staggerItem}
              layout
            >
              {/* Set number */}
              <span
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0
                  ${isDone ? 'bg-neu-green-tint text-neu-green' : ''}
                  ${isSkipped ? 'bg-neu-bg-dark/15 text-neu-text-tertiary' : ''}
                  ${!isDone && !isSkipped && isCurrent ? 'bg-neu-blue-tint text-neu-blue' : ''}
                  ${!isDone && !isSkipped && !isCurrent ? 'bg-neu-bg-dark/10 text-neu-text-tertiary' : ''}
                `}
              >
                {isDone ? <Check size={12} /> : isSkipped ? <SkipForward size={12} /> : i + 1}
              </span>

              {/* Set info */}
              <div className="flex-1">
                {isTimed ? (
                  <span className="text-xs font-medium text-neu-text-secondary tabular-nums">
                    {isDone && set.duration ? `${set.duration}s` : `${targetDuration || 0}s`}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-neu-text-secondary tabular-nums">
                    {isDone && set.reps ? `${set.reps}` : targetReps || 0}
                    {set.weight ? ` × ${set.weight}kg` : ''}
                    {' reps'}
                  </span>
                )}
              </div>

              {/* Weight for completed sets */}
              {isDone && set.weight && (
                <span className="text-[10px] font-bold text-neu-peach tabular-nums">
                  {set.weight}kg
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Input controls for current set */}
      {!isTimed && (
        <motion.div className="flex items-center gap-2" variants={staggerItem}>
          <NeuButtonIcon
            onClick={() => adjustReps(-1)}
            icon={<Minus size={14} className="text-neu-text-secondary" />}
          />
          <div className="flex-1">
            <NeuInput
              variant="pressed"
              inputSize="sm"
              type="number"
              placeholder="Reps"
              value={repInput}
              onChange={(e) => setRepInput(e.target.value)}
              className="text-center"
            />
          </div>
          <NeuButtonIcon
            onClick={() => adjustReps(1)}
            icon={<Plus size={14} className="text-neu-text-secondary" />}
          />
        </motion.div>
      )}

      {/* Weight input (optional) */}
      {!isTimed && (
        <motion.div variants={staggerItem}>
          <NeuInput
            variant="pressed"
            inputSize="sm"
            type="number"
            placeholder="Weight (kg) — optional"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="3"/>
                <line x1="12" y1="22" x2="12" y2="8"/>
              </svg>
            }
          />
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div className="flex gap-3 mt-2" variants={staggerItem}>
        <NeuButtonGhost size="md" fullWidth onClick={handleSkip} icon={<SkipForward size={16} />}>
          Skip Set
        </NeuButtonGhost>
        <NeuButton
          variant="accent"
          accent="green"
          size="md"
          fullWidth
          onClick={handleComplete}
          icon={<Check size={16} />}
        >
          {isTimed ? 'Set Done' : 'Complete Set'}
        </NeuButton>
      </motion.div>
    </motion.div>
  );
};
