/**
 * Centralized type definitions for the NIE Timetable application.
 * All domain types are defined here to ensure consistency across the codebase.
 */

// =============================================================================
// Timetable Types
// =============================================================================

/**
 * Represents a single event/class in a timetable.
 * Contains all information about a scheduled class session.
 */
export interface TimetableEvent {
  /** Course code (e.g., "CS101") */
  course: string;
  /** Tutorial/lab group identifier */
  group: string;
  /** Day of the week */
  day: string;
  /** Start time in HHMM format (e.g., "0830") */
  startTime: string;
  /** End time in HHMM format (e.g., "1030") */
  endTime: string;
  /** Array of date strings when this event occurs */
  dates: string[];
  /** Venue/location of the class */
  venue: string;
  /** Name of the tutor/instructor */
  tutor: string;
}

/**
 * Represents a complete timetable with metadata.
 * Used for storing and managing multiple timetables.
 */
export interface Timetable {
  /** Unique identifier for this timetable */
  id: string;
  /** User-assigned name for this timetable */
  name: string;
  /** Array of events in this timetable */
  events: TimetableEvent[];
  /** Original filename if imported from file */
  fileName: string | null;
  /** Whether this is the user's primary timetable */
  isPrimary: boolean;
  /** Timestamp when timetable was last updated (ms since epoch) */
  updatedAt?: number;
}

// =============================================================================
// Compare Mode Types
// =============================================================================

/**
 * Filter modes for comparing two timetables.
 */
export type CompareFilter = 'none' | 'commonDays' | 'identical' | 'travel' | 'eat';

/**
 * Simplified event item for display in lists.
 * Excludes day and dates since events are already grouped by date.
 */
export interface EventItem {
  course: string;
  group: string;
  startTime: string;
  endTime: string;
  venue: string;
  tutor: string;
}

/**
 * Events grouped by date for display.
 */
export interface GroupedEvent {
  /** Formatted date string for display (e.g., "Monday, 15 January") */
  date: string;
  /** Sort key in YYYY-MM-DD format */
  sortKey: string;
  /** Events occurring on this date */
  events: EventItem[];
}

/**
 * Travel compatibility information between two schedules.
 */
export interface TravelInfo {
  /** Whether they can travel together in the morning */
  canTravelTo: boolean;
  /** Whether they can travel together in the evening */
  canTravelFrom: boolean;
  /** Left timetable's earliest class start time */
  leftEarliest: string;
  /** Right timetable's earliest class start time */
  rightEarliest: string;
  /** Left timetable's latest class end time */
  leftLatest: string;
  /** Right timetable's latest class end time */
  rightLatest: string;
  /** Time difference in minutes for morning travel */
  toDiff: number;
  /** Time difference in minutes for evening travel */
  fromDiff: number;
}

/**
 * Meal compatibility information between two schedules.
 */
export interface MealInfo {
  /** Whether they can have lunch together */
  canEatLunch: boolean;
  /** Whether they can have dinner together */
  canEatDinner: boolean;
  /** Lunch gap start time in HHMM format */
  lunchGapStart: string;
  /** Lunch gap end time in HHMM format */
  lunchGapEnd: string;
  /** Dinner gap start time in HHMM format */
  dinnerGapStart: string;
  /** Dinner gap end time in HHMM format */
  dinnerGapEnd: string;
}

/**
 * Configuration for travel filter.
 */
export interface TravelConfig {
  /** Direction of travel to consider */
  direction: 'to' | 'from' | 'both' | 'either';
  /** Maximum acceptable wait time in minutes */
  waitMinutes: number;
}

/**
 * Configuration for meal filter.
 */
export interface MealConfig {
  /** Type of meal to check */
  type: 'lunch' | 'dinner';
  /** Lunch window start hour (24-hour format) */
  lunchStart: number;
  /** Lunch window end hour (24-hour format) */
  lunchEnd: number;
  /** Dinner window start hour (24-hour format) */
  dinnerStart: number;
  /** Dinner window end hour (24-hour format) */
  dinnerEnd: number;
}

// =============================================================================
// Custom Event Types
// =============================================================================

/**
 * Type of custom event - determines badge display.
 */
export type CustomEventType = 'custom' | 'upgrading' | 'cohort';

/**
 * A custom event created by the user (not parsed from NIE).
 * Extends TimetableEvent with metadata for custom event management.
 */
export interface CustomEvent extends TimetableEvent {
  /** Unique identifier for this custom event */
  id: string;
  /** Type of custom event (determines badge) */
  eventType: CustomEventType;
  /** User-provided description (max 100 chars) */
  description: string;
  /** When this event was created (timestamp) */
  createdAt: number;
  /** When this event was last modified (timestamp) */
  updatedAt: number;
  /** Group ID for linked events (e.g., upgrading course sessions) - delete together */
  groupId?: string;
}

/**
 * Storage format for custom events.
 * Custom events are stored per-timetable for isolation.
 */
export interface CustomEventsStore {
  [timetableId: string]: CustomEvent[];
}

/**
 * Extended event item for display that may be a custom event.
 */
