// NIE timetables are for the upcoming academic year
export const TIMETABLE_YEAR = 2026;

export const STORAGE_KEYS = {
  TIMETABLE_DATA: 'nie-timetable-data', // Legacy, for migration
  TIMETABLES_DATA: 'nie-timetables-data', // New multi-timetable storage
  ACTIVE_TIMETABLE: 'nie-active-timetable', // ID of the timetable being viewed
  DARK_MODE: 'nie-dark-mode',
  SHOW_TUTOR: 'nie-show-tutor',
  HAS_SEEN_SHARE_TIP: 'nie-has-seen-share-tip',
  CUSTOM_BACKGROUND: 'nie-custom-background',
} as const;

// Default name sequence for added timetables
export const DEFAULT_TIMETABLE_NAMES = [
  "Someone's Timetable",
  "Sometwo's Timetable",
  "Somethree's Timetable",
  "Somefour's Timetable",
  "Somefive's Timetable",
  "Somesix's Timetable",
  "Someseven's Timetable",
  "Someeight's Timetable",
  "Somenine's Timetable",
  "Someten's Timetable",
] as const;

// Compare mode types
export type CompareFilter = 'none' | 'commonDays' | 'identical' | 'travel' | 'eat';

// Color palette for course codes (darker shades for white text)
export const COURSE_COLORS = [
  '#b71c1c', '#880e4f', '#4a148c', '#311b92', '#1a237e',
  '#0d47a1', '#01579b', '#006064', '#004d40', '#1b5e20',
  '#33691e', '#827717', '#f57f17', '#e65100', '#bf360c',
  '#3e2723', '#424242', '#263238', '#ad1457', '#6a1b9a',
] as const;
