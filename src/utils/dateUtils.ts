import { WeekDay, WEEK_DAYS_ORDER } from '@/types/common';

/* ===== Date Formatting ===== */

/** Format date to "Feb 24" style */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}`;
}

/** Format date to "Feb 24, 2024" style */
export function formatDateMedium(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format date to "Sunday, February 24, 2024" style */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format to "2024-02-24" YYYY-MM-DD */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format month-year like "Feb 2025" */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Format time as "7:30 AM" */
export function formatTimeOfDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Format as "Feb 24, 7:30 AM" */
export function formatDateTime(date: Date | string): string {
  return `${formatDateMedium(date)} ${formatTimeOfDay(date)}`;
}

/* ===== Date Helpers ===== */

/** Get today as YYYY-MM-DD */
export function getTodayISO(): string {
  return formatDateISO(new Date());
}

/** Get the Monday of the current week */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  // getDay: 0=Sun, 1=Mon ... shift so Monday=0
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get the Sunday of the current week */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Get array of dates for the current week (Mon–Sun) */
export function getWeekDates(date: Date = new Date()): Date[] {
  const start = getWeekStart(date);
  return WEEK_DAYS_ORDER.map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** Get the WeekDay enum for a given date */
export function getWeekDay(date: Date): WeekDay {
  const day = date.getDay();
  // Map: 0(Sun)→'sun', 1(Mon)→'mon', ..., 6(Sat)→'sat'
  const map: Record<number, WeekDay> = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
  };
  return map[day];
}

/** Get array of all days in a month */
export function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let d = 1; d <= lastDay.getDate(); d++) {
    dates.push(new Date(year, month, d));
  }
  return dates;
}

/** Get first and last day of a month */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(year, month + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** Get last N days as YYYY-MM-DD strings */
export function getLastNDaysISO(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDateISO(d));
  }
  return dates;
}

/** Get last N weeks' Monday dates as YYYY-MM-DD strings */
export function getLastNWeeksISO(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    dates.push(formatDateISO(getWeekStart(d)));
  }
  return dates;
}

/* ===== Date Comparison ===== */

/** Check if two date strings are the same day */
export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return dateStr1.slice(0, 10) === dateStr2.slice(0, 10);
}

/** Check if date string is today */
export function isToday(dateStr: string): boolean {
  return isSameDay(dateStr, getTodayISO());
}

/** Check if a date is between two other dates (inclusive) */
export function isBetween(
  date: string,
  start: string,
  end: string
): boolean {
  return date >= start && date <= end;
}

/** Check if date is in the current week */
export function isThisWeek(dateStr: string): boolean {
  const weekStart = formatDateISO(getWeekStart());
  const weekEnd = formatDateISO(getWeekEnd());
  return isBetween(dateStr, weekStart, weekEnd);
}

/** Check if date is in the current month */
export function isThisMonth(dateStr: string, year?: number, month?: number): boolean {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const { start, end } = getMonthRange(y, m);
  return isBetween(dateStr, formatDateISO(start), formatDateISO(end));
}

/* ===== Relative Time ===== */

/** Get relative time string like "2 hours ago", "3 days ago" */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return formatDateMedium(d);
}

/** Get days difference between two dates */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/** Get days since a given date */
export function daysSince(date: Date | string): number {
  return daysBetween(date, new Date());
}

/* ===== Calendar Helpers ===== */

/** Get the day of week (0=Mon, 6=Sun) for the first of a month */
export function getFirstDayOfMonthOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert from 0=Sun to 0=Mon
  return day === 0 ? 6 : day - 1;
}

/** Generate calendar grid data for a month view */
export interface CalendarDay {
  date: Date;
  isoDate: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNumber: number;
}

export function generateCalendarGrid(
  year: number,
  month: number
): CalendarDay[] {
  const grid: CalendarDay[] = [];
  const firstDayOffset = getFirstDayOfMonthOffset(year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const todayISO = getTodayISO();

  // Previous month trailing days
  for (let i = firstDayOffset - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const date = new Date(prevYear, prevMonth, dayNum);
    grid.push({
      date,
      isoDate: formatDateISO(date),
      isCurrentMonth: false,
      isToday: false,
      dayNumber: dayNum,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const iso = formatDateISO(date);
    grid.push({
      date,
      isoDate: iso,
      isCurrentMonth: true,
      isToday: iso === todayISO,
      dayNumber: d,
    });
  }

  // Next month leading days to fill 6 rows (42 cells)
  const remaining = 42 - grid.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const date = new Date(nextYear, nextMonth, d);
    grid.push({
      date,
      isoDate: formatDateISO(date),
      isCurrentMonth: false,
      isToday: false,
      dayNumber: d,
    });
  }

  return grid;
}
