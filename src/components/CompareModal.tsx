import { useState } from 'react';
import type { Timetable } from '../utils/parseHtml';

interface CompareModalProps {
  timetables: Timetable[];
  currentSelection: [string, string] | null;
  isCompareMode: boolean;
  onCompare: (selection: [string, string]) => void;
  onReset: () => void;
  onClose: () => void;
}

// Compute initial selections based on props
function getInitialSelections(
  timetables: Timetable[],
  currentSelection: [string, string] | null
): [string | null, string | null] {
  if (currentSelection) {
    return [currentSelection[0], currentSelection[1]];
  }
  if (timetables.length >= 2) {
    return [timetables[0].id, timetables[1].id];
  }
  if (timetables.length === 1) {
    return [timetables[0].id, null];
  }
  return [null, null];
}

export function CompareModal({
  timetables,
  currentSelection,
  isCompareMode,
  onCompare,
  onReset,
  onClose,
}: CompareModalProps) {
  const [initial] = useState(() => getInitialSelections(timetables, currentSelection));
  const [leftSelection, setLeftSelection] = useState<string | null>(initial[0]);
  const [rightSelection, setRightSelection] = useState<string | null>(initial[1]);

  // Smart selection: when selecting in one pane, remove from other if same
  const handleLeftSelect = (id: string) => {
    setLeftSelection(id);
    if (rightSelection === id) {
      // Find another timetable for right pane
      const other = timetables.find(t => t.id !== id);
      setRightSelection(other?.id || null);
    }
  };

  const handleRightSelect = (id: string) => {
    setRightSelection(id);
    if (leftSelection === id) {
      // Find another timetable for left pane
      const other = timetables.find(t => t.id !== id);
      setLeftSelection(other?.id || null);
    }
  };

  const handleConfirm = () => {
    if (leftSelection && rightSelection) {
      onCompare([leftSelection, rightSelection]);
    }
  };

  const canCompare = leftSelection && rightSelection && leftSelection !== rightSelection;

  return (
    <div className="modal-overlay">
      <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Compare Timetables</h3>
        <p className="compare-modal-desc">
          Select two timetables to compare side by side
        </p>

        <div className="compare-panes">
          <div className="compare-pane">
            <h4>Left Column</h4>
            <div className="compare-pane-list">
              {timetables.map((t) => (
                <button
                  key={t.id}
                  className={`compare-pane-item ${leftSelection === t.id ? 'selected' : ''}`}
                  onClick={() => handleLeftSelect(t.id)}
                >
                  <span className="compare-pane-name">{t.name}</span>
                  {t.isPrimary && <span className="compare-pane-badge">You</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="compare-pane-divider" />

          <div className="compare-pane">
            <h4>Right Column</h4>
            <div className="compare-pane-list">
              {timetables.map((t) => (
                <button
                  key={t.id}
                  className={`compare-pane-item ${rightSelection === t.id ? 'selected' : ''}`}
                  onClick={() => handleRightSelect(t.id)}
                >
                  <span className="compare-pane-name">{t.name}</span>
                  {t.isPrimary && <span className="compare-pane-badge">You</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          {isCompareMode && (
            <button className="modal-secondary exit-compare-btn" onClick={onReset}>
              Exit Compare
            </button>
          )}
          <button
            className="modal-confirm-primary"
            onClick={handleConfirm}
            disabled={!canCompare}
          >
            {isCompareMode ? 'Update' : 'Compare'}
          </button>
        </div>
      </div>
    </div>
  );
}
