import { useState, useEffect } from 'react';
import { Calendar, Users, Car, Info, Utensils, Filter, ChevronDown, ChevronUp, Settings, type LucideIcon } from 'lucide-react';
import type { CompareFilter } from '../utils/constants';
import type { TravelConfig, MealConfig } from '../utils/compareUtils';
import { Modal } from './Modal';
import styles from './CompareFilters.module.scss';

interface CompareFiltersProps {
  compareFilter: CompareFilter;
  onFilterChange: (filter: CompareFilter) => void;
  travelConfig: TravelConfig;
  onTravelConfigChange: (config: Partial<TravelConfig>) => void;
  mealConfig: MealConfig;
  onMealConfigChange: (config: Partial<MealConfig>) => void;
  leftName: string;
  rightName: string;
}

interface FilterButtonConfig {
  id: CompareFilter;
  icon: LucideIcon;
  label: string;
  tooltip: string;
}

const FILTER_BUTTONS: FilterButtonConfig[] = [
  { id: 'commonDays', icon: Calendar, label: 'Common Days', tooltip: 'Show only days where both timetables have classes' },
  { id: 'identical', icon: Users, label: 'Identical Classes', tooltip: 'Show classes with matching course, group, AND time' },
  { id: 'travel', icon: Car, label: 'Travel Together', tooltip: 'See which days you can commute together' },
  { id: 'eat', icon: Utensils, label: 'Eat Together', tooltip: 'Find 1-hour gaps during lunch or dinner where both can eat together' },
];

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

// Shared configuration options
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

const LUNCH_START_HOURS = Array.from({ length: 8 }, (_, i) => i + 9);
const LUNCH_END_HOURS = Array.from({ length: 8 }, (_, i) => i + 11);
const DINNER_START_HOURS = Array.from({ length: 6 }, (_, i) => i + 15);
const DINNER_END_HOURS = Array.from({ length: 5 }, (_, i) => i + 17);

