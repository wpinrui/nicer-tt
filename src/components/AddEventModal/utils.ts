/**
 * Utility functions for AddEventModal components.
 */

// Time state as { hour, minute } or null
export interface TimeValue {
  hour: string;
  minute: string;
}

/**
 * Converts a Date object to YYYY-MM-DD string.
 */
export function dateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts YYYY-MM-DD to Date object.
 */
export function isoToDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Gets the day of week name from a Date object.
 */
export function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Converts DD/MM date string to Date object (using current or next year).
 */
export function ddmmToDate(ddmm: string): Date {
  const [day, month] = ddmm.split('/').map(Number);
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), month - 1, day);
  // If the date is in the past, use next year
  if (thisYear < now) {
    return new Date(now.getFullYear() + 1, month - 1, day);
  }
  return thisYear;
}

/**
 * Formats a date for display in preview.
 */
export function formatPreviewDate(ddmm: string): string {
  const date = ddmmToDate(ddmm);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Converts HHMM string to TimeValue.
 */
export function parseTimeString(time: string): TimeValue | null {
  if (!time || time.length < 4) return null;
  return {
    hour: time.slice(0, 2),
    minute: time.slice(2, 4),
  };
}

/**
 * Converts TimeValue to HHMM string for storage.
 */
export function timeValueToString(time: TimeValue | null): string {
  if (!time) return '';
  return `${time.hour}${time.minute}`;
}

/**
 * Converts HH:MM to HHMM format.
 */
export function colonTimeToHHMM(colonTime: string): string {
  return colonTime.replace(':', '');
}

/**
 * Formats HHMM or HH:MM time for display.
 */
export function formatTimeDisplay(time: string): string {
  const clean = time.replace(':', '');
  if (clean.length < 4) return time;
  const hour = parseInt(clean.slice(0, 2));
  const minute = clean.slice(2, 4);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minute} ${ampm}`;
}

// Hours ordered by working hours first (08-18), then evening (19-23), then early morning (00-07)
export const HOURS = [
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
];

// Minutes as buttons (00, 15, 30, 45)
export const MINUTES = ['00', '15', '30', '45'];

// Support current year and next year for custom events
export const CURRENT_YEAR = new Date().getFullYear();

// Description limits
export const DESCRIPTION_MAX = 100;
export const DESCRIPTION_SUGGESTED = 80;
