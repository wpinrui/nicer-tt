import { useState } from 'react';

import styles from './ExportOptionsModal.module.scss';

interface ExportOptionsModalProps {
  customEventCount: number;
  actionLabel: string;
  onConfirm: (includeCustomEvents: boolean) => void;
  onCancel: () => void;
}

export function ExportOptionsModal({
  customEventCount,
  actionLabel,
  onConfirm,
  onCancel,
}: ExportOptionsModalProps) {
  const [includeCustom, setIncludeCustom] = useState(true);

  const handleConfirm = () => {
    onConfirm(includeCustom);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{actionLabel}</h3>

        <div className={styles.content}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeCustom}
              onChange={(e) => setIncludeCustom(e.target.checked)}
            />
            <span>Include custom events</span>
            <span className={styles.count}>({customEventCount})</span>
          </label>
          <p className={styles.hint}>
            Custom events are events you added manually, not from the NIE timetable.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
