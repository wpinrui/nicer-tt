import { CalendarPlus, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import styles from './StaleTimetableNudge.module.scss';

interface StaleTimetableNudgeProps {
  /** "Add Semester 2" — opens the guided import wizard. */
  onAccept: () => void;
  /** "Not now" / ✕ — dismisses for this visit only (may reappear on a later visit while stale). */
  onDismiss: () => void;
  /** "Never show again" — permanent opt-out. */
  onNeverShow: () => void;
}

/**
 * Non-blocking corner-card nudge shown when the active timetable has no upcoming
 * classes. Desktop-only (the caller gates on viewport) — the import requires
 * saving a page with Ctrl+S in a desktop browser.
 */
export function StaleTimetableNudge({
  onAccept,
  onDismiss,
  onNeverShow,
}: StaleTimetableNudgeProps) {
  return createPortal(
    <div className={styles.bubble} role="dialog" aria-label="Semester 2 reminder">
      <button className={styles.close} onClick={onDismiss} title="Not now" aria-label="Not now">
        <X size={16} />
      </button>
      <div className={styles.head}>
        <div className={styles.icon}>
          <CalendarPlus size={20} />
        </div>
        <h3 className={styles.title}>Ready for Semester 2?</h3>
      </div>
      <p className={styles.body}>
        Your timetable has <strong>no upcoming classes</strong>. Last semester's has wrapped up, so
        add your Semester 2 timetable and you'll be sorted in about a minute.
      </p>
      <div className={styles.actions}>
        <button className={styles.ghostBtn} onClick={onDismiss}>
          Not now
        </button>
        <button className={styles.primaryBtn} onClick={onAccept}>
          Add Semester 2
        </button>
      </div>
      <button className={styles.optOut} onClick={onNeverShow}>
        Never show again
      </button>
    </div>,
    document.body
  );
}
