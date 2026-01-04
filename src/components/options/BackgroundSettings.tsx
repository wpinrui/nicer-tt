import { Image, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { STORAGE_KEYS, TOAST_DURATION_MS } from '../../utils/constants';
import { logError } from '../../utils/errors';
import { Toast } from '../Toast';
import styles from '../OptionsPanel.module.scss';

export function BackgroundSettings() {
  // Custom background state
  const [customBackground, setCustomBackground] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_BACKGROUND);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      logError('BackgroundSettings:initCustomBackground', e);
      return null;
    }
  });
  const [backgroundInput, setBackgroundInput] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_BACKGROUND);
      if (stored) {
        const value = JSON.parse(stored);
        if (value && value !== 'plain') {
          return value;
        }
      }
    } catch (e) {
      logError('BackgroundSettings:initBackgroundInput', e);
    }
    return '';
  });
  const [backgroundStatus, setBackgroundStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [backgroundToast, setBackgroundToast] = useState<string | null>(null);

  // Check if using plain background
  const isPlainBackground = customBackground === 'plain';

  // Auto-hide toast
  useEffect(() => {
    if (backgroundToast) {
      const timer = setTimeout(() => setBackgroundToast(null), TOAST_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [backgroundToast]);

  const handlePlainBackgroundToggle = () => {
    if (isPlainBackground) {
      setCustomBackground(null);
      setBackgroundInput('');
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_BACKGROUND);
    } else {
      setCustomBackground('plain');
      setBackgroundInput('');
      localStorage.setItem(STORAGE_KEYS.CUSTOM_BACKGROUND, JSON.stringify('plain'));
    }
    window.dispatchEvent(new Event('customBackgroundChange'));
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

  return (
    <div className={`${styles.section} ${styles.backgroundSection}`}>
      <h4>Background</h4>
      <label className={styles.toggle}>
        <span>Use plain background</span>
        <input type="checkbox" checked={isPlainBackground} onChange={handlePlainBackgroundToggle} />
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
        <Toast
          message={backgroundToast}
          type={backgroundStatus === 'error' ? 'error' : 'success'}
        />
      )}
    </div>
  );
}