export interface DisplayEventItem extends EventItem {
  /** Whether this is a custom event */
  isCustom?: boolean;
  /** Custom event ID (only present if isCustom is true) */
  customEventId?: string;
  /** Type of custom event - determines badge (only for custom events) */
  eventType?: CustomEventType;
  /** User-provided description (only for custom events) */
  description?: string;
  /** Event instance key for imported events (used for overrides/deletions) */
  eventInstanceKey?: EventInstanceKey;
  /** Whether this event has been edited (any field changed) */
  isEdited?: boolean;
  /** Original venue before override (for tooltip) */
  originalVenue?: string;
  /** Original tutor before override (for tooltip) */
  originalTutor?: string;
  /** Original start time before override (for tooltip) */
  originalStartTime?: string;
  /** Original end time before override (for tooltip) */
  originalEndTime?: string;
}

/**
 * Events grouped by date for display, using DisplayEventItem for custom event support.
 */
export interface DisplayGroupedEvent {
  /** Formatted date string for display (e.g., "Monday, 15 January 2026") */
  date: string;
  /** Sort key in YYYY-MM-DD format */
  sortKey: string;
  /** Events occurring on this date */
  events: DisplayEventItem[];
}

// =============================================================================
// Content Upgrading Types
// =============================================================================

/**
 * A single session in an upgrading course.
 */
export interface UpgradingSession {
  /** Date in DD/MM format */
  date: string;
  /** Start time in HH:MM format (24-hour) */
  startTime: string;
  /** End time in HH:MM format (24-hour) */
  endTime: string;
  /** Venue/location */
  venue: string;
  /** Tutor/instructor name */
  tutor: string;
}

/**
 * A content upgrading course preset.
 * Each JSON file in src/data/upgrading-courses/ represents one course.
 */
export interface UpgradingCourse {
  /** Course name (may include code, e.g., "COM1234 - Computing for Educators") */
  courseName: string;
  /** Array of sessions for this course */
  sessions: UpgradingSession[];
}

// =============================================================================
// Share Data Types
// =============================================================================

/**
 * V1 share data format (legacy).
 * Only contains regular events, no custom event metadata.
 */
export interface ShareDataV1 {
  events: TimetableEvent[];
  fileName: string;
}

/**
 * V2 share data format.
 * Includes custom events with full metadata preserved.
 */
export interface ShareDataV2 {
  version: 2;
  events: TimetableEvent[];
  customEvents: CustomEvent[];
  fileName: string;
}

/**
 * Union of all share data formats.
 */
export type ShareData = ShareDataV1 | ShareDataV2;

/**
 * Type guard to check if share data is V2 format.
 */
export function isShareDataV2(data: ShareData): data is ShareDataV2 {
  return 'version' in data && data.version === 2;
}

// =============================================================================
// Event Override Types (for editing imported events)
// =============================================================================

/**
 * Key to uniquely identify an imported event instance.
 * Format: "{course}|{group}|{date}|{startTime}" - enough to uniquely identify an event on a specific date.
 */
export type EventInstanceKey = string;

/**
 * Override fields for an imported event.
 * Supports editing venue, tutor, and time fields.
 */
export interface EventOverride {
  /** Overridden venue (if changed from original) */
  venue?: string;
  /** Overridden tutor (if changed from original) */
  tutor?: string;
  /** Overridden start time (if changed from original) */
  startTime?: string;
  /** Overridden end time (if changed from original) */
  endTime?: string;
  /** Timestamp when this override was created/updated */
  updatedAt: number;
}

/**
 * Storage format for event overrides.
 * Overrides are stored per-timetable for isolation.
 */
export interface EventOverridesStore {
  [timetableId: string]: {
    /** Overrides keyed by EventInstanceKey */
    overrides: Record<EventInstanceKey, EventOverride>;
    /** Set of deleted event instance keys */
    deletions: EventInstanceKey[];
  };
}

/**
 * Creates a unique key for an event instance on a specific date.
 */
export function createEventInstanceKey(
  course: string,
  group: string,
  date: string,
  startTime: string
): EventInstanceKey {
  return `${course}|${group}|${date}|${startTime}`;
}

/**
 * Applies overrides and deletions to events, returning expanded single-date events.
 * Each returned event has exactly one date with any overrides baked in.
 * Deleted event instances are excluded.
 */
export function applyOverridesToEvents(
  events: TimetableEvent[],
  overrides: Record<EventInstanceKey, EventOverride>,
  deletions: EventInstanceKey[]
): TimetableEvent[] {
  const result: TimetableEvent[] = [];

  for (const event of events) {
    for (const dateStr of event.dates) {
      const eventKey = createEventInstanceKey(event.course, event.group, dateStr, event.startTime);

      // Skip deleted events
      if (deletions.includes(eventKey)) {
        continue;
      }

      // Apply overrides
      const override = overrides[eventKey];
      const expandedEvent: TimetableEvent = {
        ...event,
        dates: [dateStr],
        startTime: override?.startTime ?? event.startTime,
        endTime: override?.endTime ?? event.endTime,
        venue: override?.venue ?? event.venue,
        tutor: override?.tutor ?? event.tutor,
      };

      result.push(expandedEvent);
    }
  }

  return result;
}
