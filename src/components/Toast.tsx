import { createPortal } from 'react-dom';

import styles from './Toast.module.scss';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export function Toast({ message, type }: ToastProps) {
  return createPortal(
    <div className={`${styles.toast} ${type === 'success' ? styles.success : styles.error}`}>
      {message}
    </div>,
    document.body
  );
}
