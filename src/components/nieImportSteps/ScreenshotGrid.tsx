import { X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './ScreenshotGrid.module.scss';

export interface Shot {
  src: string;
  cap: string;
  sub: string;
}

interface ScreenshotGridProps {
  shots: Shot[];
  /** Smaller thumbnails, for space-constrained contexts like the inline HelpPage stepper. */
  compact?: boolean;
}

/** Grid of screenshot thumbnails with click-to-enlarge lightbox. Shared by the wizard and the HelpPage stepper. */
export function ScreenshotGrid({ shots, compact = false }: ScreenshotGridProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <div className={`${styles.grid} ${compact ? styles.compact : ''}`}>
        {shots.map((shot) => (
          <button
            key={shot.src}
            type="button"
            className={styles.shot}
            onClick={() => setLightbox(shot.src)}
          >
            <img src={shot.src} alt={shot.cap} />
            <span className={styles.cap}>{shot.cap}</span>
            <span className={styles.sub}>{shot.sub}</span>
          </button>
        ))}
      </div>
      {lightbox &&
        createPortal(
          <div className={styles.lightbox} onClick={() => setLightbox(null)}>
            <button
              className={styles.lightboxClose}
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <img src={lightbox} alt="" onClick={(e) => e.stopPropagation()} />
          </div>,
          document.body
        )}
    </>
  );
}
