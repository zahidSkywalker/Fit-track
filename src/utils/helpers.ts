/* ===== ID Generation ===== */
export function generateId(): string {
  return crypto.randomUUID();
}

/* ===== Debounce ===== */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ===== Throttle ===== */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

/* ===== Clamp ===== */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/* ===== Lerp (linear interpolation) ===== */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/* ===== Random Integer in Range ===== */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ===== Shuffle Array (Fisher-Yates) ===== */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/* ===== Pick Random Item ===== */
export function pickRandom<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/* ===== Group By ===== */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/* ===== Unique By ===== */
export function uniqueBy<T>(array: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ===== Array Chunking ===== */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/* ===== Safe JSON Parse ===== */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/* ===== Safe JSON Stringify ===== */
export function safeJsonStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}

/* ===== Sleep / Delay ===== */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ===== Copy to Clipboard ===== */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/* ===== Download JSON File ===== */
export function downloadJson(data: unknown, filename: string): void {
  const json = safeJsonStringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ===== Read JSON File ===== */
export function readJsonFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = safeJsonParse<T>(reader.result as string, {} as T);
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/* ===== Trigger Haptic Feedback (if available) ===== */
export function hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  try {
    if ('vibrate' in navigator) {
      const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
  } catch {
    // Silently fail — haptics not available
  }
}

/* ===== Check if Running as PWA ===== */
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/* ===== Check if Online ===== */
export function isOnline(): boolean {
  return navigator.onLine;
}

/* ===== Get OS ===== */
export function getOS(): 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'unknown' {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  if (/Win/i.test(ua)) return 'windows';
  if (/Mac/i.test(ua)) return 'mac';
  if (/Linux/i.test(ua)) return 'linux';
  return 'unknown';
}

/* ===== Get Safe Area Padding (CSS string) ===== */
export function getSafeAreaPadding(): string {
  const top = getComputedStyle(document.documentElement)
    .getPropertyValue('env(safe-area-inset-top)')
    .trim() || '0px';
  return `padding-top: ${top}`;
}

/* ===== Memoize (simple single-arg) ===== */
export function memoize<T extends (arg: string) => any>(fn: T): T {
  const cache = new Map<string, any>();
  return ((arg: string) => {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  }) as T;
}

/* ===== Pluralize ===== */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

/* ===== Empty Check ===== */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
