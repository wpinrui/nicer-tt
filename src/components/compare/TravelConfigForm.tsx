import type { TravelConfig } from '../../types';
import styles from '../CompareFilters.module.scss';

const WAIT_TIME_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const TRAVEL_DIRECTIONS = ['to', 'from', 'both', 'either'] as const;
const TRAVEL_DIRECTION_LABELS: Record<TravelConfig['direction'], string> = {
  to: 'TO School',
  from: 'FROM School',
  both: 'BOTH',
  either: 'EITHER',
};
const TRAVEL_DIRECTION_TOOLTIPS: Record<TravelConfig['direction'], string> = {
  to: 'Compare first class of the day',
  from: 'Compare last class of the day',
  both: 'Both can travel to AND from school together',
  either: 'Can travel to OR from school together',
};

interface TravelDirectionButtonsProps {
  value: TravelConfig['direction'];
  onChange: (direction: TravelConfig['direction']) => void;
  buttonClassName: string;
  showTooltips?: boolean;
}

function TravelDirectionButtons({ value, onChange, buttonClassName, showTooltips }: TravelDirectionButtonsProps) {
  return (
    <>
      {TRAVEL_DIRECTIONS.map(dir => (
        <button
          key={dir}
          className={`${buttonClassName} ${value === dir ? styles.active : ''}`}
          onClick={() => onChange(dir)}
          data-tooltip={showTooltips ? TRAVEL_DIRECTION_TOOLTIPS[dir] : undefined}
        >
          {TRAVEL_DIRECTION_LABELS[dir]}
        </button>
      ))}
    </>
  );
}

interface TravelConfigFormProps {
  config: TravelConfig;
  onChange: (config: Partial<TravelConfig>) => void;
}

export function TravelConfigForm({ config, onChange }: TravelConfigFormProps) {
  return (
    <div className={styles.travelOptions}>
      <div className={styles.travelDirectionGroup}>
        <span className={styles.travelOptionsLabel}>Direction:</span>
        <div className={styles.travelDirectionBtns}>
          <TravelDirectionButtons
            value={config.direction}
            onChange={(direction) => onChange({ direction })}
            buttonClassName={styles.travelDirectionBtn}
            showTooltips
          />
        </div>
      </div>

      <div className={styles.travelWaitGroup}>
        <label className={styles.travelOptionsLabel} data-tooltip="Maximum time willing to wait for each other">
          Wait time:
          <select
            className={styles.travelWaitSelect}
            value={config.waitMinutes}
            onChange={(e) => onChange({ waitMinutes: Number(e.target.value) })}
          >
            {WAIT_TIME_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

interface TravelConfigModalContentProps {
  config: TravelConfig;
  onChange: (config: Partial<TravelConfig>) => void;
}

export function TravelConfigModalContent({ config, onChange }: TravelConfigModalContentProps) {
  return (
    <>
      <div className={styles.modalConfigSection}>
        <label className={styles.modalConfigLabel}>Direction</label>
        <div className={styles.modalConfigButtons}>
          <TravelDirectionButtons
            value={config.direction}
            onChange={(direction) => onChange({ direction })}
            buttonClassName={styles.modalConfigBtn}
          />
        </div>
      </div>
      <div className={styles.modalConfigSection}>
        <label className={styles.modalConfigLabel}>
          Max wait time
          <select
            className={styles.modalConfigSelect}
            value={config.waitMinutes}
            onChange={(e) => onChange({ waitMinutes: Number(e.target.value) })}
          >
            {WAIT_TIME_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}
