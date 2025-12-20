import { Check, Eye, Link, Pencil, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Timetable, TimetableEvent } from '../../types';
import { TOAST_DURATION_MS } from '../../utils/constants';
import { parseHtmlTimetable } from '../../utils/parseHtml';
import { parseIcs } from '../../utils/parseIcs';
import { decodeShareUrl } from '../../utils/shareUtils';
import { Modal } from '../Modal';
import styles from '../OptionsPanel.module.scss';

interface TimetableManagerProps {
  timetables: Timetable[];
  activeTimetableId: string | null;
  onSetActiveTimetable: (id: string) => void;
  onAddTimetable: (
    events: TimetableEvent[],
    fileName: string | null,
    customName?: string
  ) => string;
  onRenameTimetable: (id: string, newName: string) => void;
  onDeleteTimetable: (id: string) => boolean;
  onViewingToast: (name: string) => void;
  onClose: () => void;
}

export function TimetableManager({
  timetables,
  activeTimetableId,
  onSetActiveTimetable,
  onAddTimetable,
  onRenameTimetable,
  onDeleteTimetable,
  onViewingToast,
  onClose,
}: TimetableManagerProps) {
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [shareLinkInput, setShareLinkInput] = useState('');
  const [shareLinkError, setShareLinkError] = useState<string | null>(null);
  const [editingTimetableId, setEditingTimetableId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [timetableToast, setTimetableToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
    isPrimary: boolean;
  } | null>(null);

  // Auto-hide toast
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
        type: 'error',
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

  return (
    <>
      <div className={styles.section}>
        <h4>Timetables</h4>
        <p className={styles.privacyDesc}>Add timetables to compare with friends.</p>

        {/* List of timetables */}
        <div className={styles.timetableList}>
          {timetables.map((timetable) => {
            const isActive = timetable.id === activeTimetableId;
            return (
              <div
                key={timetable.id}
                className={`${styles.timetableListItem} ${isActive ? styles.timetableListItemActive : ''}`}
              >
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
                      {timetable.isPrimary && <span className={styles.timetableBadge}>You</span>}
                      {isActive && (
                        <span className={`${styles.timetableBadge} ${styles.timetableBadgeActive}`}>
                          Viewing
                        </span>
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
                        onClick={() =>
                          handleDeleteTimetable(timetable.id, timetable.name, timetable.isPrimary)
                        }
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
          {shareLinkError && <p className={styles.addTimetableError}>{shareLinkError}</p>}

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
          <div
            className={`${styles.backgroundToast} ${timetableToast.type === 'success' ? styles.success : styles.error}`}
          >
            {timetableToast.message}
          </div>
        )}
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
              : 'This cannot be undone.'}
          </p>
        </Modal>
      )}
    </>
  );
}
