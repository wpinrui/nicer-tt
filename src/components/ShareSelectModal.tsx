import { useState } from 'react';
import { Share2 } from 'lucide-react';
import type { Timetable } from '../utils/parseHtml';
import { Modal } from './Modal';

interface ShareSelectModalProps {
  timetables: Timetable[];
  onShare: (timetable: Timetable) => void;
  onClose: () => void;
}

export function ShareSelectModal({ timetables, onShare, onClose }: ShareSelectModalProps) {
  const [selectedId, setSelectedId] = useState<string>(timetables[0]?.id || '');

  const handleShare = () => {
    const timetable = timetables.find(t => t.id === selectedId);
    if (timetable) {
      onShare(timetable);
    }
  };

  return (
    <Modal
      title="Share Timetable"
      onClose={onClose}
      onConfirm={handleShare}
      confirmText={<><Share2 size={14} /> Copy Share Link</>}
      confirmVariant="primary"
    >
      <p>Which timetable would you like to share?</p>
      <div className="share-select-list">
        {timetables.map((timetable) => (
          <label key={timetable.id} className="share-select-item">
            <input
              type="radio"
              name="share-timetable"
              value={timetable.id}
              checked={selectedId === timetable.id}
              onChange={() => setSelectedId(timetable.id)}
            />
            <span className="share-select-name">
              {timetable.name}
              {timetable.isPrimary && <span className="share-select-badge">You</span>}
            </span>
          </label>
        ))}
      </div>
    </Modal>
  );
}
