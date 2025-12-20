import { useState } from 'react';

import styles from './ExportOptionsModal.module.scss';

export interface ExportOptions {
  includeCustomEvents: boolean;
  includeUpgradingEvents: boolean;
}

interface ExportOptionsModalProps {
  customEventCount: number;
  upgradingEventCount: number;
  actionLabel: string;
  onConfirm: (options: ExportOptions) => void;
  onCancel: () => void;
}

export function ExportOptionsModal({
  customEventCount,
  upgradingEventCount,
  actionLabel,
  onConfirm,
  onCancel,
}: ExportOptionsModalProps) {
  const [includeCustom, setIncludeCustom] = useState(true);
  const [includeUpgrading, setIncludeUpgrading] = useState(true);

  const hasCustom = customEventCount > 0;
  const hasUpgrading = upgradingEventCount > 0;

  const handleConfirm = () => {
    onConfirm({
      includeCustomEvents: includeCustom,
      includeUpgradingEvents: includeUpgrading,
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{actionLabel}</h3>

        <div className={styles.content}>
          {hasUpgrading && (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeUpgrading}
                onChange={(e) => setIncludeUpgrading(e.target.checked)}
              />
              <span>Include content upgrading events</span>
              <span className={styles.count}>({upgradingEventCount})</span>
            </label>
          )}

          {hasCustom && (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeCustom}
                onChange={(e) => setIncludeCustom(e.target.checked)}
              />
              <span>Include custom events</span>
              <span className={styles.count}>({customEventCount})</span>
            </label>
          )}
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
