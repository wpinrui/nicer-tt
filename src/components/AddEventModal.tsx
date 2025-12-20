import { Calendar, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { CustomEvent, CustomEventType } from '../types';
import type { CustomEventInput } from '../hooks/useCustomEvents';
import { TIMETABLE_YEAR } from '../utils/constants';
import styles from './AddEventModal.module.scss';

const DESCRIPTION_MAX = 100;
const DESCRIPTION_SUGGESTED = 80;

interface AddEventModalProps {
  onClose: () => void;
  onSave: (event: CustomEventInput) => void;
  editingEvent?: CustomEvent | null;
}

/**
 * Converts a date string from YYYY-MM-DD to DD/MM format.
 */
function toDisplayDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

/**
 * Converts a date string from DD/MM to YYYY-MM-DD format.
 */
function toIsoDate(displayDate: string): string {
  const [day, month] = displayDate.split('/');
  return `${TIMETABLE_YEAR}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Gets the day of week name from a YYYY-MM-DD date string.
 */
function getDayOfWeek(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Formats time from HHMM to HH:MM for input.
 */
function toTimeInput(time: string): string {
  if (!time || time.length < 4) return '';
  return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
}

/**
 * Formats time from HH:MM to HHMM for storage.
 */
function fromTimeInput(time: string): string {
  return time.replace(':', '');
}

export function AddEventModal({ onClose, onSave, editingEvent }: AddEventModalProps) {
  const isEditing = !!editingEvent;

  // Form state
  const [dates, setDates] = useState<string[]>(() => {
    if (editingEvent?.dates?.length) {
      return editingEvent.dates.map(toIsoDate);
    }
    return [''];
  });
  const [startTime, setStartTime] = useState(() =>
    editingEvent ? toTimeInput(editingEvent.startTime) : ''
  );
  const [endTime, setEndTime] = useState(() =>
    editingEvent ? toTimeInput(editingEvent.endTime) : ''
  );
  const [eventType, setEventType] = useState<CustomEventType>(
    () => editingEvent?.eventType || 'custom'
  );
  const [description, setDescription] = useState(() => editingEvent?.description || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstDateRef = useRef<HTMLInputElement>(null);

  // Focus first date input on mount
  useEffect(() => {
    firstDateRef.current?.focus();
  }, []);

  const handleAddDate = useCallback(() => {
    setDates((prev) => [...prev, '']);
  }, []);

  const handleRemoveDate = useCallback((index: number) => {
    setDates((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDateChange = useCallback((index: number, value: string) => {
    setDates((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    setErrors((prev) => ({ ...prev, dates: '' }));
  }, []);

  const handleSubmit = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Validate dates
    const validDates = dates.filter((d) => d.trim() !== '');
    if (validDates.length === 0) {
      newErrors.dates = 'At least one date is required';
    }

    // Validate times
    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }
    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Build event input
    const eventInput: CustomEventInput = {
      dates: validDates.map(toDisplayDate),
      day: getDayOfWeek(validDates[0]),
      startTime: fromTimeInput(startTime),
      endTime: fromTimeInput(endTime),
      eventType,
      description: description.trim(),
      // Keep TimetableEvent compatibility with empty strings
      course: '',
      group: '',
      venue: '',
      tutor: '',
    };

    onSave(eventInput);
  }, [dates, startTime, endTime, eventType, description, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmit();
      }
    },
    [onClose, handleSubmit]
  );

  return (
    <div className={styles.overlay} onClick={onClose} onKeyDown={handleKeyDown}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{isEditing ? 'Edit Custom Event' : 'Add Custom Event'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Dates section */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Calendar size={14} />
              Dates <span className={styles.required}>*</span>
            </label>
            <div className={styles.datesContainer}>
              {dates.map((date, index) => (
                <div key={index} className={styles.dateRow}>
                  <input
                    ref={index === 0 ? firstDateRef : undefined}
                    type="date"
                    className={styles.dateInput}
                    value={date}
                    onChange={(e) => handleDateChange(index, e.target.value)}
                    min={`${TIMETABLE_YEAR}-01-01`}
                    max={`${TIMETABLE_YEAR}-12-31`}
                  />
                  {dates.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeDateBtn}
                      onClick={() => handleRemoveDate(index)}
                      title="Remove date"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className={styles.addDateBtn} onClick={handleAddDate}>
                <Plus size={14} /> Add another date
              </button>
            </div>
            {errors.dates && <span className={styles.error}>{errors.dates}</span>}
          </div>

          {/* Time section */}
          <div className={styles.timeRow}>
            <div className={styles.field}>
              <label className={styles.label}>
                Start Time <span className={styles.required}>*</span>
              </label>
              <input
                type="time"
                className={styles.input}
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setErrors((prev) => ({ ...prev, startTime: '' }));
                }}
              />
              {errors.startTime && <span className={styles.error}>{errors.startTime}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                End Time <span className={styles.required}>*</span>
              </label>
              <input
                type="time"
                className={styles.input}
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setErrors((prev) => ({ ...prev, endTime: '' }));
                }}
              />
              {errors.endTime && <span className={styles.error}>{errors.endTime}</span>}
            </div>
          </div>

          {/* Event type toggle */}
          <div className={styles.field}>
            <label className={styles.label}>Event Type</label>
            <div className={styles.eventTypeToggle}>
              <button
                type="button"
                className={`${styles.eventTypeBtn} ${eventType === 'custom' ? styles.eventTypeBtnActive : ''}`}
                onClick={() => setEventType('custom')}
              >
                Custom
              </button>
              <button
                type="button"
                className={`${styles.eventTypeBtn} ${eventType === 'upgrading' ? styles.eventTypeBtnActive : ''}`}
                onClick={() => setEventType('upgrading')}
              >
                Upgrading
              </button>
            </div>
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= DESCRIPTION_MAX) {
                  setDescription(e.target.value);
                }
              }}
              placeholder="e.g., Chemistry content upgrading at LT27"
              rows={2}
            />
            <div className={styles.charCounter}>
              <span
                className={
                  description.length > DESCRIPTION_SUGGESTED ? styles.charCounterWarning : ''
                }
              >
                {description.length}/{DESCRIPTION_MAX}
              </span>
              {description.length > DESCRIPTION_SUGGESTED &&
                description.length <= DESCRIPTION_MAX && (
                  <span className={styles.charCounterHint}>
                    (suggested: {DESCRIPTION_SUGGESTED})
                  </span>
                )}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
