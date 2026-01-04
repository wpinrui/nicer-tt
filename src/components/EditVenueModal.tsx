import { useState } from 'react';

import { Modal } from './Modal';

interface EditVenueModalProps {
  currentVenue: string;
  onConfirm: (newVenue: string) => void;
  onCancel: () => void;
  onRevert?: () => void;
  isEdited?: boolean;
}

export function EditVenueModal({
  currentVenue,
  onConfirm,
  onCancel,
  onRevert,
  isEdited = false,
}: EditVenueModalProps) {
  const [venue, setVenue] = useState(currentVenue);

  const handleConfirm = () => {
    const trimmed = venue.trim();
    if (trimmed && trimmed !== currentVenue) {
      onConfirm(trimmed);
    } else {
      onCancel();
    }
  };

  return (
    <Modal
      title="Edit Venue"
      onClose={onCancel}
      onConfirm={handleConfirm}
      confirmText="Save"
      confirmVariant="primary"
      onSecondary={isEdited ? onRevert : undefined}
      secondaryText={isEdited ? 'Revert to Original' : undefined}
    >
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="venue-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
          Venue
        </label>
        <input
          id="venue-input"
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '1rem',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
          }}
          autoFocus
        />
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        This change is local only and won't affect the original NIE timetable.
      </p>
    </Modal>
  );
}
