// NIE timetables are for the upcoming academic year
export const TIMETABLE_YEAR = 2026;

export const STORAGE_KEYS = {
  TIMETABLE_DATA: 'nie-timetable-data',
  DARK_MODE: 'nie-dark-mode',
  SHOW_TUTOR: 'nie-show-tutor',
} as const;

// Color palette for course codes (darker shades for white text)
export const COURSE_COLORS = [
  '#b71c1c', '#880e4f', '#4a148c', '#311b92', '#1a237e',
  '#0d47a1', '#01579b', '#006064', '#004d40', '#1b5e20',
  '#33691e', '#827717', '#f57f17', '#e65100', '#bf360c',
  '#3e2723', '#424242', '#263238', '#ad1457', '#6a1b9a',
] as const;
