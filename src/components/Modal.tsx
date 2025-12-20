import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import type { ButtonVariant } from '../types/ui';
import styles from './Modal.module.scss';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: ReactNode;
  confirmVariant?: ButtonVariant;
  cancelText?: string;
  onSecondary?: () => void;
  secondaryText?: string;
}

export function Modal({
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  cancelText = 'Cancel',
  onSecondary,
  secondaryText,
}: ModalProps) {
  const confirmClass = confirmVariant === 'primary' ? styles.confirmPrimary : styles.confirm;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
        <div className={styles.actions}>
          {cancelText && (
            <button className={styles.cancel} onClick={onClose}>
              {cancelText}
            </button>
          )}
          {onSecondary && secondaryText && (
            <button className={styles.secondary} onClick={onSecondary}>
              {secondaryText}
            </button>
          )}
          <button className={confirmClass} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
