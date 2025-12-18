import { Calendar, Users, Car, Info, Utensils } from 'lucide-react';
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

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
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
  const handleFilterClick = (filter: CompareFilter) => {
    onFilterChange(compareFilter === filter ? 'none' : filter);
  };

  return (
    <div className="compare-filters">
      <div className="compare-filters-row">
        <button
          className={`compare-filter-btn ${compareFilter === 'commonDays' ? 'active' : ''}`}
          onClick={() => handleFilterClick('commonDays')}
          data-tooltip="Show only days where both timetables have classes"
        >
          <Calendar size={14} />
          <span>Common Days</span>
          <Info size={12} className="compare-filter-info" />
        </button>

        <button
          className={`compare-filter-btn ${compareFilter === 'identical' ? 'active' : ''}`}
          onClick={() => handleFilterClick('identical')}
          data-tooltip="Show classes with matching course, group, AND time"
        >
          <Users size={14} />
          <span>Identical Classes</span>
          <Info size={12} className="compare-filter-info" />
        </button>

        <button
          className={`compare-filter-btn ${compareFilter === 'travel' ? 'active' : ''}`}
          onClick={() => handleFilterClick('travel')}
          data-tooltip="See which days you can commute together"
        >
          <Car size={14} />
          <span>Travel Together</span>
          <Info size={12} className="compare-filter-info" />
        </button>

        <button
          className={`compare-filter-btn ${compareFilter === 'eat' ? 'active' : ''}`}
          onClick={() => handleFilterClick('eat')}
          data-tooltip="Find 1-hour gaps during lunch or dinner where both can eat together"
        >
          <Utensils size={14} />
          <span>Eat Together</span>
          <Info size={12} className="compare-filter-info" />
        </button>
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
                <option value={180}>3 hours</option>
                <option value={240}>4 hours</option>
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
            <div className="meal-range-group">
              <label className="meal-range-label" data-tooltip="Set the lunch time window">
                Lunch:
                <select
                  className="meal-time-select"
                  value={mealConfig.lunchStart}
                  onChange={(e) => onMealConfigChange({ lunchStart: Number(e.target.value) })}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 9).map(hour => (
                    <option key={hour} value={hour}>{formatHour(hour)}</option>
                  ))}
                </select>
                <span className="meal-time-separator">to</span>
                <select
                  className="meal-time-select"
                  value={mealConfig.lunchEnd}
                  onChange={(e) => onMealConfigChange({ lunchEnd: Number(e.target.value) })}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 11).map(hour => (
                    <option key={hour} value={hour}>{formatHour(hour)}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="meal-range-group">
              <label className="meal-range-label" data-tooltip="Set the dinner time window">
                Dinner:
                <select
                  className="meal-time-select"
                  value={mealConfig.dinnerStart}
                  onChange={(e) => onMealConfigChange({ dinnerStart: Number(e.target.value) })}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 15).map(hour => (
                    <option key={hour} value={hour}>{formatHour(hour)}</option>
                  ))}
                </select>
                <span className="meal-time-separator">to</span>
                <select
                  className="meal-time-select"
                  value={mealConfig.dinnerEnd}
                  onChange={(e) => onMealConfigChange({ dinnerEnd: Number(e.target.value) })}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 17).map(hour => (
                    <option key={hour} value={hour}>{formatHour(hour)}</option>
                  ))}
                </select>
              </label>
            </div>
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
