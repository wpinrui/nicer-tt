import { FileText, Upload } from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import type { TimetableEvent } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { parseHtmlTimetable } from '../utils/parseHtml';
import { parseIcs } from '../utils/parseIcs';
import styles from './UploadSection.module.scss';

interface UploadSectionProps {
  onUpload: (events: TimetableEvent[], fileName: string) => void;
  onError: (error: string) => void;
  onClear: () => void;
  onFirstUpload: () => void;
}

export interface UploadSectionHandle {
  triggerUpload: () => void;
}

export const UploadSection = forwardRef<UploadSectionHandle, UploadSectionProps>(
  function UploadSection({ onUpload, onError, onClear, onFirstUpload }, ref) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      triggerUpload: () => fileInputRef.current?.click(),
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const parsedEvents = parseHtmlTimetable(text);
        onUpload(parsedEvents, file.name);

        // Show share welcome modal on first HTML upload
        const hasSeenTip = localStorage.getItem(STORAGE_KEYS.HAS_SEEN_SHARE_TIP);
        if (!hasSeenTip) {
          onFirstUpload();
          localStorage.setItem(STORAGE_KEYS.HAS_SEEN_SHARE_TIP, 'true');
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to parse file');
        onClear();
      }
    };

    const handleIcsFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const parsedEvents = parseIcs(text);
        onUpload(parsedEvents, file.name);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to parse ICS file');
        onClear();
      }
    };

    return (
      <div className={styles.uploadSection}>
        <label className={styles.fileInputLabel}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          <span className={styles.fileButton}>
            <Upload size={18} /> Upload Timetable HTML
          </span>
        </label>
        <div className={styles.uploadDivider}>
          <span>or</span>
        </div>
        <label className={styles.fileInputLabel}>
          <input
            type="file"
            accept=".ics"
            onChange={handleIcsFileChange}
            className={styles.fileInput}
          />
          <span className={`${styles.fileButton} ${styles.fileButtonSecondary}`}>
            <FileText size={18} /> Load Saved ICS
          </span>
        </label>
      </div>
    );
  }
);
