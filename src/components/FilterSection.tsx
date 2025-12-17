import { useState } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  hidePastDates: boolean;
  onHidePastChange: (value: boolean) => void;
  uniqueCourses: string[];
  selectedCourses: Set<string>;
  courseColorMap: Map<string, string>;
  onToggleCourse: (course: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FilterSection({
  searchQuery,
  onSearchChange,
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

  return (
    <div className="filters-section no-print">
      <div className="search-row">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search courses, venues, tutors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
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
