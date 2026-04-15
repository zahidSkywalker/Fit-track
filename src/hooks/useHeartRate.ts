import { useCallback, useRef } from 'react';
import { estimateExerciseHeartRate, estimateMaxHeartRate, getHeartRateZones } from '@/utils/calculations';
import { Intensity } from '@/types/common';

/* ===== Heart Rate Tracker Hook Interface ===== */
interface UseHeartRateOptions {
  /** User age */
  age: number;
  /** Exercise intensity */
  intensity: Intensity;
  /** Update interval in seconds (default 3) */
  updateIntervalSec?: number;
  /** Called when HR updates */
  onUpdate?: (hr: number, zone: string) => void;
}

interface UseHeartRateReturn {
  /** Current estimated heart rate */
  heartRate: number;
  /** Current HR zone name */
  currentZone: string;
  /** Maximum estimated heart rate */
  maxHR: number;
  /** All HR zones */
  zones: ReturnType<typeof getHeartRateZones>;
  /** Get estimated HR for given elapsed minutes */
  getEstimate: (elapsedMinutes: number) => number;
  /** Reset tracking */
  reset: () => void;
}

/**
 * Estimated heart rate tracker hook.
 * Simulates realistic HR response during exercise using the Karvonen formula
 * with warmup ramp and slight random variation.
 * No sensor required — purely algorithmic estimation.
 */
export function useHeartRate(options: UseHeartRateOptions): UseHeartRateReturn {
  const { age, intensity, updateIntervalSec = 3, onUpdate } = options;

  const heartRateRef = useRef(65); // start at resting
  const maxHR = estimateMaxHeartRate(age);
  const zones = getHeartRateZones(age);
  const onUpdateRef = useRef(onUpdate);
  const lastUpdateRef = useRef(0);

  onUpdateRef.current = onUpdate;

  const getZoneName = useCallback(
    (hr: number): string => {
      for (const zone of zones) {
        if (hr >= zone.minBPM && hr <= zone.maxBPM) {
          return zone.name;
        }
      }
      if (hr < zones[0].minBPM) return 'Rest';
      return 'Max';
    },
    [zones]
  );

  const getEstimate = useCallback(
    (elapsedMinutes: number): number => {
      const hr = estimateExerciseHeartRate(age, intensity, elapsedMinutes);
      heartRateRef.current = hr;
      return hr;
    },
    [age, intensity]
  );

  /**
   * Tick function — call from timer onTick.
   * Only updates at the configured interval to avoid jitter.
   */
  const tick = useCallback(
    (elapsedSeconds: number): { hr: number; zone: string } => {
      const elapsedMin = elapsedSeconds / 60;
      const now = Date.now();

      // Throttle updates
      if (now - lastUpdateRef.current < updateIntervalSec * 1000) {
        return {
          hr: heartRateRef.current,
          zone: getZoneName(heartRateRef.current),
        };
      }

      lastUpdateRef.current = now;
      const hr = getEstimate(elapsedMin);
      const zone = getZoneName(hr);

      onUpdateRef.current?.(hr, zone);

      return { hr, zone };
    },
    [getEstimate, getZoneName, updateIntervalSec]
  );

  const reset = useCallback(() => {
    heartRateRef.current = 65;
    lastUpdateRef.current = 0;
  }, []);

  return {
    heartRate: heartRateRef.current,
    currentZone: getZoneName(heartRateRef.current),
    maxHR,
    zones,
    getEstimate,
    reset,
    // tick available internally
    ...({ tick } as unknown as Record<string, never>),
  };
}
