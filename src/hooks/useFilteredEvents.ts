import { useMemo } from 'react';

import type { CustomEvent, DisplayEventItem, TimetableEvent } from '../types';
import { useCourseColorMap } from './useCourseColorMap';
import { useFilteredGroupedEvents } from './useFilteredGroupedEvents';

/**
 * Extended GroupedEvent that uses DisplayEventItem for custom event support.
 */
interface DisplayGroupedEvent {
  date: string;
  sortKey: string;
  events: DisplayEventItem[];
}

interface UseFilteredEventsResult {
  groupedByDate: DisplayGroupedEvent[];
  totalEvents: number;
  courseColorMap: Map<string, string>;
  uniqueCourses: string[];
  filteredCount: number;
}

/**
 * Main hook for filtered event display.
 * Composes useCourseColorMap and useFilteredGroupedEvents for a complete result.
 * Supports both regular events and custom events.
 *
 * @param events - Array of timetable events (or null if no data loaded)
 * @param customEvents - Array of custom events to merge with regular events
 * @param searchQuery - Text to filter events by (searches course, group, venue, tutor, date)
 * @param selectedCourses - Set of course names to show (empty = all courses)
 * @param showPastDates - Whether to show events with dates before today
 * @param selectedDate - Optional date filter in YYYY-MM-DD format (matches month/day only)
 * @returns Combined result with grouped events, counts, and color mapping
 */
export function useFilteredEvents(
  events: TimetableEvent[] | null,
  customEvents: CustomEvent[],
  searchQuery: string,
  selectedCourses: Set<string>,
  showPastDates: boolean,
  selectedDate: string | null = null
): UseFilteredEventsResult {
  // Combine regular events with custom events for color mapping
  const allEvents = useMemo(() => {
    if (!events && customEvents.length === 0) return null;
    return [...(events || []), ...customEvents];
  }, [events, customEvents]);

  const { courseColorMap, uniqueCourses } = useCourseColorMap(allEvents);

  const { groupedByDate, totalEvents, filteredCount } = useFilteredGroupedEvents(
    events,
    customEvents,
    {
      searchQuery,
      selectedCourses,
      showPastDates,
      selectedDate,
    }
  );

  return {
    groupedByDate,
    totalEvents,
    courseColorMap,
    uniqueCourses,
    filteredCount,
  };
}
