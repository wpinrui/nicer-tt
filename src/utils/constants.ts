// NIE timetables are for the upcoming academic year
export const TIMETABLE_YEAR = 2026;

// Toast auto-dismiss duration
export const TOAST_DURATION_MS = 3000;

export const STORAGE_KEYS = {
  TIMETABLE_DATA: 'nie-timetable-data', // Legacy, for migration
  TIMETABLES_DATA: 'nie-timetables-data', // New multi-timetable storage
  ACTIVE_TIMETABLE: 'nie-active-timetable', // ID of the timetable being viewed
  DARK_MODE: 'nie-dark-mode',
  SHOW_TUTOR: 'nie-show-tutor',
  HAS_SEEN_SHARE_TIP: 'nie-has-seen-share-tip',
  CUSTOM_BACKGROUND: 'nie-custom-background',
  CUSTOM_EVENTS: 'nie-custom-events', // CustomEventsStore JSON
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

// Fixed colors for custom event types (used in course tag badges)
export const CUSTOM_EVENT_COLORS: Record<string, string> = {
  Custom: '#9c27b0', // Purple
  Upgrading: '#16a085', // Teal
} as const;

// Color palette for course codes (rainbow spectrum)
export const COURSE_COLORS = [
  '#bf1313',
  '#bf4613',
  '#a46910',
  '#83770d',
  '#687f0c',
  '#0d874a',
  '#0d8666',
  '#0d8480',
  '#0f819e',
  '#0b4470',
  '#0b2c70',
  '#0b1570',
  '#180b70',
  '#5213bf',
  '#7a13bf',
  '#a213bf',
  '#bf13b3',
  '#bf138b',
  '#bf1363',
  '#bf133b',
] as const;
