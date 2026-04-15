/* ===== Time Formatting ===== */

/** Format seconds into MM:SS or HH:MM:SS */
export function formatTime(totalSeconds: number, showHours = false): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  if (showHours || h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Format seconds into human-readable duration like "1h 30m" or "45m 20s" */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && h === 0) parts.push(`${s}s`);

  return parts.length > 0 ? parts.join(' ') : '0s';
}

/** Format seconds into short duration like "1:30" meaning 1h 30m */
export function formatDurationShort(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}`;
  }
  return `${m} min`;
}

/** Format minutes into "Xh Ym" display */
export function formatMinutesShort(minutes: number): string {
  if (minutes < 0) minutes = 0;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/* ===== Number Formatting ===== */

/** Format number with commas: 14233 → "14,233" */
export function formatNumber(num: number): string {
  if (num == null || isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

/** Format number with K/M suffix for large numbers */
export function formatCompact(num: number): string {
  if (num == null || isNaN(num)) return '0';
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(Math.round(num));
}

/** Format calories with unit */
export function formatCalories(cal: number): string {
  return `${formatNumber(Math.round(cal))} kcal`;
}

/** Format percentage without decimals */
export function formatPercent(value: number): string {
  if (value == null || isNaN(value)) return '0%';
  return `${Math.round(value)}%`;
}

/** Format weight with unit */
export function formatWeight(kg: number, isImperial: boolean = false): string {
  if (isImperial) {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${kg} kg`;
}

/** Format distance */
export function formatDistance(km: number, isImperial: boolean = false): string {
  if (isImperial) {
    const miles = kmToMiles(km);
    return `${miles.toFixed(2)} mi`;
  }
  return `${km.toFixed(2)} km`;
}

/** Format steps */
export function formatSteps(steps: number): string {
  return formatNumber(Math.round(steps));
}

/** Format heart rate */
export function formatHeartRate(bpm: number): string {
  return `${Math.round(bpm)} bpm`;
}

/** Format reps */
export function formatReps(reps: number): string {
  return `${reps} reps`;
}

/** Format sets × reps */
export function formatSetsReps(sets: number, reps?: number, duration?: number): string {
  if (duration) {
    return `${sets}set × ${formatTime(duration)}`;
  }
  if (reps) {
    return `${sets}set × ${reps}rep`;
  }
  return `${sets} sets`;
}

/* ===== Unit conversion formatting helpers ===== */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371 * 100) / 100;
}

/* ===== Text Formatting ===== */

/** Capitalize first letter */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Title case: "hello world" → "Hello World" */
export function titleCase(str: string): string {
  if (!str) return '';
  return str
    .split(/[\s_-]+/)
    .map((word) => capitalize(word))
    .join(' ');
}

/** Truncate text with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/** Replace underscores and hyphens with spaces */
export function humanize(str: string): string {
  return str
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
