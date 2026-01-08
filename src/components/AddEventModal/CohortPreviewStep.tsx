import type { CohortEvent } from '../../data/cohort-events';
import styles from './AddEventModal.module.scss';
import { ModalHeader } from './ModalHeader';
import { formatPreviewDate, formatTimeDisplay } from './utils';

interface CohortPreviewStepProps {
  event: CohortEvent;
  isEditing: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSubmit: () => void;
}

export function CohortPreviewStep({
  event,
  isEditing,
  onClose,
  onBack,
  onSubmit,
}: CohortPreviewStepProps) {
  return (
    <>
      <ModalHeader
        title={isEditing ? 'Cohort Event' : 'Preview'}
        onClose={onClose}
        onBack={!isEditing ? onBack : undefined}
      />

      <div className={styles.content}>
        <div className={styles.previewHeader}>
          <span className={styles.previewName}>{event.courseName}</span>
        </div>

        <div className={styles.previewSessions}>
          <label className={styles.label}>Sessions ({event.sessions.length})</label>
          <div className={styles.sessionList}>
            {event.sessions.map((session, i) => (
              <div key={i} className={styles.sessionItem}>
                <span className={styles.sessionDate}>{formatPreviewDate(session.date)}</span>
                <span className={styles.sessionTime}>
                  {formatTimeDisplay(session.startTime)} - {formatTimeDisplay(session.endTime)}
                </span>
                {session.venue && <span className={styles.sessionVenue}>{session.venue}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        {!isEditing && (
          <button className={styles.saveBtn} onClick={onSubmit}>
            Add to Timetable
          </button>
        )}
      </div>
    </>
  );
}
