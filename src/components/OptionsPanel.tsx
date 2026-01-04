import { ExternalLink, HelpCircle, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import type { CustomEventInput } from '../hooks/useCustomEvents';
import type { EventInstanceKey, EventOverride, Timetable, TimetableEvent } from '../types';
import { Modal } from './Modal';
import { AppSettings, BackgroundSettings, PrivacySection, TimetableManager } from './options';
import styles from './OptionsPanel.module.scss';

interface OptionsPanelProps {
  darkMode: boolean;
  showTutor: boolean;
  onClose: () => void;
  onDarkModeChange: (value: boolean) => void;
  onShowTutorChange: (value: boolean) => void;
  onShowPrivacy: () => void;
  // Timetable management
  timetables: Timetable[];
  activeTimetableId: string | null;
  onSetActiveTimetable: (id: string) => void;
  onSetPrimaryTimetable: (id: string) => void;
  onAddTimetable: (
    events: TimetableEvent[],
    fileName: string | null,
    customName?: string
  ) => string;
  onAddCustomEventsToTimetable: (timetableId: string, event: CustomEventInput) => void;
  onRenameTimetable: (id: string, newName: string) => void;
  onDeleteTimetable: (id: string) => boolean;
  onViewingToast: (name: string) => void;
  onRegenerateTimetable?: (events: TimetableEvent[], fileName: string) => void;
  /** Current events for backup download before regenerating */
  currentEvents?: TimetableEvent[];
  /** Event overrides for ICS export */
  overrides?: Record<EventInstanceKey, EventOverride>;
  /** Deleted event keys for ICS export */
  deletions?: EventInstanceKey[];
}

export function OptionsPanel({
  darkMode,
  showTutor,
  onClose,
  onDarkModeChange,
  onShowTutorChange,
  onShowPrivacy,
  timetables,
  activeTimetableId,
  onSetActiveTimetable,
  onSetPrimaryTimetable,
  onAddTimetable,
  onAddCustomEventsToTimetable,
  onRenameTimetable,
  onDeleteTimetable,
  onViewingToast,
  onRegenerateTimetable,
  currentEvents,
  overrides,
  deletions,
}: OptionsPanelProps) {
  const [showFactoryReset, setShowFactoryReset] = useState(false);

  const confirmFactoryReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Options</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          <AppSettings
            darkMode={darkMode}
            showTutor={showTutor}
            onDarkModeChange={onDarkModeChange}
            onShowTutorChange={onShowTutorChange}
          />

          <TimetableManager
            timetables={timetables}
            activeTimetableId={activeTimetableId}
            onSetActiveTimetable={onSetActiveTimetable}
            onSetPrimaryTimetable={onSetPrimaryTimetable}
            onAddTimetable={onAddTimetable}
            onAddCustomEventsToTimetable={onAddCustomEventsToTimetable}
            onRenameTimetable={onRenameTimetable}
            onDeleteTimetable={onDeleteTimetable}
            onViewingToast={onViewingToast}
            onClose={onClose}
            onRegenerateTimetable={onRegenerateTimetable}
            currentEvents={currentEvents}
            overrides={overrides}
            deletions={deletions}
          />

          <BackgroundSettings />

          <PrivacySection onShowPrivacy={onShowPrivacy} />

          <div className={styles.section}>
            <h4>Help</h4>
            <p className={styles.privacyDesc}>
              Version {__APP_VERSION__}. Refer to the User Guide for usage instructions.
            </p>
            <div className={styles.buttons}>
              <a
                href="https://github.com/wpinrui/nicer-tt/blob/main/GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btn}
              >
                <HelpCircle size={14} /> User Guide <ExternalLink size={12} />
              </a>
              <a
                href="https://github.com/wpinrui/nicer-tt/issues"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btn}
              >
                <ExternalLink size={14} /> Report an issue
              </a>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => setShowFactoryReset(true)}
              >
                <RotateCcw size={14} /> Factory Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Factory reset confirmation modal */}
      {showFactoryReset && (
        <Modal
          title="Factory Reset"
          onClose={() => setShowFactoryReset(false)}
          onConfirm={confirmFactoryReset}
          confirmText="Reset Everything"
          confirmVariant="danger"
        >
          <p>This will clear ALL your data including timetables, settings, and preferences.</p>
          <p>
            <strong>This cannot be undone.</strong>
          </p>
        </Modal>
      )}
    </div>,
    document.body
  );
}
