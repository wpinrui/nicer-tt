import type { TimetableEvent, GroupedEvent } from '../types';
import { useCourseColorMap } from './useCourseColorMap';
import { useFilteredGroupedEvents } from './useFilteredGroupedEvents';

interface UseFilteredEventsResult {
  groupedByDate: GroupedEvent[];
  totalEvents: number;
  courseColorMap: Map<string, string>;
  uniqueCourses: string[];
  filteredCount: number;
}

/**
 * Main hook for filtered event display.
 * Composes useCourseColorMap and useFilteredGroupedEvents for a complete result.
 *
 * @param events - Array of timetable events (or null if no data loaded)
 * @param searchQuery - Text to filter events by (searches course, group, venue, tutor, date)
 * @param selectedCourses - Set of course names to show (empty = all courses)
 * @param hidePastDates - Whether to hide events with dates before today
 * @param selectedDate - Optional date filter in YYYY-MM-DD format (matches month/day only)
 * @returns Combined result with grouped events, counts, and color mapping
 */
export function useFilteredEvents(
  events: TimetableEvent[] | null,
  searchQuery: string,
  selectedCourses: Set<string>,
  hidePastDates: boolean,
  selectedDate: string | null = null
): UseFilteredEventsResult {
  const { courseColorMap, uniqueCourses } = useCourseColorMap(events);

  const { groupedByDate, totalEvents, filteredCount } = useFilteredGroupedEvents(events, {
    searchQuery,
    selectedCourses,
    hidePastDates,
    selectedDate,
  });

  return {
    groupedByDate,
    totalEvents,
    courseColorMap,
    uniqueCourses,
    filteredCount,
  };
}
