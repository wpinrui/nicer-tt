import styles from './AddEventModal.module.scss';
import { ModalHeader } from './ModalHeader';

interface TypeSelectStepProps {
  onClose: () => void;
  onSelectCustom: () => void;
  onSelectUpgrading: () => void;
  onSelectCohort: () => void;
}

export function TypeSelectStep({
  onClose,
  onSelectCustom,
  onSelectUpgrading,
  onSelectCohort,
}: TypeSelectStepProps) {
  return (
    <>
      <ModalHeader title="Add Event" onClose={onClose} />

      <div className={styles.content}>
        <p className={styles.typeSelectHint}>What would you like to add?</p>

        <div className={styles.typeSelectOptions}>
          <button className={styles.typeSelectBtn} onClick={onSelectUpgrading}>
            <span className={styles.typeSelectBtnTitle}>Content Upgrading Course</span>
            <span className={styles.typeSelectBtnDesc}>
              Select from available upgrading courses
            </span>
          </button>

          <button className={styles.typeSelectBtn} onClick={onSelectCohort}>
            <span className={styles.typeSelectBtnTitle}>Cohort Event</span>
            <span className={styles.typeSelectBtnDesc}>
              Select from cohort-wide events
            </span>
          </button>

          <button className={styles.typeSelectBtn} onClick={onSelectCustom}>
            <span className={styles.typeSelectBtnTitle}>Custom Event</span>
            <span className={styles.typeSelectBtnDesc}>Create a personal event manually</span>
          </button>
        </div>
      </div>
    </>
  );
}
