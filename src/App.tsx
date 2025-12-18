import { useState, useEffect } from 'react';
import MainPage from './pages/MainPage';
import { Analytics } from '@vercel/analytics/react';
import { STORAGE_KEYS } from './utils/constants';
import './App.css';

function App() {
  const [customBackground, setCustomBackground] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_BACKGROUND);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [cardOpacity, setCardOpacity] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CARD_OPACITY);
      return stored ? JSON.parse(stored) : 0.85;
    } catch {
      return 0.85;
    }
  });

  // Listen for localStorage changes (from OptionsPanel)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CUSTOM_BACKGROUND) {
        try {
          setCustomBackground(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setCustomBackground(null);
        }
      }
      if (e.key === STORAGE_KEYS.CARD_OPACITY) {
        try {
          setCardOpacity(e.newValue ? JSON.parse(e.newValue) : 0.85);
        } catch {
          setCardOpacity(0.85);
        }
      }
    };

    // Also listen for custom event (same-window updates)
    const handleCustomEvent = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_BACKGROUND);
        setCustomBackground(stored ? JSON.parse(stored) : null);
      } catch {
        setCustomBackground(null);
      }
    };

    const handleOpacityEvent = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CARD_OPACITY);
        setCardOpacity(stored ? JSON.parse(stored) : 0.85);
      } catch {
        setCardOpacity(0.85);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customBackgroundChange', handleCustomEvent);
    window.addEventListener('cardOpacityChange', handleOpacityEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customBackgroundChange', handleCustomEvent);
      window.removeEventListener('cardOpacityChange', handleOpacityEvent);
    };
  }, []);

  const backgroundStyle = customBackground
    ? customBackground === 'plain'
      ? { background: 'var(--plain-bg-color)' }
      : { background: `url('${customBackground}') center/cover fixed` }
    : undefined;

  const cardStyle = {
    '--card-opacity': cardOpacity,
  } as React.CSSProperties;

  return (
    <div className="app" style={backgroundStyle}>
      <div className="card" style={cardStyle}>
        <div className="card-content">
          <MainPage />
        </div>
      </div>
      <footer className="page-footer">
        <span className="photo-credit">
          {!customBackground && (
            <>
              Photo by{' '}
              <a href="https://unsplash.com/@moisamihai092?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
                Mihai Moisa
              </a>{' '}
              on{' '}
              <a href="https://unsplash.com/photos/rugged-mountain-range-under-a-hazy-sky-Jsxfie_bUyw?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
                Unsplash
              </a>
              {' | '}
            </>
          )}
          <a href="https://www.flaticon.com/free-icons/schedule" title="schedule icons">
            Icon by Freepik - Flaticon
          </a>
        </span>
        <span className="made-by">
          <a
            href="https://github.com/wpinrui/nicer-tt"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Made by Ivan | v{__APP_VERSION__}
          </a>{' '}
          <a
            href="https://github.com/wpinrui/nicer-tt/blob/main/DEV.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            (View changelog)
          </a>
        </span>
      </footer>
      <Analytics />
    </div>
  );
}

export default App;
