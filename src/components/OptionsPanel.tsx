import { useRef } from 'react';
import { X, Upload, RotateCcw, Sun, Moon, Shield } from 'lucide-react';

interface OptionsPanelProps {
  fileName: string | null;
  darkMode: boolean;
  showTutor: boolean;
  onClose: () => void;
  onDarkModeChange: (value: boolean) => void;
  onShowTutorChange: (value: boolean) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onShowPrivacy: () => void;
}

export function OptionsPanel({
  fileName,
  darkMode,
  showTutor,
  onClose,
  onDarkModeChange,
  onShowTutorChange,
  onFileChange,
  onReset,
  onShowPrivacy,
}: OptionsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e);
    onClose();
  };

  const handleReset = () => {
    onClose();
    onReset();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="options-panel" onClick={(e) => e.stopPropagation()}>
        <div className="options-header">
          <h3>Options</h3>
          <button className="options-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

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
          <h4>Data</h4>
          <div className="options-file-info">
            <span className="options-file-label">Current file</span>
            <span className="options-file-name">{fileName}</span>
          </div>
          <div className="options-buttons">
            <label className="options-btn">
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.ics"
                onChange={handleFileChange}
                className="file-input"
              />
              <Upload size={14} /> Change file
            </label>
            <button className="options-btn options-btn-danger" onClick={handleReset}>
              <RotateCcw size={14} /> Reset data
            </button>
          </div>
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
      </div>
    </div>
  );
}
