import { CalendarX2 } from 'lucide-react';

import styles from './EmptyTimetableState.module.scss';

/**
 * Shown when the active timetable has events but none are upcoming
 * (a "stale" timetable, e.g. Semester 1 viewed after Semester 2 has started).
 * Explains why the list looks empty instead of leaving a blank screen.
 * Renders on all viewports.
 */
export function EmptyTimetableState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.glyph}>
        <CalendarX2 size={30} />
      </div>
      <h4>No upcoming classes</h4>
      <p>
        Everything in this timetable has already happened. If a new semester has started, add your
        latest timetable to see it here.
      </p>
    </div>
  );
}
