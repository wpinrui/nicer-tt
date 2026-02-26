import { Check, ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';

import { useDismiss } from '../hooks';
import type { Timetable } from '../types';

import styles from './TimetableSwitcher.module.scss';

interface TimetableSwitcherProps {
  timetables: Timetable[];
  activeTimetable: Timetable;
  onSwitch: (id: string, name: string) => void;
}

export function TimetableSwitcher({
  timetables,
  activeTimetable,
  onSwitch,
}: TimetableSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const hasMultiple = timetables.length > 1;

  useDismiss(containerRef, () => setIsOpen(false), isOpen);

  if (!hasMultiple) {
    return <span className={styles.name}>{activeTimetable.name}</span>;
  }

  return (
    <span className={styles.container} ref={containerRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {activeTimetable.name}
        <ChevronDown size={14} className={isOpen ? styles.chevronOpen : styles.chevron} />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {timetables.map((tt) => (
            <button
              key={tt.id}
              className={`${styles.item} ${tt.id === activeTimetable.id ? styles.itemActive : ''}`}
              role="option"
              aria-selected={tt.id === activeTimetable.id}
              onClick={() => {
                if (tt.id !== activeTimetable.id) {
                  onSwitch(tt.id, tt.name);
                }
                setIsOpen(false);
              }}
            >
              <span className={styles.itemName}>{tt.name}</span>
              {tt.id === activeTimetable.id && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
