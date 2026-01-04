import { useState } from 'react';

import { TimeDropdown } from './AddEventModal/TimeDropdown';
import {
  HOURS,
  MINUTES,
  parseTimeString,
  timeValueToString,
  type TimeValue,
} from './AddEventModal/utils';
import styles from './AddEventModal/AddEventModal.module.scss';
import type { EventOverride } from '../types';
import { Modal } from './Modal';

interface EditEventModalProps {
  currentVenue: string;
  currentTutor: string;
  currentStartTime: string;
  currentEndTime: string;
  onConfirm: (override: Omit<EventOverride, 'updatedAt'>) => void;
  onCancel: () => void;
  onRevert?: () => void;
  isEdited?: boolean;
}

export function EditVenueModal({
  currentVenue,
  currentTutor,
  currentStartTime,
  currentEndTime,
  onConfirm,
  onCancel,
  onRevert,
  isEdited = false,
}: EditEventModalProps) {
  const [venue, setVenue] = useState(currentVenue);
  const [tutor, setTutor] = useState(currentTutor);
  const [startTime, setStartTime] = useState<TimeValue | null>(() =>
    parseTimeString(currentStartTime)
  );
  const [endTime, setEndTime] = useState<TimeValue | null>(() => parseTimeString(currentEndTime));

  const handleConfirm = () => {
    const trimmedVenue = venue.trim();
    const trimmedTutor = tutor.trim();
    const newStartTime = timeValueToString(startTime);
    const newEndTime = timeValueToString(endTime);

    const override: Omit<EventOverride, 'updatedAt'> = {};

    // Only include fields that have changed
    if (trimmedVenue !== currentVenue) {
      override.venue = trimmedVenue;
    }
    if (trimmedTutor !== currentTutor) {
      override.tutor = trimmedTutor;
    }
    if (newStartTime !== currentStartTime) {
      override.startTime = newStartTime;
    }
    if (newEndTime !== currentEndTime) {
      override.endTime = newEndTime;
    }

    // If something changed, confirm; otherwise just cancel
    if (Object.keys(override).length > 0) {
      onConfirm(override);
    } else {
      onCancel();
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    background: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
  };

  return (
    <Modal
      title="Edit Event"
      onClose={onCancel}
      onConfirm={handleConfirm}
      confirmText="Save"
      confirmVariant="primary"
      onSecondary={isEdited ? onRevert : undefined}
      secondaryText={isEdited ? 'Revert to Original' : undefined}
    >
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="venue-input"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}
        >
          Venue
        </label>
        <input
          id="venue-input"
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          style={inputStyle}
          autoFocus
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="tutor-input"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}
        >
          Tutor
        </label>
        <input
          id="tutor-input"
          type="text"
          value={tutor}
          onChange={(e) => setTutor(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Start Time
          </label>
          <div className={styles.timeSelect}>
            <TimeDropdown
              value={startTime?.hour || ''}
              options={HOURS}
              placeholder="HH"
              onChange={(hour) => setStartTime({ hour, minute: startTime?.minute || '00' })}
            />
            <span className={styles.timeSeparator}>:</span>
            <TimeDropdown
              value={startTime?.minute || ''}
              options={MINUTES}
              placeholder="MM"
              onChange={(minute) => setStartTime({ hour: startTime?.hour || '08', minute })}
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            End Time
          </label>
          <div className={styles.timeSelect}>
            <TimeDropdown
              value={endTime?.hour || ''}
              options={HOURS}
              placeholder="HH"
              onChange={(hour) => setEndTime({ hour, minute: endTime?.minute || '00' })}
            />
            <span className={styles.timeSeparator}>:</span>
            <TimeDropdown
              value={endTime?.minute || ''}
              options={MINUTES}
              placeholder="MM"
              onChange={(minute) => setEndTime({ hour: endTime?.hour || '10', minute })}
            />
          </div>
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        This change is local only and won't affect the original NIE timetable.
      </p>
    </Modal>
  );
}
