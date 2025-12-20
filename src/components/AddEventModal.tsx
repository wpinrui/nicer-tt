import { ArrowLeft, ChevronDown, ExternalLink, X } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { UPGRADING_COURSES } from '../data/upgrading-courses';
import type { CustomEventInput } from '../hooks/useCustomEvents';
import type { CustomEvent, CustomEventType, UpgradingCourse } from '../types';
import { CONTRIBUTION_PAGE_URL } from '../utils/constants';
import styles from './AddEventModal.module.scss';

const DESCRIPTION_MAX = 100;
const DESCRIPTION_SUGGESTED = 80;

// Support current year and next year for custom events
const CURRENT_YEAR = new Date().getFullYear();

type ModalStep = 'type-select' | 'custom-form' | 'upgrading-select' | 'upgrading-preview';

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
 * Converts DD/MM date string to Date object (using current or next year).
 */
function ddmmToDate(ddmm: string): Date {
  const [day, month] = ddmm.split('/').map(Number);
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), month - 1, day);
  // If the date is in the past, use next year
  if (thisYear < now) {
    return new Date(now.getFullYear() + 1, month - 1, day);
  }
  return thisYear;
}

/**
 * Formats a date for display in preview.
 */
function formatPreviewDate(ddmm: string): string {
  const date = ddmmToDate(ddmm);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
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

/**
 * Converts HH:MM to HHMM format.
 */
function colonTimeToHHMM(colonTime: string): string {
  return colonTime.replace(':', '');
}

/**
 * Formats HHMM or HH:MM time for display.
 */
function formatTimeDisplay(time: string): string {
  const clean = time.replace(':', '');
  if (clean.length < 4) return time;
  const hour = parseInt(clean.slice(0, 2));
  const minute = clean.slice(2, 4);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minute} ${ampm}`;
}

// Hours ordered by working hours first (08-18), then evening (19-23), then early morning (00-07)
const HOURS = [
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
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

  // Determine initial step based on whether editing
  const getInitialStep = (): ModalStep => {
    if (isEditing) {
      // When editing, go directly to the appropriate form
      return editingEvent.eventType === 'upgrading' ? 'upgrading-preview' : 'custom-form';
    }
    return 'type-select';
  };

  const [step, setStep] = useState<ModalStep>(getInitialStep);

  // Selected upgrading course
  const [selectedCourse, setSelectedCourse] = useState<UpgradingCourse | null>(null);

  // Custom event form state
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
  const [description, setDescription] = useState(() => editingEvent?.description || '');
  const [venue, setVenue] = useState(() => editingEvent?.venue || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Type selection handlers
  const handleSelectCustom = useCallback(() => {
    setStep('custom-form');
  }, []);

  const handleSelectUpgrading = useCallback(() => {
    setStep('upgrading-select');
  }, []);

  // Upgrading course selection
  const handleCourseSelect = useCallback((course: UpgradingCourse) => {
    setSelectedCourse(course);
    setStep('upgrading-preview');
  }, []);

  // Back navigation
  const handleBack = useCallback(() => {
    if (step === 'custom-form' || step === 'upgrading-select') {
      setStep('type-select');
    } else if (step === 'upgrading-preview' && !isEditing) {
      setStep('upgrading-select');
      setSelectedCourse(null);
    }
  }, [step, isEditing]);

  // Custom form handlers
  const handleDateChange = useCallback((dates: Date | [Date | null, Date | null] | null) => {
    if (!dates) return;
    if (Array.isArray(dates)) return;
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

  // Submit custom event
  const handleSubmitCustom = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (selectedDates.length === 0) {
      newErrors.dates = 'At least one date is required';
    }
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
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());

    const eventInput: CustomEventInput = {
      dates: sortedDates.map((d) => dateToIso(d)),
      day: getDayOfWeek(sortedDates[0]),
      startTime: timeValueToString(startTime),
      endTime: timeValueToString(endTime),
      eventType: 'custom' as CustomEventType,
      description: description.trim(),
      course: 'Custom',
      group: '',
      venue: venue.trim(),
      tutor: '',
    };

    onSave(eventInput);
  }, [selectedDates, startTime, endTime, description, venue, onSave]);

  // Submit upgrading course
  const handleSubmitUpgrading = useCallback(() => {
    if (!selectedCourse) return;

    // Convert sessions to dates in YYYY-MM-DD format
    const dates = selectedCourse.sessions.map((s) => {
      const date = ddmmToDate(s.date);
      return dateToIso(date);
    });

    // Use first session's time (they might vary, but we take the first)
    const firstSession = selectedCourse.sessions[0];

    const eventInput: CustomEventInput = {
      dates,
      day: getDayOfWeek(ddmmToDate(firstSession.date)),
      startTime: colonTimeToHHMM(firstSession.startTime),
      endTime: colonTimeToHHMM(firstSession.endTime),
      eventType: 'upgrading' as CustomEventType,
      description: selectedCourse.courseName,
      course: '', // Not displayed for upgrading events
      group: 'Upgrading',
      venue: firstSession.venue,
      tutor: firstSession.tutor,
    };

    onSave(eventInput);
  }, [selectedCourse, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Render type selection screen
  const renderTypeSelect = () => (
    <>
      <div className={styles.header}>
        <h3>Add Event</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className={styles.content}>
        <p className={styles.typeSelectHint}>What would you like to add?</p>

        <div className={styles.typeSelectOptions}>
          <button className={styles.typeSelectBtn} onClick={handleSelectUpgrading}>
            <span className={styles.typeSelectBtnTitle}>Content Upgrading Course</span>
            <span className={styles.typeSelectBtnDesc}>
              Select from available upgrading courses
            </span>
          </button>

          <button className={styles.typeSelectBtn} onClick={handleSelectCustom}>
            <span className={styles.typeSelectBtnTitle}>Custom Event</span>
            <span className={styles.typeSelectBtnDesc}>Create a personal event manually</span>
          </button>
        </div>
      </div>
    </>
  );

  // Render upgrading course selection
  const renderUpgradingSelect = () => (
    <>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeft size={18} />
        </button>
        <h3>Select Upgrading Course</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className={styles.content}>
        {UPGRADING_COURSES.length === 0 ? (
          <div className={styles.noCoursesMessage}>
            <p>No upgrading courses available yet.</p>
            <p className={styles.noCoursesHint}>
              Courses will be added as they become available. You can help by contributing your
              schedule!
            </p>
          </div>
        ) : (
          <div className={styles.courseList}>
            {UPGRADING_COURSES.map((course) => (
              <button
                key={course.courseName}
                className={styles.courseListItem}
                onClick={() => handleCourseSelect(course)}
              >
                <span className={styles.courseName}>{course.courseName}</span>
                <span className={styles.sessionCount}>{course.sessions.length} sessions</span>
              </button>
            ))}
          </div>
        )}

        <a
          href={CONTRIBUTION_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.notListedLink}
        >
          <span>My course is not listed</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </>
  );

  // Render upgrading course preview
  const renderUpgradingPreview = () => {
    const course = selectedCourse;
    if (!course) return null;

    return (
      <>
        <div className={styles.header}>
          {!isEditing && (
            <button className={styles.backBtn} onClick={handleBack}>
              <ArrowLeft size={18} />
            </button>
          )}
          <h3>{isEditing ? 'Upgrading Course' : 'Preview'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.previewHeader}>
            <span className={styles.previewName}>{course.courseName}</span>
          </div>

          <div className={styles.previewSessions}>
            <label className={styles.label}>Sessions ({course.sessions.length})</label>
            <div className={styles.sessionList}>
              {course.sessions.map((session, i) => (
                <div key={i} className={styles.sessionItem}>
                  <span className={styles.sessionDate}>{formatPreviewDate(session.date)}</span>
                  <span className={styles.sessionTime}>
                    {formatTimeDisplay(session.startTime)} - {formatTimeDisplay(session.endTime)}
                  </span>
                  {session.venue && <span className={styles.sessionVenue}>{session.venue}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          {!isEditing && (
            <button className={styles.saveBtn} onClick={handleSubmitUpgrading}>
              Add to Timetable
            </button>
          )}
        </div>
      </>
    );
  };

  // Render custom event form
  const renderCustomForm = () => (
    <>
      <div className={styles.header}>
        {!isEditing && (
          <button className={styles.backBtn} onClick={handleBack}>
            <ArrowLeft size={18} />
          </button>
        )}
        <h3>{isEditing ? 'Edit Custom Event' : 'Custom Event'}</h3>
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
              dayClassName={(date: Date) =>
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

        {/* Venue (optional) */}
        <div className={styles.field}>
          <label className={styles.label}>
            Location <span className={styles.optionalHint}>(optional)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g., 7-01-TR703"
          />
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
            placeholder="e.g., Study group meeting"
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
                <span className={styles.charCounterHint}>(suggested: {DESCRIPTION_SUGGESTED})</span>
              )}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button className={styles.saveBtn} onClick={handleSubmitCustom}>
          {isEditing ? 'Save Changes' : 'Add Event'}
        </button>
      </div>
    </>
  );

  return (
    <div className={styles.overlay} onKeyDown={handleKeyDown}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {step === 'type-select' && renderTypeSelect()}
        {step === 'custom-form' && renderCustomForm()}
        {step === 'upgrading-select' && renderUpgradingSelect()}
        {step === 'upgrading-preview' && renderUpgradingPreview()}
      </div>
    </div>
  );
}
