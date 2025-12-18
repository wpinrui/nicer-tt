import { Calendar, Users, Car, Info, Utensils } from 'lucide-react';

type CompareFilter = 'none' | 'commonDays' | 'identical' | 'travel' | 'eat';
type TravelDirection = 'to' | 'from' | 'both' | 'either';
type MealType = 'lunch' | 'dinner';

interface CompareFiltersProps {
  compareFilter: CompareFilter;
  onFilterChange: (filter: CompareFilter) => void;
  travelDirection: TravelDirection;
  onTravelDirectionChange: (direction: TravelDirection) => void;
  waitMinutes: number;
  onWaitMinutesChange: (minutes: number) => void;
  mealType: MealType;
  onMealTypeChange: (type: MealType) => void;
  lunchStart: number;
  onLunchStartChange: (hour: number) => void;
  lunchEnd: number;
  onLunchEndChange: (hour: number) => void;
  dinnerStart: number;
  onDinnerStartChange: (hour: number) => void;
  dinnerEnd: number;
  onDinnerEndChange: (hour: number) => void;
  leftName: string;
  rightName: string;
}

// Helper to format hour as 12-hour time
function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

export function CompareFilters({
  compareFilter,
  onFilterChange,
  travelDirection,
  onTravelDirectionChange,
  waitMinutes,
  onWaitMinutesChange,
  mealType,
  onMealTypeChange,
  lunchStart,
  onLunchStartChange,
  lunchEnd,
  onLunchEndChange,
  dinnerStart,
  onDinnerStartChange,
  dinnerEnd,
  onDinnerEndChange,
  leftName,
  rightName,
}: CompareFiltersProps) {
  const handleFilterClick = (filter: CompareFilter) => {
    // Toggle off if already selected, otherwise select
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
                className={`travel-direction-btn ${travelDirection === 'to' ? 'active' : ''}`}
                onClick={() => onTravelDirectionChange('to')}
                data-tooltip="Compare first class of the day"
              >
                TO School
              </button>
              <button
                className={`travel-direction-btn ${travelDirection === 'from' ? 'active' : ''}`}
                onClick={() => onTravelDirectionChange('from')}
                data-tooltip="Compare last class of the day"
              >
                FROM School
              </button>
              <button
                className={`travel-direction-btn ${travelDirection === 'both' ? 'active' : ''}`}
                onClick={() => onTravelDirectionChange('both')}
                data-tooltip="Both can travel to AND from school together"
              >
                BOTH
              </button>
              <button
                className={`travel-direction-btn ${travelDirection === 'either' ? 'active' : ''}`}
                onClick={() => onTravelDirectionChange('either')}
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
                value={waitMinutes}
                onChange={(e) => onWaitMinutesChange(Number(e.target.value))}
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
                className={`eat-type-btn ${mealType === 'lunch' ? 'active' : ''}`}
                onClick={() => onMealTypeChange('lunch')}
                data-tooltip="Find lunch gaps only"
              >
                Lunch
              </button>
              <button
                className={`eat-type-btn ${mealType === 'dinner' ? 'active' : ''}`}
                onClick={() => onMealTypeChange('dinner')}
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
                  value={lunchStart}
                  onChange={(e) => onLunchStartChange(Number(e.target.value))}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 9).map(hour => (
                    <option key={hour} value={hour}>{formatHour(hour)}</option>
                  ))}
                </select>
                <span className="meal-time-separator">to</span>
                <select
                  className="meal-time-select"
                  value={lunchEnd}
                  onChange={(e) => onLunchEndChange(Number(e.target.value))}
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
                  value={dinnerStart}
                  onChange={(e) => onDinnerStartChange(Number(e.target.value))}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 15).map(hour => (
                    <option key={hour} value={hour}>{formatHour(hour)}</option>
                  ))}
                </select>
                <span className="meal-time-separator">to</span>
                <select
                  className="meal-time-select"
                  value={dinnerEnd}
                  onChange={(e) => onDinnerEndChange(Number(e.target.value))}
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
