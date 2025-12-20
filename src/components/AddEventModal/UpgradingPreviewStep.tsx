import type { UpgradingCourse } from '../../types';
import styles from './AddEventModal.module.scss';
import { ModalHeader } from './ModalHeader';
import { formatPreviewDate, formatTimeDisplay } from './utils';

interface UpgradingPreviewStepProps {
  course: UpgradingCourse;
  isEditing: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSubmit: () => void;
}

export function UpgradingPreviewStep({
  course,
  isEditing,
  onClose,
  onBack,
  onSubmit,
}: UpgradingPreviewStepProps) {
  return (
    <>
      <ModalHeader
        title={isEditing ? 'Upgrading Course' : 'Preview'}
        onClose={onClose}
        onBack={!isEditing ? onBack : undefined}
      />

      <div className={styles.content}>
        <div className={styles.previewHeader}>
          <span className={styles.previewName}>{course.courseName}</span>
        </div>

        <div className={styles.previewSessions}>
          <label className={styles.label}>Sessions ({course.sessions.length})</label>
          <div className={styles.sessionList}>
            {course.sessions.map((session, i) => (
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
