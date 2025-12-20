import { X } from 'lucide-react';
import { forwardRef, useCallback, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import type { CustomEvent, CustomEventType } from '../types';
import type { CustomEventInput } from '../hooks/useCustomEvents';
import styles from './AddEventModal.module.scss';

const DESCRIPTION_MAX = 100;
const DESCRIPTION_SUGGESTED = 80;

// Support current year and next year for custom events
const CURRENT_YEAR = new Date().getFullYear();

interface AddEventModalProps {
  onClose: () => void;
  onSave: (event: CustomEventInput) => void;
  editingEvent?: CustomEvent | null;
}

/**
 * Converts a Date object to YYYY-MM-DD string.
 */
function dateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts YYYY-MM-DD to Date object.
 */
function isoToDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Gets the day of week name from a Date object.
 */
function getDayOfWeek(date: Date): string {
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

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
}

const CustomDateInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, placeholder }, ref) => (
    <input
      type="text"
      className={styles.input}
      value={value}
      onClick={onClick}
      placeholder={placeholder}
      readOnly
      ref={ref}
    />
  )
);
CustomDateInput.displayName = 'CustomDateInput';

export function AddEventModal({ onClose, onSave, editingEvent }: AddEventModalProps) {
  const isEditing = !!editingEvent;

  // Selected dates as Date objects
  const [selectedDates, setSelectedDates] = useState<Date[]>(() => {
    if (editingEvent?.dates?.length) {
      return editingEvent.dates.map((d) => isoToDate(d));
    }
    return [];
  });

  const [startTime, setStartTime] = useState(() =>
    editingEvent ? toTimeInput(editingEvent.startTime) : '12:00'
  );
  const [endTime, setEndTime] = useState(() =>
    editingEvent ? toTimeInput(editingEvent.endTime) : '14:00'
  );
  const [eventType, setEventType] = useState<CustomEventType>(
    () => editingEvent?.eventType || 'custom'
  );
  const [description, setDescription] = useState(() => editingEvent?.description || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDateChange = useCallback((dates: Date | [Date | null, Date | null] | null) => {
    if (!dates) return;
    // For multi-select, dates is the array of selected dates
    if (Array.isArray(dates)) {
      // This shouldn't happen with our config, but handle it
      return;
    }
    // Toggle the date
    setSelectedDates((prev) => {
      const existing = prev.find(
        (d) =>
          d.getFullYear() === dates.getFullYear() &&
          d.getMonth() === dates.getMonth() &&
          d.getDate() === dates.getDate()
      );
      if (existing) {
        return prev.filter((d) => d !== existing);
      } else {
        return [...prev, dates].sort((a, b) => a.getTime() - b.getTime());
      }
    });
    setErrors((prev) => ({ ...prev, dates: '' }));
  }, []);

  const removeDate = useCallback((dateToRemove: Date) => {
    setSelectedDates((prev) =>
      prev.filter(
        (d) =>
          d.getFullYear() !== dateToRemove.getFullYear() ||
          d.getMonth() !== dateToRemove.getMonth() ||
          d.getDate() !== dateToRemove.getDate()
      )
    );
  }, []);

  const formatDateChip = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  }, []);

  const getInputDisplayValue = useCallback((): string => {
    if (selectedDates.length === 0) return '';
    if (selectedDates.length === 1) {
      return selectedDates[0].toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return `${selectedDates.length} dates selected`;
  }, [selectedDates]);

  const handleSubmit = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Validate dates
    if (selectedDates.length === 0) {
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

    // Validate description
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());

    // Build event input - dates stored as YYYY-MM-DD
    const eventInput: CustomEventInput = {
      dates: sortedDates.map((d) => dateToIso(d)),
      day: getDayOfWeek(sortedDates[0]),
      startTime: fromTimeInput(startTime),
      endTime: fromTimeInput(endTime),
      eventType,
      description: description.trim(),
      course: eventType === 'upgrading' ? 'Upgrading' : 'Custom',
      group: '',
      venue: '',
      tutor: '',
    };

    onSave(eventInput);
  }, [selectedDates, startTime, endTime, eventType, description, onSave]);

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
    <div className={styles.overlay} onKeyDown={handleKeyDown}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{isEditing ? 'Edit Custom Event' : 'Add Custom Event'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Date picker section */}
          <div className={styles.field}>
            <label className={styles.label}>Select Dates</label>

            <div className={styles.datePickerWrapper}>
              <DatePicker
                selected={null}
                onChange={handleDateChange}
                customInput={<CustomDateInput placeholder="Click to select dates" />}
                highlightDates={selectedDates}
                minDate={new Date()}
                maxDate={new Date(CURRENT_YEAR + 1, 11, 31)}
                calendarClassName={styles.datePicker}
                popperClassName={styles.datePickerPopper}
                value={getInputDisplayValue()}
                shouldCloseOnSelect={false}
                dayClassName={(date) =>
                  selectedDates.some(
                    (d) =>
                      d.getFullYear() === date.getFullYear() &&
                      d.getMonth() === date.getMonth() &&
                      d.getDate() === date.getDate()
                  )
                    ? styles.datePickerDaySelected
                    : ''
                }
              />
            </div>

            {/* Selected dates chips */}
            {selectedDates.length > 0 && (
              <div className={styles.selectedDates}>
                {selectedDates.map((date) => (
                  <span key={date.toISOString()} className={styles.dateChip}>
                    {formatDateChip(date)}
                    <button
                      type="button"
                      className={styles.dateChipRemove}
                      onClick={() => removeDate(date)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {errors.dates && <span className={styles.error}>{errors.dates}</span>}
          </div>

          {/* Time section */}
          <div className={styles.timeRow}>
            <div className={styles.field}>
              <label className={styles.label}>Start Time</label>
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
              <label className={styles.label}>End Time</label>
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
                  setErrors((prev) => ({ ...prev, description: '' }));
                }
              }}
              placeholder="e.g., Chemistry content upgrading at LT27"
              rows={2}
            />
            {errors.description && <span className={styles.error}>{errors.description}</span>}
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
