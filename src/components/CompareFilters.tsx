import { useState } from 'react';
import { Calendar, Users, Car, Info, Utensils, Filter, ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';
import type { CompareFilter } from '../utils/constants';
import type { TravelConfig, MealConfig } from '../utils/compareUtils';

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
    <div className="meal-range-group">
      <label className="meal-range-label" data-tooltip={tooltip}>
        {label}:
        <select
          className="meal-time-select"
          value={startValue}
          onChange={(e) => onStartChange(Number(e.target.value))}
        >
          {startOptions.map(hour => (
            <option key={hour} value={hour}>{formatHour(hour)}</option>
          ))}
        </select>
        <span className="meal-time-separator">to</span>
        <select
          className="meal-time-select"
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

  const handleFilterClick = (filter: CompareFilter) => {
    onFilterChange(compareFilter === filter ? 'none' : filter);
  };

  const activeFilterLabel = FILTER_BUTTONS.find(f => f.id === compareFilter)?.label || 'None';

  return (
    <div className="compare-filters">
      {/* Mobile toggle button - hidden on desktop via CSS */}
      <button
        className="filters-toggle"
        onClick={() => setFiltersExpanded(!filtersExpanded)}
      >
        <Filter size={14} />
        <span>Filters{compareFilter !== 'none' ? `: ${activeFilterLabel}` : ''}</span>
        {filtersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <div className={`compare-filters-row ${filtersExpanded ? '' : 'collapsed'}`}>
        {FILTER_BUTTONS.map(({ id, icon: Icon, label, tooltip }) => (
          <button
            key={id}
            className={`compare-filter-btn ${compareFilter === id ? 'active' : ''}`}
            onClick={() => handleFilterClick(id)}
            data-tooltip={tooltip}
          >
            <Icon size={14} />
            <span>{label}</span>
            <Info size={12} className="compare-filter-info" />
          </button>
        ))}
      </div>

      {compareFilter === 'travel' && (
        <div className="travel-options">
          <div className="travel-direction-group">
            <span className="travel-options-label">Direction:</span>
            <div className="travel-direction-btns">
              <button
                className={`travel-direction-btn ${travelConfig.direction === 'to' ? 'active' : ''}`}
                onClick={() => onTravelConfigChange({ direction: 'to' })}
                data-tooltip="Compare first class of the day"
              >
                TO School
              </button>
              <button
                className={`travel-direction-btn ${travelConfig.direction === 'from' ? 'active' : ''}`}
                onClick={() => onTravelConfigChange({ direction: 'from' })}
                data-tooltip="Compare last class of the day"
              >
                FROM School
              </button>
              <button
                className={`travel-direction-btn ${travelConfig.direction === 'both' ? 'active' : ''}`}
                onClick={() => onTravelConfigChange({ direction: 'both' })}
                data-tooltip="Both can travel to AND from school together"
              >
                BOTH
              </button>
              <button
                className={`travel-direction-btn ${travelConfig.direction === 'either' ? 'active' : ''}`}
                onClick={() => onTravelConfigChange({ direction: 'either' })}
                data-tooltip="Can travel to OR from school together"
              >
                EITHER
              </button>
            </div>
          </div>

          <div className="travel-wait-group">
            <label className="travel-options-label" data-tooltip="Maximum time willing to wait for each other">
              Wait time:
              <select
                className="travel-wait-select"
                value={travelConfig.waitMinutes}
                onChange={(e) => onTravelConfigChange({ waitMinutes: Number(e.target.value) })}
              >
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {compareFilter === 'eat' && (
        <div className="eat-options">
          <div className="eat-type-group">
            <span className="eat-options-label">Meal:</span>
            <div className="eat-type-btns">
              <button
                className={`eat-type-btn ${mealConfig.type === 'lunch' ? 'active' : ''}`}
                onClick={() => onMealConfigChange({ type: 'lunch' })}
                data-tooltip="Find lunch gaps only"
              >
                Lunch
              </button>
              <button
                className={`eat-type-btn ${mealConfig.type === 'dinner' ? 'active' : ''}`}
                onClick={() => onMealConfigChange({ type: 'dinner' })}
                data-tooltip="Find dinner gaps only"
              >
                Dinner
              </button>
            </div>
          </div>

          <div className="meal-time-ranges">
            <MealTimeRange
              label="Lunch"
              tooltip="Set the lunch time window"
              startValue={mealConfig.lunchStart}
              endValue={mealConfig.lunchEnd}
              startOptions={Array.from({ length: 8 }, (_, i) => i + 9)}
              endOptions={Array.from({ length: 8 }, (_, i) => i + 11)}
              onStartChange={(v) => onMealConfigChange({ lunchStart: v })}
              onEndChange={(v) => onMealConfigChange({ lunchEnd: v })}
            />
            <MealTimeRange
              label="Dinner"
              tooltip="Set the dinner time window"
              startValue={mealConfig.dinnerStart}
              endValue={mealConfig.dinnerEnd}
              startOptions={Array.from({ length: 6 }, (_, i) => i + 15)}
              endOptions={Array.from({ length: 5 }, (_, i) => i + 17)}
              onStartChange={(v) => onMealConfigChange({ dinnerStart: v })}
              onEndChange={(v) => onMealConfigChange({ dinnerEnd: v })}
            />
          </div>
        </div>
      )}

      <div className="compare-names-row">
        <span className="compare-name-label">Comparing:</span>
        <span className="compare-name-tag">{leftName}</span>
        <span className="compare-vs">vs</span>
        <span className="compare-name-tag">{rightName}</span>
      </div>
    </div>
  );
}
