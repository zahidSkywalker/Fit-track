import { useCallback, useEffect, useRef, useState } from 'react';

/* ===== Rest Timer Hook Interface ===== */
interface UseRestTimerOptions {
  /** Default rest duration in seconds */
  defaultDuration: number;
  /** Called when rest finishes */
  onRestComplete?: () => void;
  /** Called each second with remaining time */
  onTick?: (remaining: number) => void;
}

interface UseRestTimerReturn {
  /** Remaining rest seconds */
  remaining: number;
  /** Total rest duration for this round */
  duration: number;
  /** Whether rest timer is currently active */
  isResting: boolean;
  /** Start a rest period (optionally with custom duration) */
  startRest: (overrideDuration?: number) => void;
  /** Skip the remaining rest */
  skipRest: () => void;
  /** Cancel rest without triggering onRestComplete */
  cancelRest: () => void;
  /** Formatted remaining time MM:SS */
  display: string;
  /** Progress 0-1 */
  progress: number;
}

/**
 * Rest timer hook for use between workout sets.
 * Manages auto-triggered rest periods with skip functionality.
 */
export function useRestTimer(options: UseRestTimerOptions): UseRestTimerReturn {
  const { defaultDuration, onRestComplete, onTick } = options;

  const [remaining, setRemaining] = useState<number>(0);
  const [duration, setDuration] = useState<number>(defaultDuration);
  const [isResting, setIsResting] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(defaultDuration);
  const onRestCompleteRef = useRef(onRestComplete);
  const onTickRef = useRef(onTick);

  // Keep callback refs fresh
  onRestCompleteRef.current = onRestComplete;
  onTickRef.current = onTick;

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const formatDisplay = (sec: number): string => {
    const m = Math.floor(Math.abs(sec) / 60);
    const s = Math.floor(Math.abs(sec) % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startRest = useCallback(
    (overrideDuration?: number) => {
      clearTimer();

      const dur = overrideDuration ?? defaultDuration;
      totalDurationRef.current = dur;
      setDuration(dur);
      setRemaining(dur);
      setIsResting(true);
      startTimeRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const left = Math.max(0, dur - elapsed);

        setRemaining(left);
        onTickRef.current?.(Math.ceil(left));

        if (left <= 0) {
          clearTimer();
          setIsResting(false);
          setRemaining(0);
          onRestCompleteRef.current?.();
        }
      }, 200); // Update 5x/sec for smooth countdown
    },
    [clearTimer, defaultDuration]
  );

  const skipRest = useCallback(() => {
    clearTimer();
    setIsResting(false);
    setRemaining(0);
    onRestCompleteRef.current?.();
  }, [clearTimer]);

  const cancelRest = useCallback(() => {
    clearTimer();
    setIsResting(false);
    setRemaining(0);
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const progress = duration > 0 ? 1 - remaining / duration : 0;

  return {
    remaining,
    duration,
    isResting,
    startRest,
    skipRest,
    cancelRest,
    display: formatDisplay(remaining),
    progress,
  };
}
