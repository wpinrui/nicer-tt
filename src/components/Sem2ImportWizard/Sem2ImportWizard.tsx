import { Check, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { TimetableEvent } from '../../types';
import { parseHtmlTimetable } from '../../utils/parseHtml';
import styles from './Sem2ImportWizard.module.scss';

/** Result of a successful import, used to fill the confirmation summary. */
export interface Sem2ImportResult {
  newName: string;
  oldName: string;
}

interface Sem2ImportWizardProps {
  /**
   * Called when the user's file parses successfully. The parent adds the new
   * timetable alongside the old one, switches to it, renames the old with an
   * "(Old)" suffix, and returns both names for the confirmation step.
   */
  onImport: (events: TimetableEvent[], fileName: string) => Sem2ImportResult;
  /** Close the wizard (Cancel, ✕, or Done). */
  onClose: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

interface Shot {
  src: string;
  cap: string;
  sub: string;
}

const STEP1_SHOTS: Shot[] = [
  { src: '/guide/launchpad search.png', cap: 'Search "timetable"', sub: 'and the Service result' },
  { src: '/guide/timetable loading.png', cap: 'Opens in a new tab', sub: 'signing you in' },
];

const STEP2_SHOTS: Shot[] = [
  { src: '/guide/timetable page.png', cap: 'Your timetable', sub: 'the page you save' },
  { src: '/guide/save as.png', cap: 'Save as', sub: 'Webpage, HTML Only' },
];

export function Sem2ImportWizard({ onImport, onClose }: Sem2ImportWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [parseFailed, setParseFailed] = useState(false);
  const [result, setResult] = useState<Sem2ImportResult | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
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

  const renderShots = (shots: Shot[]) => (
    <div className={styles.shotGrid}>
      {shots.map((shot) => (
        <button
          key={shot.src}
          type="button"
          className={styles.shot}
          onClick={() => setLightbox(shot.src)}
        >
          <img src={shot.src} alt={shot.cap} />
          <span className={styles.shotCap}>{shot.cap}</span>
          <span className={styles.shotSub}>{shot.sub}</span>
        </button>
      ))}
    </div>
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
          <div className={styles.dots}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const n = i + 1;
              const cls =
                n < step ? styles.dotDone : n === step ? styles.dotActive : styles.dotIdle;
              return <span key={n} className={`${styles.dot} ${cls}`} />;
            })}
          </div>
          <div className={styles.count}>
            Step {step} of {TOTAL_STEPS}
          </div>
        </div>

        <div className={`${styles.body} ${step === 4 ? styles.center : ''}`}>
          {step === 1 && (
            <>
              <p className={styles.lead}>
                NIE recently changed where your timetable lives. Here's the new way to find it:
              </p>
              <ol className={styles.substeps}>
                <li>
                  Go to <span className={styles.strong}>launchpad.nie.edu.sg</span> and sign in.
                </li>
                <li>
                  In the <span className={styles.strong}>search box</span> (top-right), type{' '}
                  <span className={styles.strong}>"timetable"</span>.
                </li>
                <li>
                  Open the first result tagged <span className={styles.pillTag}>Service</span>:{' '}
                  <span className={styles.strong}>ISAAC Student Timetable</span>. It opens in a new
                  tab.
                </li>
              </ol>
              {renderShots(STEP1_SHOTS)}
            </>
          )}

          {step === 2 && (
            <>
              <p className={styles.lead}>
                Once your timetable has loaded in the new tab, save it to your device:
              </p>
              <ol className={styles.substeps}>
                <li>
                  Press <kbd>Ctrl</kbd>+<kbd>S</kbd> (or <kbd>Cmd</kbd>+<kbd>S</kbd> on Mac).
                </li>
                <li>
                  If asked, choose <span className={styles.strong}>"Webpage, HTML Only"</span> and
                  save. Remember where it goes (usually your{' '}
                  <span className={styles.strong}>Downloads</span> folder).
                </li>
              </ol>
              {renderShots(STEP2_SHOTS)}
            </>
          )}

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
              {parseFailed ? (
                <div className={`${styles.banner} ${styles.bannerError}`}>
                  <span>
                    We couldn't find a timetable in that file. Make sure you saved the{' '}
                    <strong>ISAAC Student Timetable</strong> page as "Webpage, HTML Only", then try
                    again.
                  </span>
                </div>
              ) : (
                <div className={`${styles.banner} ${styles.bannerInfo}`}>
                  <span>
                    Your file is read right here in your browser. Nothing is uploaded to any server.
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

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
          <img src={lightbox} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>,
    document.body
  );
}
