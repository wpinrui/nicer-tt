import type { CustomEvent, TimetableEvent } from '../types';
import { getTodaySortKey } from './formatters';

/**
 * Returns true if the timetable has at least one event dated today or later,
 * counting both imported events and custom events.
 *
 * Used to detect a "stale" timetable whose events have all already happened
 * (e.g. a Semester 1 timetable viewed after Semester 2 has started).
 */
export function hasFutureEvents(
  events: TimetableEvent[] | null,
  customEvents: CustomEvent[]
): boolean {
  const todaySortKey = getTodaySortKey();
  const anyFuture = (dates: string[]): boolean => dates.some((d) => d >= todaySortKey);

  if (events?.some((event) => anyFuture(event.dates))) return true;
  if (customEvents.some((event) => anyFuture(event.dates))) return true;
  return false;
}

/**
 * Appends an " (Old)" suffix to a timetable name, unless it already ends with one.
 * Used by the sem-2 accept path when demoting the previous timetable.
 */
export function withOldSuffix(name: string): string {
  return name.endsWith('(Old)') ? name : `${name} (Old)`;
}
