import { Search, X } from 'lucide-react';

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
      </div>
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
  );
}
