import { CalendarX2 } from 'lucide-react';

import styles from './EmptyTimetableState.module.scss';

interface EmptyTimetableStateProps {
  /**
   * When provided (desktop only), "add your latest timetable" renders as a link
   * that opens the guided import wizard. On mobile it stays plain text, since the
   * import requires a desktop browser.
   */
  onAddTimetable?: () => void;
}

/**
 * Shown when the active timetable has events but none are upcoming (a "stale"
 * timetable). Explains why the list looks empty instead of leaving a blank screen.
 * Renders on all viewports.
 */
export function EmptyTimetableState({ onAddTimetable }: EmptyTimetableStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.glyph}>
        <CalendarX2 size={30} />
      </div>
      <h4>No upcoming classes</h4>
      <p>
        Everything in this timetable has already happened. If a new semester has started,{' '}
        {onAddTimetable ? (
          <button type="button" className={styles.link} onClick={onAddTimetable}>
            add your latest timetable
          </button>
        ) : (
          'add your latest timetable'
        )}{' '}
        to see it here.
      </p>
    </div>
  );
}
