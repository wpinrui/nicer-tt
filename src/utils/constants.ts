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
  '#BF1313',
  '#BF3313',
  '#BF5313',
  '#AA6711',
  '#92710E',
  '#80790C',
  '#6F7D0C',
  '#5D810C',
  '#0D874A',
  '#0D866D',
  '#0E838D',
  '#0B4A70',
  '#0B2C70',
  '#0B0F70',
  '#240B70',
  '#7013BF',
  '#A213BF',
  '#BF13A9',
  '#BF1377',
  '#BF1345',
] as const;
