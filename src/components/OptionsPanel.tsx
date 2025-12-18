import { useRef, useState, useEffect } from 'react';
import { X, Upload, RotateCcw, Sun, Moon, Shield, HelpCircle, ExternalLink, Image, Trash2, Link, Pencil, Check, Eye } from 'lucide-react';
import { STORAGE_KEYS } from '../utils/constants';
import type { Timetable, TimetableEvent } from '../utils/parseHtml';
import { parseHtmlTimetable } from '../utils/parseHtml';
import { parseIcs } from '../utils/parseIcs';
import { decodeShareUrl } from '../utils/shareUtils';

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

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (backgroundToast) {
      const timer = setTimeout(() => setBackgroundToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [backgroundToast]);

  // Timetable management state
  const [shareLinkInput, setShareLinkInput] = useState('');
  const [shareLinkError, setShareLinkError] = useState<string | null>(null);
  const [editingTimetableId, setEditingTimetableId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [timetableToast, setTimetableToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-hide timetable toast
  useEffect(() => {
    if (timetableToast) {
      const timer = setTimeout(() => setTimetableToast(null), 3000);
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
    const confirmMsg = isPrimary
      ? `Delete "${name}"? This will clear your timetable data. You'll need to upload a new file.`
      : `Delete "${name}"? This cannot be undone.`;
    if (window.confirm(confirmMsg)) {
      const deleted = onDeleteTimetable(id);
      if (deleted) {
        setTimetableToast({ message: `"${name}" deleted.`, type: 'success' });
      }
    }
  };

  const handleSetActiveTimetable = (id: string, name: string) => {
    onSetActiveTimetable(id);
    setTimetableToast({ message: `Now viewing "${name}"`, type: 'success' });
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
    if (window.confirm('Factory Reset will clear ALL your data including timetables, settings, and preferences. This cannot be undone. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="options-panel" onClick={(e) => e.stopPropagation()}>
        <div className="options-header">
          <h3>Options</h3>
          <button className="options-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="options-content">
        <div className="options-section">
          <h4>Display</h4>
          <label className="options-toggle">
            <span>Show tutor names</span>
            <input
              type="checkbox"
              checked={showTutor}
              onChange={(e) => onShowTutorChange(e.target.checked)}
            />
          </label>
          <label className="options-toggle">
            <span>{darkMode ? 'Dark mode' : 'Light mode'}</span>
            <button
              className="options-theme-btn"
              onClick={() => onDarkModeChange(!darkMode)}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              {darkMode ? 'Switch to light' : 'Switch to dark'}
            </button>
          </label>
        </div>

        <div className="options-section">
          <h4>Timetables</h4>
          <p className="options-privacy-desc">
            Add timetables to compare with friends.
          </p>

          {/* List of timetables */}
          <div className="timetable-list">
            {timetables.map((timetable) => {
              const isActive = timetable.id === activeTimetableId;
              return (
                <div key={timetable.id} className={`timetable-list-item ${isActive ? 'timetable-list-item-active' : ''}`}>
                  {editingTimetableId === timetable.id ? (
                    <div className="timetable-edit-row">
                      <input
                        type="text"
                        className="timetable-name-input"
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
                        className="timetable-action-btn"
                        onClick={handleSaveRename}
                        title="Save"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="timetable-info">
                        <span className="timetable-name">{timetable.name}</span>
                        {timetable.isPrimary && (
                          <span className="timetable-badge">You</span>
                        )}
                        {isActive && (
                          <span className="timetable-badge timetable-badge-active">Viewing</span>
                        )}
                      </div>
                      <div className="timetable-actions">
                        {!isActive && (
                          <button
                            className="timetable-action-btn timetable-action-btn-view"
                            onClick={() => handleSetActiveTimetable(timetable.id, timetable.name)}
                            title="View this timetable"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        <button
                          className="timetable-action-btn"
                          onClick={() => handleStartRename(timetable)}
                          title="Rename"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="timetable-action-btn timetable-action-btn-danger"
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
          <div className="add-timetable-section">
            <p className="add-timetable-label">Add another timetable:</p>

            <div className="add-timetable-row">
              <div className="add-timetable-input-wrapper">
                <Link size={14} className="add-timetable-icon" />
                <input
                  type="text"
                  className={`add-timetable-input ${shareLinkError ? 'error' : ''}`}
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
                className="options-btn"
                onClick={handleAddFromShareLink}
                disabled={!shareLinkInput.trim()}
              >
                Add
              </button>
            </div>
            {shareLinkError && (
              <p className="add-timetable-error">{shareLinkError}</p>
            )}

            <div className="add-timetable-divider">
              <span>or</span>
            </div>

            <label className="options-btn" style={{ display: 'inline-flex' }}>
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
            <div className={`options-background-toast ${timetableToast.type}`}>
              {timetableToast.message}
            </div>
          )}
        </div>

        <div className="options-section options-background-section">
          <h4>Background</h4>
          <label className="options-toggle">
            <span>Use plain background</span>
            <input
              type="checkbox"
              checked={isPlainBackground}
              onChange={handlePlainBackgroundToggle}
            />
          </label>
          {!isPlainBackground && (
            <>
              <p className="options-privacy-desc" style={{ marginTop: '0.75rem' }}>
                Or paste an image URL for a custom background.
              </p>
              <div className="options-background-input-row">
                <div className="options-background-input-wrapper">
                  <Image size={16} className="options-background-icon" />
                  <input
                    type="text"
                    className={`options-background-input ${backgroundStatus === 'error' ? 'error' : ''}`}
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
                    <span className="options-background-status loading">Loading...</span>
                  )}
                </div>
              </div>
              {customBackground && customBackground !== 'plain' && (
                <div className="options-background-preview">
                  <img
                    src={customBackground}
                    alt="Custom background preview"
                    className="options-background-thumbnail"
                  />
                  <button
                    className="options-btn options-btn-danger"
                    onClick={handleResetBackground}
                  >
                    <RotateCcw size={14} /> Reset to Default
                  </button>
                </div>
              )}
            </>
          )}
          {backgroundToast && (
            <div className={`options-background-toast ${backgroundStatus === 'error' ? 'error' : 'success'}`}>
              {backgroundToast}
            </div>
          )}
        </div>

        <div className="options-section">
          <h4>Privacy & Security</h4>
          <p className="options-privacy-desc">
            Learn how your data is processed and stored.
          </p>
          <button className="options-btn options-btn-privacy" onClick={onShowPrivacy}>
            <Shield size={14} /> View privacy info
          </button>
        </div>

        <div className="options-section">
          <h4>Help</h4>
          <p className="options-privacy-desc">
            Refer to the User Guide for usage instructions.
          </p>
          <div className="options-buttons">
            <a
              href="https://github.com/wpinrui/nicer-tt/blob/main/GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="options-btn"
            >
              <HelpCircle size={14} /> User Guide <ExternalLink size={12} />
            </a>
            <a
              href="https://github.com/wpinrui/nicer-tt/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="options-btn"
            >
              <ExternalLink size={14} /> Report an issue
            </a>
            <button className="options-btn options-btn-danger" onClick={handleFactoryReset}>
              <RotateCcw size={14} /> Factory Reset
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
