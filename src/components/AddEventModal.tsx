import { ChevronDown, X } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
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

// Time state as { hour, minute } or null
interface TimeValue {
  hour: string;
  minute: string;
}

/**
 * Converts HHMM string to TimeValue.
 */
function parseTimeString(time: string): TimeValue | null {
  if (!time || time.length < 4) return null;
  return {
    hour: time.slice(0, 2),
    minute: time.slice(2, 4),
  };
}

/**
 * Converts TimeValue to HHMM string for storage.
 */
function timeValueToString(time: TimeValue | null): string {
  if (!time) return '';
  return `${time.hour}${time.minute}`;
}

// Hours ordered by working hours first (08-18), then evening (19-23), then early morning (00-07)
const HOURS = [
  '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18',
  '19', '20', '21', '22', '23', '00', '01', '02', '03', '04', '05', '06', '07',
];
// Minutes as buttons (00, 15, 30, 45)
const MINUTES = ['00', '15', '30', '45'];

interface TimeDropdownProps {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}

function TimeDropdown({ value, options, placeholder, onChange }: TimeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={styles.timeDropdown} ref={containerRef}>
      <button
        type="button"
        className={styles.timeDropdownBtn}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? '' : styles.timeDropdownPlaceholder}>
          {value || placeholder}
        </span>
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

  const [startTime, setStartTime] = useState<TimeValue | null>(() =>
    editingEvent ? parseTimeString(editingEvent.startTime) : null
  );
  const [endTime, setEndTime] = useState<TimeValue | null>(() =>
    editingEvent ? parseTimeString(editingEvent.endTime) : null
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
    if (startTime && endTime) {
      const startMinutes = parseInt(startTime.hour) * 60 + parseInt(startTime.minute);
      const endMinutes = parseInt(endTime.hour) * 60 + parseInt(endTime.minute);
      if (startMinutes >= endMinutes) {
        newErrors.endTime = 'End time must be after start time';
      }
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
      startTime: timeValueToString(startTime),
      endTime: timeValueToString(endTime),
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
              <div className={styles.timeSelect}>
                <TimeDropdown
                  value={startTime?.hour || ''}
                  options={HOURS}
                  placeholder="HH"
                  onChange={(hour) => {
                    setStartTime({ hour, minute: startTime?.minute || '00' });
                    setErrors((prev) => ({ ...prev, startTime: '' }));
                  }}
                />
                <span className={styles.timeSeparator}>:</span>
                <TimeDropdown
                  value={startTime?.minute || ''}
                  options={MINUTES}
                  placeholder="MM"
                  onChange={(minute) => {
                    setStartTime({ hour: startTime?.hour || '08', minute });
                    setErrors((prev) => ({ ...prev, startTime: '' }));
                  }}
                />
              </div>
              {errors.startTime && <span className={styles.error}>{errors.startTime}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>End Time</label>
              <div className={styles.timeSelect}>
                <TimeDropdown
                  value={endTime?.hour || ''}
                  options={HOURS}
                  placeholder="HH"
                  onChange={(hour) => {
                    setEndTime({ hour, minute: endTime?.minute || '00' });
                    setErrors((prev) => ({ ...prev, endTime: '' }));
                  }}
                />
                <span className={styles.timeSeparator}>:</span>
                <TimeDropdown
                  value={endTime?.minute || ''}
                  options={MINUTES}
                  placeholder="MM"
                  onChange={(minute) => {
                    setEndTime({ hour: endTime?.hour || '10', minute });
                    setErrors((prev) => ({ ...prev, endTime: '' }));
                  }}
                />
              </div>
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
