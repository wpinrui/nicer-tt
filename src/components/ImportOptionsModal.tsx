import { useMemo, useState } from 'react';

import type { ShareData } from '../types';
import { isShareDataV2 } from '../types';
import styles from './ExportOptionsModal.module.scss';

export interface ImportOptions {
  includeRegularEvents: boolean;
  includeCustomEvents: boolean;
  includeUpgradingEvents: boolean;
}

interface ImportOptionsModalProps {
  shareData: ShareData;
  onConfirm: (options: ImportOptions) => void;
  onCancel: () => void;
}

export function ImportOptionsModal({ shareData, onConfirm, onCancel }: ImportOptionsModalProps) {
  const isV2 = isShareDataV2(shareData);
  const customEvents = isV2 ? shareData.customEvents : [];

  const { customCount, upgradingCount } = useMemo(() => {
    let custom = 0;
    let upgrading = 0;
    for (const event of customEvents) {
      if (event.eventType === 'upgrading') {
        upgrading++;
      } else {
        custom++;
      }
    }
    return { customCount: custom, upgradingCount: upgrading };
  }, [customEvents]);

  const regularCount = shareData.events.length;
  const hasCustom = customCount > 0;
  const hasUpgrading = upgradingCount > 0;

  const [includeRegular, setIncludeRegular] = useState(true);
  const [includeCustom, setIncludeCustom] = useState(true);
  const [includeUpgrading, setIncludeUpgrading] = useState(true);

  const handleConfirm = () => {
    onConfirm({
      includeRegularEvents: includeRegular,
      includeCustomEvents: includeCustom,
      includeUpgradingEvents: includeUpgrading,
    });
  };

  // Nothing to import if all unchecked
  const canConfirm =
    (includeRegular && regularCount > 0) ||
    (includeCustom && customCount > 0) ||
    (includeUpgrading && upgradingCount > 0);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Import Options</h3>

        <div className={styles.content}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeRegular}
              onChange={(e) => setIncludeRegular(e.target.checked)}
            />
            <span>Include timetable events</span>
            <span className={styles.count}>({regularCount})</span>
          </label>

          {hasCustom && (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeCustom}
                onChange={(e) => setIncludeCustom(e.target.checked)}
              />
              <span>Include custom events</span>
              <span className={styles.count}>({customCount})</span>
            </label>
          )}

          {hasUpgrading && (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeUpgrading}
                onChange={(e) => setIncludeUpgrading(e.target.checked)}
              />
              <span>Include upgrading courses</span>
              <span className={styles.count}>({upgradingCount})</span>
            </label>
          )}

          <p className={styles.hint}>
            This shared timetable includes {hasCustom || hasUpgrading ? 'additional' : ''} events.
            Choose which ones to import.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={handleConfirm} disabled={!canConfirm}>
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
