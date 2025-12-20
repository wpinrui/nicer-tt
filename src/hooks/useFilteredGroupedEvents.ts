import { useMemo } from 'react';

import type { EventItem, GroupedEvent, TimetableEvent } from '../types';
import {
  createSortKey,
  formatDateDisplay,
  getTodaySortKey,
  matchesEventSearch,
} from '../utils/formatters';

interface FilterOptions {
  searchQuery: string;
  selectedCourses: Set<string>;
  showPastDates: boolean;
  selectedDate: string | null;
}

interface UseFilteredGroupedEventsResult {
  groupedByDate: GroupedEvent[];
  totalEvents: number;
  filteredCount: number;
}

/**
 * Applies filters to events and groups them by date.
 * Filters include: search query, course selection, hide past dates, and date picker.
 *
 * @param events - Array of timetable events (or null if no data loaded)
 * @param filters - Filter options to apply
 * @returns groupedByDate - Filtered events grouped by date, sorted chronologically
 * @returns totalEvents - Total count before filtering
 * @returns filteredCount - Count after applying filters
 */
export function useFilteredGroupedEvents(
  events: TimetableEvent[] | null,
  filters: FilterOptions
): UseFilteredGroupedEventsResult {
  const { searchQuery, selectedCourses, showPastDates, selectedDate } = filters;

  return useMemo(() => {
    if (!events) {
      return {
        groupedByDate: [],
        totalEvents: 0,
        filteredCount: 0,
      };
    }

    const dateMap = new Map<string, GroupedEvent>();
    let total = 0;
    let filtered = 0;

    const hasFilters =
      selectedCourses.size > 0 || searchQuery.length > 0 || !showPastDates || selectedDate !== null;
    const todaySortKey = getTodaySortKey();

    // Parse selected date for filtering (format: YYYY-MM-DD from date input)
    let filterMonth: number | null = null;
    let filterDay: number | null = null;
    if (selectedDate) {
      const [, month, day] = selectedDate.split('-').map(Number);
      filterMonth = month;
      filterDay = day;
    }

    for (const event of events) {
      for (const dateStr of event.dates) {
        total++;

        const sortKey = createSortKey(dateStr);

        // Filter past dates if not showing them
        if (!showPastDates && sortKey < todaySortKey) {
          continue;
        }

        // Filter by selected date (match month and day only)
        if (filterMonth !== null && filterDay !== null) {
          const [eventDay, eventMonth] = dateStr.split('/').map(Number);
          if (eventMonth !== filterMonth || eventDay !== filterDay) {
            continue;
          }
        }

        // Apply course filter
        if (selectedCourses.size > 0 && !selectedCourses.has(event.course)) {
          continue;
        }

        // Apply search filter
        if (!matchesEventSearch(event, dateStr, searchQuery)) {
          continue;
        }

        filtered++;

        const displayDate = formatDateDisplay(dateStr);
        if (!dateMap.has(sortKey)) {
          dateMap.set(sortKey, { date: displayDate, sortKey, events: [] });
        }

        const eventItem: EventItem = {
          course: event.course,
          group: event.group,
          startTime: event.startTime,
          endTime: event.endTime,
          venue: event.venue,
          tutor: event.tutor,
        };
        dateMap.get(sortKey)!.events.push(eventItem);
      }
    }

    const sorted = Array.from(dateMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    // Sort events within each date by start time
    for (const group of sorted) {
      group.events.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return {
      groupedByDate: sorted,
      totalEvents: total,
      filteredCount: hasFilters ? filtered : total,
    };
  }, [events, searchQuery, selectedCourses, showPastDates, selectedDate]);
}
