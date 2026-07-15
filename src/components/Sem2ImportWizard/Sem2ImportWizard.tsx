import { Check, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { TimetableEvent } from '../../types';
import { parseHtmlTimetable } from '../../utils/parseHtml';
import { LaunchpadStepBody, SavePageStepBody, StepProgress } from '../nieImportSteps';
import styles from './Sem2ImportWizard.module.scss';

/** Result of a successful import, used to fill the confirmation summary. */
export interface Sem2ImportResult {
  newName: string;
  oldName: string;
}

interface Sem2ImportWizardProps {
  /**
   * Called when the user's file parses successfully. The parent adds the new
   * timetable alongside the old one, switches to it, makes it primary, renames
   * the old with an "(Old)" suffix, and returns both names for the confirmation step.
   */
  onImport: (events: TimetableEvent[], fileName: string) => Sem2ImportResult;
  /** Close the wizard (Cancel, ✕, or Done). */
  onClose: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

export function Sem2ImportWizard({ onImport, onClose }: Sem2ImportWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [parseFailed, setParseFailed] = useState(false);
  const [result, setResult] = useState<Sem2ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      try {
        const text = await file.text();
        const events = parseHtmlTimetable(text);
        const importResult = onImport(events, file.name);
        setParseFailed(false);
        setResult(importResult);
        setStep(4);
      } catch {
        setParseFailed(true);
      }
    },
    [onImport]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await processFile(e.target.files?.[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      void processFile(e.dataTransfer.files?.[0]);
    },
    [processFile]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  return createPortal(
    <div className={styles.overlay} onKeyDown={handleKeyDown}>
      <div className={styles.wizard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <div className={styles.eyebrow}>{step === 4 ? 'All done' : 'Add Semester 2'}</div>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>
              {step === 1 && 'Open your timetable on NIE Launchpad'}
              {step === 2 && 'Save the page as a file'}
              {step === 3 && 'Upload the file here'}
              {step === 4 && "You're all set!"}
            </h3>
            <button className={styles.x} onClick={onClose} title="Close" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <StepProgress current={step} total={TOTAL_STEPS} />
        </div>

        <div className={`${styles.body} ${step === 4 ? styles.center : ''}`}>
          {step === 1 && <LaunchpadStepBody />}
          {step === 2 && <SavePageStepBody />}

          {step === 3 && (
            <>
              <p className={styles.lead}>Now bring that saved file back into NIcEr Timetable.</p>
              <button
                type="button"
                className={`${styles.drop} ${parseFailed ? styles.dropError : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className={styles.dropIcon}>
                  {parseFailed ? <X size={26} /> : <Upload size={26} />}
                </div>
                <div className={styles.dropTitle}>
                  {parseFailed ? 'Try another file' : 'Choose your timetable file'}
                </div>
                <div className={styles.dropSub}>
                  or drag &amp; drop the <strong>.html</strong> file you just saved
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                onChange={handleFileChange}
                className={styles.hiddenInput}
              />
              {parseFailed && (
                <div className={styles.bannerError}>
                  <span>
                    We couldn't find a timetable in that file. Make sure you saved the{' '}
                    <strong>ISAAC Student Timetable</strong> page as "Webpage, HTML Only", then try
                    again.
                  </span>
                </div>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <div className={styles.successGlyph}>
                <Check size={30} />
              </div>
              <p className={styles.lead} style={{ textAlign: 'center' }}>
                Your new timetable is now active. We kept your old one safe, so nothing was lost.
              </p>
              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Now showing</span>
                  <span className={styles.summaryVal}>
                    {result?.newName ?? 'New timetable'}{' '}
                    <span className={styles.ttBadge}>Active</span>
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Kept</span>
                  <span className={styles.summaryVal}>
                    {result?.oldName ?? 'Previous timetable'}{' '}
                    <span className={`${styles.ttBadge} ${styles.ttBadgeMuted}`}>Saved</span>
                  </span>
                </div>
              </div>
              <p className={styles.hint}>
                Don't need the old one? Remove it anytime from <strong>Options → Timetables</strong>
                .
              </p>
            </>
          )}
        </div>

        <div className={styles.foot}>
          {step === 1 && (
            <>
              <span className={styles.grow} />
              <button className={styles.ghostBtn} onClick={onClose}>
                Cancel
              </button>
              <button className={styles.primaryBtn} onClick={() => setStep(2)}>
                Next
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button className={styles.ghostBtn} onClick={() => setStep(1)}>
                Back
              </button>
              <span className={styles.grow} />
              <button className={styles.primaryBtn} onClick={() => setStep(3)}>
                Next
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button
                className={styles.ghostBtn}
                onClick={() => {
                  setParseFailed(false);
                  setStep(2);
                }}
              >
                Back
              </button>
              <span className={styles.grow} />
            </>
          )}
          {step === 4 && (
            <>
              <span className={styles.grow} />
              <button className={styles.primaryBtn} onClick={onClose}>
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
