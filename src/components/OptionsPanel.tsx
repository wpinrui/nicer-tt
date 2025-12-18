import { useRef, useState, useEffect } from 'react';
import { X, Upload, RotateCcw, Sun, Moon, Shield, HelpCircle, ExternalLink, Image } from 'lucide-react';
import { STORAGE_KEYS } from '../utils/constants';

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

  // Custom background state
  const [customBackground, setCustomBackground] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_BACKGROUND);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [backgroundInput, setBackgroundInput] = useState('');
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

  // Initialize input with current background URL (but not if it's 'plain')
  useEffect(() => {
    if (customBackground && customBackground !== 'plain') {
      setBackgroundInput(customBackground);
    }
  }, [customBackground]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (backgroundToast) {
      const timer = setTimeout(() => setBackgroundToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [backgroundToast]);

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
          </div>
        </div>
      </div>
    </div>
  );
}
