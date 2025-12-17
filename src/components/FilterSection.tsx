import { useState, useRef } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedDate: string | null;
  onDateChange: (value: string | null) => void;
  hidePastDates: boolean;
  onHidePastChange: (value: boolean) => void;
  uniqueCourses: string[];
  selectedCourses: Set<string>;
  courseColorMap: Map<string, string>;
  onToggleCourse: (course: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

function formatDatePill(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function FilterSection({
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  hidePastDates,
  onHidePastChange,
  uniqueCourses,
  selectedCourses,
  courseColorMap,
  onToggleCourse,
  onClearFilters,
  hasActiveFilters,
}: FilterSectionProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDatePickerClick = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(null);
  };

  return (
    <div className="filters-section no-print">
      <div className="search-row">
        <div className={`search-input-wrapper ${selectedDate ? 'has-date-pill' : ''}`}>
          <Search size={16} className="search-icon" />
          {selectedDate && (
            <button
              className="date-pill"
              onClick={handleDateClear}
              title="Clear date filter"
            >
              <span>{formatDatePill(selectedDate)}</span>
              <X size={12} className="date-pill-x" />
            </button>
          )}
          <input
            type="text"
            placeholder={selectedDate ? "Search..." : "Search courses, venues, tutors..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          <input
            ref={dateInputRef}
            type="date"
            className="date-input-hidden"
            value={selectedDate || ''}
            onChange={(e) => onDateChange(e.target.value || null)}
          />
          <button
            className="date-picker-btn"
            onClick={handleDatePickerClick}
            title="Filter by date"
          >
            <Calendar size={16} />
          </button>
        </div>
        {/* Mobile: expand filters button */}
        <button
          className="expand-filters-btn"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <Filter size={14} />
          {filtersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {selectedCourses.size > 0 && (
            <span className="filter-badge">{selectedCourses.size}</span>
          )}
        </button>
        {/* Desktop: inline controls */}
        <label className="hide-past-toggle desktop-only">
          <input
            type="checkbox"
            checked={hidePastDates}
            onChange={(e) => onHidePastChange(e.target.checked)}
          />
          <span>Hide past</span>
        </label>
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="clear-filters-btn desktop-only">
            <X size={14} /> Clear
          </button>
        )}
      </div>
      {/* Desktop: always visible course filters */}
      <div className="course-filters desktop-only">
        {uniqueCourses.map((course) => (
          <button
            key={course}
            className={`course-filter-btn ${selectedCourses.has(course) ? 'active' : ''}`}
            style={{
              backgroundColor:
                selectedCourses.has(course) || selectedCourses.size === 0
                  ? courseColorMap.get(course)
                  : '#ccc',
              opacity: selectedCourses.size === 0 || selectedCourses.has(course) ? 1 : 0.5,
            }}
            onClick={() => onToggleCourse(course)}
          >
            {course}
          </button>
        ))}
      </div>
      {/* Mobile: expandable filters panel */}
      {filtersExpanded && (
        <div className="mobile-filters-panel">
          <label className="hide-past-toggle">
            <input
              type="checkbox"
              checked={hidePastDates}
              onChange={(e) => onHidePastChange(e.target.checked)}
            />
            <span>Hide past</span>
          </label>
          {hasActiveFilters && (
            <button onClick={onClearFilters} className="clear-filters-btn">
              <X size={14} /> Clear
            </button>
          )}
          <div className="course-filters">
            {uniqueCourses.map((course) => (
              <button
                key={course}
                className={`course-filter-btn ${selectedCourses.has(course) ? 'active' : ''}`}
                style={{
                  backgroundColor:
                    selectedCourses.has(course) || selectedCourses.size === 0
                      ? courseColorMap.get(course)
                      : '#ccc',
                  opacity: selectedCourses.size === 0 || selectedCourses.has(course) ? 1 : 0.5,
                }}
                onClick={() => onToggleCourse(course)}
              >
                {course}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
