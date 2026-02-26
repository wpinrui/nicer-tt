import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';

import { useDismiss } from '../../hooks';

import styles from './AddEventModal.module.scss';

interface TimeDropdownProps {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}

export function TimeDropdown({ value, options, placeholder, onChange }: TimeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useDismiss(containerRef, () => setIsOpen(false), isOpen);

  return (
    <div className={styles.timeDropdown} ref={containerRef}>
      <button type="button" className={styles.timeDropdownBtn} onClick={() => setIsOpen(!isOpen)}>
        <span className={value ? '' : styles.timeDropdownPlaceholder}>{value || placeholder}</span>
        <ChevronDown size={14} />
      </button>
      {isOpen && (
        <div className={styles.timeDropdownList}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`${styles.timeDropdownItem} ${opt === value ? styles.timeDropdownItemActive : ''}`}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
