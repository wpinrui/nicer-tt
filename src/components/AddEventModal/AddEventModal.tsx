import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

import type { CustomEventInput } from '../../hooks/useCustomEvents';
import type { CustomEvent, CustomEventType, UpgradingCourse } from '../../types';
import styles from './AddEventModal.module.scss';
import { CustomFormStep } from './CustomFormStep';
import { TypeSelectStep } from './TypeSelectStep';
import { UpgradingPreviewStep } from './UpgradingPreviewStep';
import { UpgradingSelectStep } from './UpgradingSelectStep';
import {
  colonTimeToHHMM,
  dateToIso,
  ddmmToDate,
  getDayOfWeek,
  isoToDate,
  parseTimeString,
  type TimeValue,
  timeValueToString,
} from './utils';

type ModalStep = 'type-select' | 'custom-form' | 'upgrading-select' | 'upgrading-preview';

interface AddEventModalProps {
  onClose: () => void;
  onSave: (event: CustomEventInput) => void;
  editingEvent?: CustomEvent | null;
}

export function AddEventModal({ onClose, onSave, editingEvent }: AddEventModalProps) {
  const isEditing = !!editingEvent;

  // Determine initial step based on whether editing
  const getInitialStep = (): ModalStep => {
    if (isEditing) {
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

  // Navigation handlers
  const handleSelectCustom = useCallback(() => setStep('custom-form'), []);
  const handleSelectUpgrading = useCallback(() => setStep('upgrading-select'), []);

  const handleCourseSelect = useCallback((course: UpgradingCourse) => {
    setSelectedCourse(course);
    setStep('upgrading-preview');
  }, []);

  const handleBack = useCallback(() => {
    if (step === 'custom-form' || step === 'upgrading-select') {
      setStep('type-select');
    } else if (step === 'upgrading-preview' && !isEditing) {
      setStep('upgrading-select');
      setSelectedCourse(null);
    }
  }, [step, isEditing]);

  // Date handlers
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

  const handleRemoveDate = useCallback((dateToRemove: Date) => {
    setSelectedDates((prev) =>
      prev.filter(
        (d) =>
          d.getFullYear() !== dateToRemove.getFullYear() ||
          d.getMonth() !== dateToRemove.getMonth() ||
          d.getDate() !== dateToRemove.getDate()
      )
    );
  }, []);

  // Form field handlers
  const handleStartTimeChange = useCallback((time: TimeValue) => setStartTime(time), []);
  const handleEndTimeChange = useCallback((time: TimeValue) => setEndTime(time), []);
  const handleDescriptionChange = useCallback((value: string) => setDescription(value), []);
  const handleVenueChange = useCallback((value: string) => setVenue(value), []);
  const handleClearError = useCallback(
    (field: string) => setErrors((prev) => ({ ...prev, [field]: '' })),
    []
  );

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

    const dates = selectedCourse.sessions.map((s) => {
      const date = ddmmToDate(s.date);
      return dateToIso(date);
    });

    const firstSession = selectedCourse.sessions[0];

    const eventInput: CustomEventInput = {
      dates,
      day: getDayOfWeek(ddmmToDate(firstSession.date)),
      startTime: colonTimeToHHMM(firstSession.startTime),
      endTime: colonTimeToHHMM(firstSession.endTime),
      eventType: 'upgrading' as CustomEventType,
      description: selectedCourse.courseName,
      course: '',
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

  return createPortal(
    <div className={styles.overlay} onKeyDown={handleKeyDown}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {step === 'type-select' && (
          <TypeSelectStep
            onClose={onClose}
            onSelectCustom={handleSelectCustom}
            onSelectUpgrading={handleSelectUpgrading}
          />
        )}

        {step === 'custom-form' && (
          <CustomFormStep
            isEditing={isEditing}
            selectedDates={selectedDates}
            startTime={startTime}
            endTime={endTime}
            description={description}
            venue={venue}
            errors={errors}
            onClose={onClose}
            onBack={!isEditing ? handleBack : undefined}
            onDateChange={handleDateChange}
            onRemoveDate={handleRemoveDate}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onDescriptionChange={handleDescriptionChange}
            onVenueChange={handleVenueChange}
            onClearError={handleClearError}
            onSubmit={handleSubmitCustom}
          />
        )}

        {step === 'upgrading-select' && (
          <UpgradingSelectStep
            onClose={onClose}
            onBack={handleBack}
            onCourseSelect={handleCourseSelect}
          />
        )}

        {step === 'upgrading-preview' && selectedCourse && (
          <UpgradingPreviewStep
            course={selectedCourse}
            isEditing={isEditing}
            onClose={onClose}
            onBack={!isEditing ? handleBack : undefined}
            onSubmit={handleSubmitUpgrading}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
