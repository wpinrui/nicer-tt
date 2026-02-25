import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Timetable } from '../types';

import styles from './TimetableSwitcher.module.scss';

interface TimetableSwitcherProps {
  timetables: Timetable[];
  activeTimetable: Timetable;
  onSwitch: (id: string, name: string) => void;
}

export function TimetableSwitcher({ timetables, activeTimetable, onSwitch }: TimetableSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const hasMultiple = timetables.length > 1;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
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
