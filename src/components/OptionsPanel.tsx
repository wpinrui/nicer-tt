import { useRef, useState, useEffect } from 'react';
import { X, Upload, RotateCcw, Sun, Moon, Shield, HelpCircle, ExternalLink, Image, Trash2, Link, Pencil, Check, Eye } from 'lucide-react';
import { STORAGE_KEYS, TOAST_DURATION_MS } from '../utils/constants';
import type { Timetable, TimetableEvent } from '../utils/parseHtml';
import { parseHtmlTimetable } from '../utils/parseHtml';
import { parseIcs } from '../utils/parseIcs';
import { decodeShareUrl } from '../utils/shareUtils';
import { Modal } from './Modal';
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
  onAddTimetable: (events: TimetableEvent[], fileName: string | null, customName?: string) => string;
  onRenameTimetable: (id: string, newName: string) => void;
  onDeleteTimetable: (id: string) => boolean;
  onViewingToast: (name: string) => void;
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
  onAddTimetable,
  onRenameTimetable,
  onDeleteTimetable,
  onViewingToast,
}: OptionsPanelProps) {
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Custom background state
  const [customBackground, setCustomBackground] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_BACKGROUND);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [backgroundInput, setBackgroundInput] = useState(() => {
    // Initialize with current background URL (but not if it's 'plain')
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_BACKGROUND);
      if (stored) {
        const value = JSON.parse(stored);
        if (value && value !== 'plain') {
          return value;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return '';
  });
  const [backgroundStatus, setBackgroundStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [backgroundToast, setBackgroundToast] = useState<string | null>(null);

  // Check if using plain background (custom background set to 'plain')
  const isPlainBackground = customBackground === 'plain';

  const handlePlainBackgroundToggle = () => {
    if (isPlainBackground) {
      // Turn off plain background - reset to default
      setCustomBackground(null);
      setBackgroundInput('');
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_BACKGROUND);
    } else {
      // Turn on plain background
      setCustomBackground('plain');
      setBackgroundInput('');
      localStorage.setItem(STORAGE_KEYS.CUSTOM_BACKGROUND, JSON.stringify('plain'));
    }
    window.dispatchEvent(new Event('customBackgroundChange'));
  };

  // Auto-hide toast
  useEffect(() => {
    if (backgroundToast) {
      const timer = setTimeout(() => setBackgroundToast(null), TOAST_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [backgroundToast]);

  // Timetable management state
  const [shareLinkInput, setShareLinkInput] = useState('');
  const [shareLinkError, setShareLinkError] = useState<string | null>(null);
  const [editingTimetableId, setEditingTimetableId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [timetableToast, setTimetableToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; isPrimary: boolean } | null>(null);
  const [showFactoryReset, setShowFactoryReset] = useState(false);

  // Auto-hide timetable toast
  useEffect(() => {
    if (timetableToast) {
      const timer = setTimeout(() => setTimetableToast(null), TOAST_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [timetableToast]);

  const handleAddFromShareLink = () => {
    if (!shareLinkInput.trim()) return;

    const data = decodeShareUrl(shareLinkInput.trim());
    if (!data) {
      setShareLinkError('Invalid share link. Please check the URL and try again.');
      return;
    }

    onAddTimetable(data.events, data.fileName);
    setShareLinkInput('');
    setShareLinkError(null);
    setTimetableToast({ message: 'Timetable added successfully!', type: 'success' });
  };

  const handleAddFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let events: TimetableEvent[];

      if (file.name.toLowerCase().endsWith('.ics')) {
        events = parseIcs(text);
      } else {
        events = parseHtmlTimetable(text);
      }

      onAddTimetable(events, file.name);
      setTimetableToast({ message: 'Timetable added successfully!', type: 'success' });
    } catch (err) {
      setTimetableToast({
        message: err instanceof Error ? err.message : 'Failed to parse file',
        type: 'error'
      });
    }

    // Reset input
    if (addFileInputRef.current) {
      addFileInputRef.current.value = '';
    }
  };

  const handleStartRename = (timetable: Timetable) => {
    setEditingTimetableId(timetable.id);
    setEditingName(timetable.name);
  };

  const handleSaveRename = () => {
    if (editingTimetableId && editingName.trim()) {
      onRenameTimetable(editingTimetableId, editingName.trim());
    }
    setEditingTimetableId(null);
    setEditingName('');
  };

  const handleDeleteTimetable = (id: string, name: string, isPrimary: boolean) => {
    setDeleteConfirm({ id, name, isPrimary });
  };

  const confirmDeleteTimetable = () => {
    if (deleteConfirm) {
      const isLastTimetable = timetables.length === 1;
      const deleted = onDeleteTimetable(deleteConfirm.id);
      if (deleted && isLastTimetable) {
        // Close options panel when last timetable is deleted
        setDeleteConfirm(null);
        onClose();
        return;
      }
      if (deleted) {
        setTimetableToast({ message: `"${deleteConfirm.name}" deleted.`, type: 'success' });
      }
      setDeleteConfirm(null);
    }
  };

  const handleSetActiveTimetable = (id: string, name: string) => {
    onSetActiveTimetable(id);
    onViewingToast(name);
  };

  const validateAndSetBackground = (url: string) => {
    if (!url.trim()) {
      return;
    }

    setBackgroundStatus('loading');
    const img = new window.Image();

    img.onload = () => {
      setBackgroundStatus('success');
      setCustomBackground(url);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_BACKGROUND, JSON.stringify(url));
      window.dispatchEvent(new Event('customBackgroundChange'));
      setBackgroundToast('Background image set successfully!');
    };

    img.onerror = () => {
      setBackgroundStatus('error');
      setBackgroundToast('Failed to load image. Please check the URL.');
    };

    img.src = url;
  };

  const handleBackgroundBlur = () => {
    const trimmedUrl = backgroundInput.trim();
    if (trimmedUrl && trimmedUrl !== customBackground) {
      validateAndSetBackground(trimmedUrl);
    }
  };

  const handleResetBackground = () => {
    setCustomBackground(null);
    setBackgroundInput('');
    setBackgroundStatus('idle');
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_BACKGROUND);
    window.dispatchEvent(new Event('customBackgroundChange'));
    setBackgroundToast('Background reset to default.');
  };

  const handleFactoryReset = () => {
    setShowFactoryReset(true);
  };

  const confirmFactoryReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Options</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
        <div className={styles.section}>
          <h4>Display</h4>
          <label className={styles.toggle}>
            <span>Show tutor names</span>
            <input
              type="checkbox"
              checked={showTutor}
              onChange={(e) => onShowTutorChange(e.target.checked)}
            />
          </label>
          <label className={styles.toggle}>
            <span>{darkMode ? 'Dark mode' : 'Light mode'}</span>
            <button
              className={styles.themeBtn}
              onClick={() => onDarkModeChange(!darkMode)}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              {darkMode ? 'Switch to light' : 'Switch to dark'}
            </button>
          </label>
        </div>

        <div className={styles.section}>
          <h4>Timetables</h4>
          <p className={styles.privacyDesc}>
            Add timetables to compare with friends.
          </p>

          {/* List of timetables */}
          <div className={styles.timetableList}>
            {timetables.map((timetable) => {
              const isActive = timetable.id === activeTimetableId;
              return (
                <div key={timetable.id} className={`${styles.timetableListItem} ${isActive ? styles.timetableListItemActive : ''}`}>
                  {editingTimetableId === timetable.id ? (
                    <div className={styles.timetableEditRow}>
                      <input
                        type="text"
                        className={styles.timetableNameInput}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename();
                          if (e.key === 'Escape') {
                            setEditingTimetableId(null);
                            setEditingName('');
                          }
                        }}
                        autoFocus
                      />
                      <button
                        className={styles.timetableActionBtn}
                        onClick={handleSaveRename}
                        title="Save"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={styles.timetableInfo}>
                        <span className={styles.timetableName}>{timetable.name}</span>
                        {timetable.isPrimary && (
                          <span className={styles.timetableBadge}>You</span>
                        )}
                        {isActive && (
                          <span className={`${styles.timetableBadge} ${styles.timetableBadgeActive}`}>Viewing</span>
                        )}
                      </div>
                      <div className={styles.timetableActions}>
                        {!isActive && (
                          <button
                            className={`${styles.timetableActionBtn} ${styles.timetableActionBtnView}`}
                            onClick={() => handleSetActiveTimetable(timetable.id, timetable.name)}
                            title="View this timetable"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        <button
                          className={styles.timetableActionBtn}
                          onClick={() => handleStartRename(timetable)}
                          title="Rename"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className={`${styles.timetableActionBtn} ${styles.timetableActionBtnDanger}`}
                          onClick={() => handleDeleteTimetable(timetable.id, timetable.name, timetable.isPrimary)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add timetable section */}
          <div className={styles.addTimetableSection}>
            <p className={styles.addTimetableLabel}>Add another timetable:</p>

            <div className={styles.addTimetableRow}>
              <div className={styles.addTimetableInputWrapper}>
                <Link size={14} className={styles.addTimetableIcon} />
                <input
                  type="text"
                  className={`${styles.addTimetableInput} ${shareLinkError ? styles.error : ''}`}
                  placeholder="Paste a share link..."
                  value={shareLinkInput}
                  onChange={(e) => {
                    setShareLinkInput(e.target.value);
                    setShareLinkError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddFromShareLink();
                  }}
                />
              </div>
              <button
                className={styles.btn}
                onClick={handleAddFromShareLink}
                disabled={!shareLinkInput.trim()}
              >
                Add
              </button>
            </div>
            {shareLinkError && (
              <p className={styles.addTimetableError}>{shareLinkError}</p>
            )}

            <div className={styles.addTimetableDivider}>
              <span>or</span>
            </div>

            <label className={styles.btn} style={{ display: 'inline-flex' }}>
              <input
                ref={addFileInputRef}
                type="file"
                accept=".html,.htm,.ics"
                onChange={handleAddFromFile}
                className="file-input"
              />
              <Upload size={14} /> Upload HTML/ICS file
            </label>
          </div>

          {timetableToast && (
            <div className={`${styles.backgroundToast} ${timetableToast.type === 'success' ? styles.success : styles.error}`}>
              {timetableToast.message}
            </div>
          )}
        </div>

        <div className={`${styles.section} ${styles.backgroundSection}`}>
          <h4>Background</h4>
          <label className={styles.toggle}>
            <span>Use plain background</span>
            <input
              type="checkbox"
              checked={isPlainBackground}
              onChange={handlePlainBackgroundToggle}
            />
          </label>
          {!isPlainBackground && (
            <>
              <p className={styles.privacyDesc} style={{ marginTop: '0.75rem' }}>
                Or paste an image URL for a custom background.
              </p>
              <div className={styles.backgroundInputRow}>
                <div className={styles.backgroundInputWrapper}>
                  <Image size={16} className={styles.backgroundIcon} />
                  <input
                    type="text"
                    className={`${styles.backgroundInput} ${backgroundStatus === 'error' ? styles.error : ''}`}
                    placeholder="https://example.com/image.jpg"
                    value={backgroundInput}
                    onChange={(e) => setBackgroundInput(e.target.value)}
                    onBlur={handleBackgroundBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                  />
                  {backgroundStatus === 'loading' && (
                    <span className={`${styles.backgroundStatus} ${styles.loading}`}>Loading...</span>
                  )}
                </div>
              </div>
              {customBackground && customBackground !== 'plain' && (
                <div className={styles.backgroundPreview}>
                  <img
                    src={customBackground}
                    alt="Custom background preview"
                    className={styles.backgroundThumbnail}
                  />
                  <button
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={handleResetBackground}
                  >
                    <RotateCcw size={14} /> Reset to Default
                  </button>
                </div>
              )}
            </>
          )}
          {backgroundToast && (
            <div className={`${styles.backgroundToast} ${backgroundStatus === 'error' ? styles.error : styles.success}`}>
              {backgroundToast}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h4>Privacy & Security</h4>
          <p className={styles.privacyDesc}>
            Learn how your data is processed and stored.
          </p>
          <button className={`${styles.btn} ${styles.btnPrivacy}`} onClick={onShowPrivacy}>
            <Shield size={14} /> View privacy info
          </button>
        </div>

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
            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleFactoryReset}>
              <RotateCcw size={14} /> Factory Reset
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <Modal
          title={`Delete "${deleteConfirm.name}"?`}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDeleteTimetable}
          confirmText="Delete"
          confirmVariant="danger"
        >
          <p>
            {deleteConfirm.isPrimary
              ? "This will clear your timetable data. You'll need to upload a new file."
              : "This cannot be undone."}
          </p>
        </Modal>
      )}

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
          <p><strong>This cannot be undone.</strong></p>
        </Modal>
      )}
    </div>
  );
}
