import { Moon, Sun } from 'lucide-react';

import styles from '../OptionsPanel.module.scss';

interface AppSettingsProps {
  darkMode: boolean;
  showTutor: boolean;
  onDarkModeChange: (value: boolean) => void;
  onShowTutorChange: (value: boolean) => void;
}

export function AppSettings({
  darkMode,
  showTutor,
  onDarkModeChange,
  onShowTutorChange,
}: AppSettingsProps) {
  return (
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
        <button className={styles.themeBtn} onClick={() => onDarkModeChange(!darkMode)}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {darkMode ? 'Switch to light' : 'Switch to dark'}
        </button>
      </label>
    </div>
  );
}
