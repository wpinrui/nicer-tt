import 'react-datepicker/dist/react-datepicker.css';

import { X } from 'lucide-react';
import { forwardRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';

import styles from './AddEventModal.module.scss';
import { ModalHeader } from './ModalHeader';
import { TimeDropdown } from './TimeDropdown';
import {
  CURRENT_YEAR,
  DESCRIPTION_MAX,
  DESCRIPTION_SUGGESTED,
  HOURS,
  MINUTES,
  type TimeValue,
} from './utils';

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

interface CustomFormStepProps {
  isEditing: boolean;
  selectedDates: Date[];
  startTime: TimeValue | null;
  endTime: TimeValue | null;
  description: string;
  venue: string;
  errors: Record<string, string>;
  onClose: () => void;
  onBack?: () => void;
  onDateChange: (dates: Date | [Date | null, Date | null] | null) => void;
  onRemoveDate: (date: Date) => void;
  onStartTimeChange: (time: TimeValue) => void;
  onEndTimeChange: (time: TimeValue) => void;
  onDescriptionChange: (value: string) => void;
  onVenueChange: (value: string) => void;
  onClearError: (field: string) => void;
  onSubmit: () => void;
}

export function CustomFormStep({
  isEditing,
  selectedDates,
  startTime,
  endTime,
  description,
  venue,
  errors,
  onClose,
  onBack,
  onDateChange,
  onRemoveDate,
  onStartTimeChange,
  onEndTimeChange,
  onDescriptionChange,
  onVenueChange,
  onClearError,
  onSubmit,
}: CustomFormStepProps) {
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

  return (
    <>
      <ModalHeader
        title={isEditing ? 'Edit Custom Event' : 'Custom Event'}
        onClose={onClose}
        onBack={!isEditing ? onBack : undefined}
      />

      <div className={styles.content}>
        {/* Date picker section */}
        <div className={styles.field}>
          <label className={styles.label}>Select Dates</label>

          <div className={styles.datePickerWrapper}>
            <DatePicker
              selected={null}
              onChange={onDateChange}
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
                    onClick={() => onRemoveDate(date)}
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
                  onStartTimeChange({ hour, minute: startTime?.minute || '00' });
                  onClearError('startTime');
                }}
              />
              <span className={styles.timeSeparator}>:</span>
              <TimeDropdown
                value={startTime?.minute || ''}
                options={MINUTES}
                placeholder="MM"
                onChange={(minute) => {
                  onStartTimeChange({ hour: startTime?.hour || '08', minute });
                  onClearError('startTime');
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
                  onEndTimeChange({ hour, minute: endTime?.minute || '00' });
                  onClearError('endTime');
                }}
              />
              <span className={styles.timeSeparator}>:</span>
              <TimeDropdown
                value={endTime?.minute || ''}
                options={MINUTES}
                placeholder="MM"
                onChange={(minute) => {
                  onEndTimeChange({ hour: endTime?.hour || '10', minute });
                  onClearError('endTime');
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
            onChange={(e) => onVenueChange(e.target.value)}
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
                onDescriptionChange(e.target.value);
                onClearError('description');
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
        <button className={styles.saveBtn} onClick={onSubmit}>
          {isEditing ? 'Save Changes' : 'Add Event'}
        </button>
      </div>
    </>
  );
}
