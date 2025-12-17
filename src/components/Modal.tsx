import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
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
  const confirmClass = confirmVariant === 'primary' ? 'modal-confirm-primary' : 'modal-confirm';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>
            {cancelText}
          </button>
          {onSecondary && secondaryText && (
            <button className="modal-secondary" onClick={onSecondary}>
              {secondaryText}
            </button>
          )}
          <button className={confirmClass} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
