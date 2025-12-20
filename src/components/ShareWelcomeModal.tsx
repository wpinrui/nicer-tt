import { Share2 } from 'lucide-react';
import { createPortal } from 'react-dom';

import styles from './ShareWelcomeModal.module.scss';

interface ShareWelcomeModalProps {
  onClose: () => void;
}

export function ShareWelcomeModal({ onClose }: ShareWelcomeModalProps) {
  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <Share2 size={32} className={styles.icon} />
          <h3>Share Your Timetable Anywhere</h3>
        </div>
        <div className={styles.content}>
          <p>
            <strong>Click Share to copy a link to your clipboard.</strong> Anyone with the link can
            view your timetable without needing to upload the HTML file themselves.
          </p>
          <p>You can save this link to view your timetable from any device.</p>
          <p className={styles.tip}>
            <span className={styles.tipIcon}>📱</span>
            <span className={styles.tipText}>
              <strong>Pro tip:</strong> Open the share link on your phone's browser once, and your
              timetable will be saved on your phone the next time you visit NIcEr Timetable.
            </span>
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.closeBtn} onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
