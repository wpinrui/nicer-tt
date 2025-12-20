import { Calendar, ChevronDown, ChevronUp, Filter, Search, X } from 'lucide-react';
import { memo, useRef, useState } from 'react';

import { useRenderTimer } from '../utils/perf';
import styles from './FilterSection.module.scss';

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedDate: string | null;
  onDateChange: (value: string | null) => void;
  showPastDates: boolean;
  onShowPastChange: (value: boolean) => void;
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

export const FilterSection = memo(function FilterSection({
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  showPastDates,
  onShowPastChange,
  uniqueCourses,
  selectedCourses,
  courseColorMap,
  onToggleCourse,
  onClearFilters,
  hasActiveFilters,
}: FilterSectionProps) {
  useRenderTimer('FilterSection');
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
    <div className={`${styles.section} no-print`}>
      <div className={styles.searchRow}>
        <div className={`${styles.searchInputWrapper} ${selectedDate ? styles.hasDatePill : ''}`}>
          <Search size={16} className={styles.searchIcon} />
          {selectedDate && (
            <button className={styles.datePill} onClick={handleDateClear} title="Clear date filter">
              <span>{formatDatePill(selectedDate)}</span>
              <X size={12} className={styles.datePillX} />
            </button>
          )}
          <input
            type="text"
            placeholder={selectedDate ? 'Search...' : 'Search courses, venues, tutors...'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          <input
            ref={dateInputRef}
            type="date"
            className={styles.dateInputHidden}
            value={selectedDate || ''}
            onChange={(e) => onDateChange(e.target.value || null)}
          />
          <button
            className={styles.datePickerBtn}
            onClick={handleDatePickerClick}
            title="Filter by date"
          >
            <Calendar size={16} />
          </button>
        </div>
        {/* Mobile: expand filters button */}
        <button
          className={styles.expandFiltersBtn}
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <Filter size={14} />
          {filtersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {selectedCourses.size > 0 && (
            <span className={styles.filterBadge}>{selectedCourses.size}</span>
          )}
        </button>
        {/* Desktop: inline controls */}
        <label className={`${styles.hidePastToggle} ${styles.desktopOnly}`}>
          <input
            type="checkbox"
            checked={!showPastDates}
            onChange={(e) => onShowPastChange(!e.target.checked)}
          />
          <span>Hide past</span>
        </label>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className={`${styles.clearFiltersBtn} ${styles.desktopOnly}`}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
      {/* Desktop: always visible course filters */}
      <div className={`${styles.courseFilters} ${styles.desktopOnly}`}>
        {uniqueCourses.map((course) => (
          <button
            key={course}
            className={styles.courseFilterBtn}
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
        <div className={styles.mobileFiltersPanel}>
          <label className={styles.hidePastToggle}>
            <input
              type="checkbox"
              checked={!showPastDates}
              onChange={(e) => onShowPastChange(!e.target.checked)}
            />
            <span>Hide past</span>
          </label>
          {hasActiveFilters && (
            <button onClick={onClearFilters} className={styles.clearFiltersBtn}>
              <X size={14} /> Clear
            </button>
          )}
          <div className={styles.courseFilters}>
            {uniqueCourses.map((course) => (
              <button
                key={course}
                className={styles.courseFilterBtn}
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
});
