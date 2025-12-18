import { useState } from 'react';
import { Share2 } from 'lucide-react';
import type { Timetable } from '../utils/parseHtml';
import { Modal } from './Modal';
import styles from './ShareSelectModal.module.scss';

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
      <div className={styles.list}>
        {timetables.map((timetable) => (
          <label key={timetable.id} className={styles.item}>
            <input
              type="radio"
              name="share-timetable"
              value={timetable.id}
              checked={selectedId === timetable.id}
              onChange={() => setSelectedId(timetable.id)}
            />
            <span className={styles.name}>
              {timetable.name}
              {timetable.isPrimary && <span className={styles.badge}>You</span>}
            </span>
          </label>
        ))}
      </div>
    </Modal>
  );
}
