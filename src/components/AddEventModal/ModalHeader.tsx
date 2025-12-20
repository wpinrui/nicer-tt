import { ArrowLeft, X } from 'lucide-react';

import styles from './AddEventModal.module.scss';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
}

export function ModalHeader({ title, onClose, onBack }: ModalHeaderProps) {
  return (
    <div className={styles.header}>
      {onBack && (
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
      )}
      <h3>{title}</h3>
      <button className={styles.closeBtn} onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
}
