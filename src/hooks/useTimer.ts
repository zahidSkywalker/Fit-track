import { useRef, useState, useCallback, useEffect } from 'react';
import { TimerState } from '@/types/common';

/* ===== Timer Hook Interface ===== */
interface UseTimerOptions {
  /** Starting seconds (0 for count-up) */
  initialSeconds?: number;
  /** If true, timer counts down from initialSeconds. If false, counts up from 0. */
  isCountdown?: boolean;
  /** Called every second tick */
  onTick?: (elapsed: number) => void;
  /** Called when countdown reaches 0 */
  onFinish?: () => void;
  /** Auto-start on mount */
  autoStart?: boolean;
  /** Update interval in ms (default 1000) */
  intervalMs?: number;
}

interface UseTimerReturn {
  /** Current elapsed/remaining seconds */
  seconds: number;
  /** Timer state */
  state: TimerState;
  /** Start or resume the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Reset and optionally set new initial seconds */
  resetTo: (newSeconds?: number) => void;
  /** Add seconds (negative to subtract) */
  adjust: (deltaSeconds: number) => void;
  /** Formatted time string MM:SS */
  display: string;
  /** Formatted time string HH:MM:SS */
  displayLong: string;
}

/**
 * A versatile timer hook supporting count-up and count-down modes.
 * Uses requestAnimationFrame-aligned intervals for accuracy.
 */
export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const {
    initialSeconds = 0,
    isCountdown = false,
    onTick,
    onFinish,
    autoStart = false,
    intervalMs = 1000,
  } = options;

  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [state, setState] = useState<TimerState>(
    autoStart ? TimerState.RUNNING : TimerState.IDLE
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const onTickRef = useRef(onTick);
  const onFinishRef = useRef(onFinish);
  const initialSecondsRef = useRef(initialSeconds);

  // Keep callback refs current without re-creating interval
  onTickRef.current = onTick;
  onFinishRef.current = onFinish;
  initialSecondsRef.current = initialSeconds;

  // Clear interval helper
  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Format helpers
  const getDisplay = useCallback((sec: number): string => {
    const m = Math.floor(Math.abs(sec) / 60);
    const s = Math.floor(Math.abs(sec) % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  const getDisplayLong = useCallback((sec: number): string => {
    const h = Math.floor(Math.abs(sec) / 3600);
    const m = Math.floor((Math.abs(sec) % 3600) / 60);
    const s = Math.floor(Math.abs(sec) % 60);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  // Start the timer
  const start = useCallback(() => {
    clearTimerInterval();

    if (state === TimerState.IDLE) {
      accumulatedRef.current = 0;
    }

    startTimeRef.current = Date.now();
    setState(TimerState.RUNNING);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = (now - startTimeRef.current) / 1000;
      const totalAccumulated = accumulatedRef.current + delta;

      if (isCountdown) {
        const remaining = Math.max(0, initialSecondsRef.current - totalAccumulated);
        setSeconds(remaining);
        onTickRef.current?.(remaining);

        if (remaining <= 0) {
          clearTimerInterval();
          accumulatedRef.current = initialSecondsRef.current;
          setState(TimerState.FINISHED);
          onFinishRef.current?.();
        }
      } else {
        setSeconds(totalAccumulated);
        onTickRef.current?.(totalAccumulated);
      }
    }, intervalMs);
  }, [clearTimerInterval, intervalMs, isCountdown, state]);

  // Pause the timer
  const pause = useCallback(() => {
    if (state !== TimerState.RUNNING) return;

    const now = Date.now();
    const delta = (now - startTimeRef.current) / 1000;
    accumulatedRef.current += delta;

    clearTimerInterval();
    setState(TimerState.PAUSED);
    setSeconds(
      isCountdown
        ? Math.max(0, initialSecondsRef.current - accumulatedRef.current)
        : accumulatedRef.current
    );
  }, [clearTimerInterval, isCountdown, state]);

  // Reset the timer
  const reset = useCallback(() => {
    clearTimerInterval();
    accumulatedRef.current = 0;
    startTimeRef.current = 0;
    setSeconds(initialSecondsRef.current);
    setState(TimerState.IDLE);
  }, [clearTimerInterval]);

  // Reset to a new value
  const resetTo = useCallback(
    (newSeconds?: number) => {
      clearTimerInterval();
      if (newSeconds !== undefined) {
        initialSecondsRef.current = newSeconds;
      }
      accumulatedRef.current = 0;
      startTimeRef.current = 0;
      setSeconds(initialSecondsRef.current);
      setState(TimerState.IDLE);
    },
    [clearTimerInterval]
  );

  // Adjust seconds
  const adjust = useCallback(
    (deltaSeconds: number) => {
      if (isCountdown) {
        const newRemaining = Math.max(0, seconds + deltaSeconds);
        setSeconds(newRemaining);
        // Also adjust the accumulated reference
        accumulatedRef.current =
          initialSecondsRef.current - newRemaining;
      } else {
        const newElapsed = Math.max(0, seconds + deltaSeconds);
        setSeconds(newElapsed);
        accumulatedRef.current = newElapsed;
      }
    },
    [isCountdown, seconds]
  );

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      clearTimerInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    seconds,
    state,
    start,
    pause,
    reset,
    resetTo,
    adjust,
    display: getDisplay(seconds),
    displayLong: getDisplayLong(seconds),
  };
}
