import { Shield } from 'lucide-react';

import styles from '../OptionsPanel.module.scss';

interface PrivacySectionProps {
  onShowPrivacy: () => void;
}

export function PrivacySection({ onShowPrivacy }: PrivacySectionProps) {
  return (
    <div className={styles.section}>
      <h4>Privacy & Security</h4>
      <p className={styles.privacyDesc}>
        Learn how your data is processed and stored.
      </p>
      <button className={`${styles.btn} ${styles.btnPrivacy}`} onClick={onShowPrivacy}>
        <Shield size={14} /> View privacy info
      </button>
    </div>
  );
}