const MOBILE_BREAKPOINT = '(max-width: 768px)';

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
      {MEAL_TYPES.map(type => (
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
            {startOptions.map(hour => (
              <option key={hour} value={hour}>{formatHour(hour)}</option>
            ))}
          </select>
          <span>to</span>
          <select
            className={styles.modalConfigSelect}
            value={endValue}
            onChange={(e) => onEndChange(Number(e.target.value))}
          >
            {endOptions.map(hour => (
              <option key={hour} value={hour}>{formatHour(hour)}</option>
            ))}
          </select>
        </div>
      </label>
    </div>
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
          {startOptions.map(hour => (
            <option key={hour} value={hour}>{formatHour(hour)}</option>
          ))}
        </select>
        <span className={styles.mealTimeSeparator}>to</span>
        <select
          className={styles.mealTimeSelect}
          value={endValue}
          onChange={(e) => onEndChange(Number(e.target.value))}
        >
          {endOptions.map(hour => (
            <option key={hour} value={hour}>{formatHour(hour)}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function CompareFilters({
  compareFilter,
  onFilterChange,
  travelConfig,
  onTravelConfigChange,
  mealConfig,
  onMealConfigChange,
  leftName,
  rightName,
}: CompareFiltersProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleFilterClick = (filter: CompareFilter) => {
    if (compareFilter === filter) {
      onFilterChange('none');
    } else {
      onFilterChange(filter);
      // On mobile, show config modal for filters that need configuration
      if (isMobile && (filter === 'travel' || filter === 'eat')) {
        setShowConfigModal(true);
      }
    }
  };

  const activeFilterLabel = FILTER_BUTTONS.find(f => f.id === compareFilter)?.label || 'None';
  const needsConfig = compareFilter === 'travel' || compareFilter === 'eat';

  return (
    <div className={styles.container}>
      {/* Mobile toggle button - hidden on desktop via CSS */}
      <button
        className={styles.filtersToggle}
        onClick={() => setFiltersExpanded(!filtersExpanded)}
      >
        <Filter size={14} />
        <span>Filters{compareFilter !== 'none' ? `: ${activeFilterLabel}` : ''}</span>
        {filtersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <div className={`${styles.filtersRow} ${filtersExpanded ? '' : styles.collapsed}`}>
        {FILTER_BUTTONS.map(({ id, icon: Icon, label, tooltip }) => (
          <button
            key={id}
            className={`${styles.filterBtn} ${compareFilter === id ? styles.active : ''}`}
            onClick={() => handleFilterClick(id)}
            data-tooltip={tooltip}
          >
            <Icon size={14} />
            <span>{label}</span>
            <Info size={12} className={styles.filterInfo} />
          </button>
        ))}
      </div>

      {/* Mobile configure button - shown only on mobile when travel/eat is active */}
      {needsConfig && (
        <button
          className={styles.mobileConfigBtn}
          onClick={() => setShowConfigModal(true)}
        >
          <Settings size={14} />
          <span>Configure {compareFilter === 'travel' ? 'Travel' : 'Meal'} Options</span>
        </button>
      )}

      {compareFilter === 'travel' && (
        <div className={styles.travelOptions}>
          <div className={styles.travelDirectionGroup}>
            <span className={styles.travelOptionsLabel}>Direction:</span>
            <div className={styles.travelDirectionBtns}>
              <TravelDirectionButtons
                value={travelConfig.direction}
                onChange={(direction) => onTravelConfigChange({ direction })}
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
                value={travelConfig.waitMinutes}
                onChange={(e) => onTravelConfigChange({ waitMinutes: Number(e.target.value) })}
              >
                {WAIT_TIME_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {compareFilter === 'eat' && (
        <div className={styles.eatOptions}>
          <div className={styles.eatTypeGroup}>
            <span className={styles.eatOptionsLabel}>Meal:</span>
            <div className={styles.eatTypeBtns}>
              <MealTypeButtons
                value={mealConfig.type}
                onChange={(type) => onMealConfigChange({ type })}
                buttonClassName={styles.eatTypeBtn}
                showTooltips
              />
            </div>
          </div>

          <div className={styles.mealTimeRanges}>
            <MealTimeRange
              label="Lunch"
              tooltip="Set the lunch time window"
              startValue={mealConfig.lunchStart}
              endValue={mealConfig.lunchEnd}
              startOptions={LUNCH_START_HOURS}
              endOptions={LUNCH_END_HOURS}
              onStartChange={(v) => onMealConfigChange({ lunchStart: v })}
              onEndChange={(v) => onMealConfigChange({ lunchEnd: v })}
            />
            <MealTimeRange
              label="Dinner"
              tooltip="Set the dinner time window"
              startValue={mealConfig.dinnerStart}
              endValue={mealConfig.dinnerEnd}
              startOptions={DINNER_START_HOURS}
              endOptions={DINNER_END_HOURS}
              onStartChange={(v) => onMealConfigChange({ dinnerStart: v })}
              onEndChange={(v) => onMealConfigChange({ dinnerEnd: v })}
            />
          </div>
        </div>
      )}

      <div className={styles.compareNamesRow}>
        <span className={styles.compareNameLabel}>Comparing:</span>
        <span className={styles.compareNameTag}>{leftName}</span>
        <span className={styles.compareVs}>vs</span>
        <span className={styles.compareNameTag}>{rightName}</span>
      </div>

      {/* Mobile config modal */}
      {showConfigModal && compareFilter === 'travel' && (
        <Modal
          title="Travel Options"
          onClose={() => setShowConfigModal(false)}
          onConfirm={() => setShowConfigModal(false)}
          confirmText="Done"
          confirmVariant="primary"
          cancelText=""
        >
          <div className={styles.modalConfigSection}>
            <label className={styles.modalConfigLabel}>Direction</label>
            <div className={styles.modalConfigButtons}>
              <TravelDirectionButtons
                value={travelConfig.direction}
                onChange={(direction) => onTravelConfigChange({ direction })}
                buttonClassName={styles.modalConfigBtn}
              />
            </div>
          </div>
          <div className={styles.modalConfigSection}>
            <label className={styles.modalConfigLabel}>
              Max wait time
              <select
                className={styles.modalConfigSelect}
                value={travelConfig.waitMinutes}
                onChange={(e) => onTravelConfigChange({ waitMinutes: Number(e.target.value) })}
              >
                {WAIT_TIME_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
        </Modal>
      )}

      {showConfigModal && compareFilter === 'eat' && (
        <Modal
          title="Meal Options"
          onClose={() => setShowConfigModal(false)}
          onConfirm={() => setShowConfigModal(false)}
          confirmText="Done"
          confirmVariant="primary"
          cancelText=""
        >
          <div className={styles.modalConfigSection}>
            <label className={styles.modalConfigLabel}>Meal type</label>
            <div className={styles.modalConfigButtons}>
              <MealTypeButtons
                value={mealConfig.type}
                onChange={(type) => onMealConfigChange({ type })}
                buttonClassName={styles.modalConfigBtn}
              />
            </div>
          </div>
          <ModalTimeRange
            label="Lunch window"
            startValue={mealConfig.lunchStart}
            endValue={mealConfig.lunchEnd}
            startOptions={LUNCH_START_HOURS}
            endOptions={LUNCH_END_HOURS}
            onStartChange={(v) => onMealConfigChange({ lunchStart: v })}
            onEndChange={(v) => onMealConfigChange({ lunchEnd: v })}
          />
          <ModalTimeRange
            label="Dinner window"
            startValue={mealConfig.dinnerStart}
            endValue={mealConfig.dinnerEnd}
            startOptions={DINNER_START_HOURS}
            endOptions={DINNER_END_HOURS}
            onStartChange={(v) => onMealConfigChange({ dinnerStart: v })}
            onEndChange={(v) => onMealConfigChange({ dinnerEnd: v })}
          />
        </Modal>
      )}
    </div>
  );
}
