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

// Color palette for course codes (gradient from red to navy)
export const COURSE_COLORS = [
  '#bf1a1a',
  '#c92617',
  '#d33315',
  '#dd4013',
  '#e74d11',
  '#f15a0e',
  '#fb670c',
  '#ff7819',
  '#ff8a2e',
  '#ff9c43',
  '#ffaf57',
  '#ffc16c',
  '#ffd381',
  '#f1d48d',
  '#cab288',
  '#a39083',
  '#7b6d7f',
  '#544b7a',
  '#2d2975',
  '#060771',
] as const;
