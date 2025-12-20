import { ChevronDown, Download, Share2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './ExportMenu.module.scss';

interface ExportMenuProps {
  onDownload: () => void;
  onShare: () => void;
  disabled?: boolean;
}

export function ExportMenu({ onDownload, onShare, disabled = false }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDownload = useCallback(() => {
    setIsOpen(false);
    onDownload();
  }, [onDownload]);

  const handleShare = useCallback(() => {
    setIsOpen(false);
    onShare();
  }, [onShare]);

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Download size={14} />
        Export
        <ChevronDown size={14} className={isOpen ? styles.chevronOpen : ''} />
      </button>

      {isOpen && (
        <div className={styles.menu} role="menu">
          <button
            className={styles.menuItem}
            onClick={handleDownload}
            role="menuitem"
          >
            <Download size={16} />
            Download .ics
          </button>
          <button
            className={styles.menuItem}
            onClick={handleShare}
            role="menuitem"
          >
            <Share2 size={16} />
            Share (copy link)
          </button>
        </div>
      )}
    </div>
  );
}
