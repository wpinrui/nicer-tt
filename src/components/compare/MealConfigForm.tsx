import {
  DINNER_END_HOURS,
  DINNER_START_HOURS,
  LUNCH_END_HOURS,
  LUNCH_START_HOURS,
} from '../../shared/constants';
import type { MealConfig } from '../../types';
import styles from '../CompareFilters.module.scss';

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

const MEAL_TYPES = ['lunch', 'dinner'] as const;
const MEAL_TYPE_LABELS: Record<MealConfig['type'], string> = {
  lunch: 'Lunch',
  dinner: 'Dinner',
};
const MEAL_TYPE_TOOLTIPS: Record<MealConfig['type'], string> = {
  lunch: 'Find lunch gaps only',
  dinner: 'Find dinner gaps only',
};

interface MealTypeButtonsProps {
  value: MealConfig['type'];
  onChange: (type: MealConfig['type']) => void;
  buttonClassName: string;
  showTooltips?: boolean;
}

function MealTypeButtons({ value, onChange, buttonClassName, showTooltips }: MealTypeButtonsProps) {
  return (
    <>
      {MEAL_TYPES.map((type) => (
        <button
          key={type}
          className={`${buttonClassName} ${value === type ? styles.active : ''}`}
          onClick={() => onChange(type)}
          data-tooltip={showTooltips ? MEAL_TYPE_TOOLTIPS[type] : undefined}
        >
          {MEAL_TYPE_LABELS[type]}
        </button>
      ))}
    </>
  );
}

interface MealTimeRangeProps {
  label: string;
  tooltip: string;
  startValue: number;
  endValue: number;
  startOptions: number[];
  endOptions: number[];
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
}

function MealTimeRange({
  label,
  tooltip,
  startValue,
  endValue,
  startOptions,
  endOptions,
  onStartChange,
  onEndChange,
}: MealTimeRangeProps) {
  return (
    <div className={styles.mealRangeGroup}>
      <label className={styles.mealRangeLabel} data-tooltip={tooltip}>
        {label}:
        <select
          className={styles.mealTimeSelect}
          value={startValue}
          onChange={(e) => onStartChange(Number(e.target.value))}
        >
          {startOptions.map((hour) => (
            <option key={hour} value={hour}>
              {formatHour(hour)}
            </option>
          ))}
        </select>
        <span className={styles.mealTimeSeparator}>to</span>
        <select
          className={styles.mealTimeSelect}
          value={endValue}
          onChange={(e) => onEndChange(Number(e.target.value))}
        >
          {endOptions.map((hour) => (
            <option key={hour} value={hour}>
              {formatHour(hour)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

interface MealConfigFormProps {
  config: MealConfig;
  onChange: (config: Partial<MealConfig>) => void;
}

export function MealConfigForm({ config, onChange }: MealConfigFormProps) {
  return (
    <div className={styles.eatOptions}>
      <div className={styles.eatTypeGroup}>
        <span className={styles.eatOptionsLabel}>Meal:</span>
        <div className={styles.eatTypeBtns}>
          <MealTypeButtons
            value={config.type}
            onChange={(type) => onChange({ type })}
            buttonClassName={styles.eatTypeBtn}
            showTooltips
          />
        </div>
      </div>

      <div className={styles.mealTimeRanges}>
        <MealTimeRange
          label="Lunch"
          tooltip="Set the lunch time window"
          startValue={config.lunchStart}
          endValue={config.lunchEnd}
          startOptions={LUNCH_START_HOURS}
          endOptions={LUNCH_END_HOURS}
          onStartChange={(v) => onChange({ lunchStart: v })}
          onEndChange={(v) => onChange({ lunchEnd: v })}
        />
        <MealTimeRange
          label="Dinner"
          tooltip="Set the dinner time window"
          startValue={config.dinnerStart}
          endValue={config.dinnerEnd}
          startOptions={DINNER_START_HOURS}
          endOptions={DINNER_END_HOURS}
          onStartChange={(v) => onChange({ dinnerStart: v })}
          onEndChange={(v) => onChange({ dinnerEnd: v })}
        />
      </div>
    </div>
  );
}

interface ModalTimeRangeProps {
  label: string;
  startValue: number;
  endValue: number;
  startOptions: number[];
  endOptions: number[];
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
}

function ModalTimeRange({
  label,
  startValue,
  endValue,
  startOptions,
  endOptions,
  onStartChange,
  onEndChange,
}: ModalTimeRangeProps) {
  return (
    <div className={styles.modalConfigSection}>
      <label className={styles.modalConfigLabel}>
        {label}
        <div className={styles.modalTimeRange}>
          <select
            className={styles.modalConfigSelect}
            value={startValue}
            onChange={(e) => onStartChange(Number(e.target.value))}
          >
            {startOptions.map((hour) => (
              <option key={hour} value={hour}>
                {formatHour(hour)}
              </option>
            ))}
          </select>
          <span>to</span>
          <select
            className={styles.modalConfigSelect}
            value={endValue}
            onChange={(e) => onEndChange(Number(e.target.value))}
          >
            {endOptions.map((hour) => (
              <option key={hour} value={hour}>
                {formatHour(hour)}
              </option>
            ))}
          </select>
        </div>
      </label>
    </div>
  );
}

interface MealConfigModalContentProps {
  config: MealConfig;
  onChange: (config: Partial<MealConfig>) => void;
}

export function MealConfigModalContent({ config, onChange }: MealConfigModalContentProps) {
  return (
    <>
      <div className={styles.modalConfigSection}>
        <label className={styles.modalConfigLabel}>Meal type</label>
        <div className={styles.modalConfigButtons}>
          <MealTypeButtons
            value={config.type}
            onChange={(type) => onChange({ type })}
            buttonClassName={styles.modalConfigBtn}
          />
        </div>
      </div>
      <ModalTimeRange
        label="Lunch window"
        startValue={config.lunchStart}
        endValue={config.lunchEnd}
        startOptions={LUNCH_START_HOURS}
        endOptions={LUNCH_END_HOURS}
        onStartChange={(v) => onChange({ lunchStart: v })}
        onEndChange={(v) => onChange({ lunchEnd: v })}
      />
      <ModalTimeRange
        label="Dinner window"
        startValue={config.dinnerStart}
        endValue={config.dinnerEnd}
        startOptions={DINNER_START_HOURS}
        endOptions={DINNER_END_HOURS}
        onStartChange={(v) => onChange({ dinnerStart: v })}
        onEndChange={(v) => onChange({ dinnerEnd: v })}
      />
    </>
  );
}
