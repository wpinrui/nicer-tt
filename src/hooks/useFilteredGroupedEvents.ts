import { useMemo } from 'react';

import type { CustomEvent, DisplayEventItem, TimetableEvent } from '../types';
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

/**
 * Extended GroupedEvent that uses DisplayEventItem for custom event support.
 */
interface DisplayGroupedEvent {
  date: string;
  sortKey: string;
  events: DisplayEventItem[];
}

interface UseFilteredGroupedEventsResult {
  groupedByDate: DisplayGroupedEvent[];
  totalEvents: number;
  filteredCount: number;
}

/**
 * Applies filters to events and groups them by date.
 * Filters include: search query, course selection, hide past dates, and date picker.
 * Supports both regular events and custom events (marked with isCustom flag).
 *
 * @param events - Array of timetable events (or null if no data loaded)
 * @param customEvents - Array of custom events to merge with regular events
 * @param filters - Filter options to apply
 * @returns groupedByDate - Filtered events grouped by date, sorted chronologically
 * @returns totalEvents - Total count before filtering
 * @returns filteredCount - Count after applying filters
 */
export function useFilteredGroupedEvents(
  events: TimetableEvent[] | null,
  customEvents: CustomEvent[],
  filters: FilterOptions
): UseFilteredGroupedEventsResult {
  const { searchQuery, selectedCourses, showPastDates, selectedDate } = filters;

  return useMemo(() => {
    if (!events && customEvents.length === 0) {
      return {
        groupedByDate: [],
        totalEvents: 0,
        filteredCount: 0,
      };
    }

    const dateMap = new Map<string, DisplayGroupedEvent>();
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

    /**
     * Process a single event-date combination and add to the map if it passes filters.
     */
    const processEventDate = (
      event: TimetableEvent | CustomEvent,
      dateStr: string,
      isCustom: boolean,
      customEventId?: string
    ) => {
      total++;

      const sortKey = createSortKey(dateStr);

      // Filter past dates if not showing them
      if (!showPastDates && sortKey < todaySortKey) {
        return;
      }

      // Filter by selected date (match month and day only)
      if (filterMonth !== null && filterDay !== null) {
        const [, eventMonth, eventDay] = dateStr.split('-').map(Number);
        if (eventMonth !== filterMonth || eventDay !== filterDay) {
          return;
        }
      }

      // Apply course filter
      if (selectedCourses.size > 0) {
        // Get effective course name (handles legacy custom events with empty course)
        let effectiveCourse = event.course;
        if (!effectiveCourse && 'eventType' in event && event.eventType) {
          effectiveCourse = event.eventType === 'upgrading' ? 'Upgrading' : 'Custom';
        }
        if (effectiveCourse && !selectedCourses.has(effectiveCourse)) {
          return;
        }
      }

      // Apply search filter
      if (!matchesEventSearch(event, dateStr, searchQuery)) {
        return;
      }

      filtered++;

      const displayDate = formatDateDisplay(dateStr);
      if (!dateMap.has(sortKey)) {
        dateMap.set(sortKey, { date: displayDate, sortKey, events: [] });
      }

      const eventItem: DisplayEventItem = {
        course: event.course,
        group: event.group,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        tutor: event.tutor,
        isCustom,
        customEventId,
        eventType: isCustom && 'eventType' in event ? event.eventType : undefined,
        description: isCustom && 'description' in event ? event.description : undefined,
      };
      dateMap.get(sortKey)!.events.push(eventItem);
    };

    // Process regular events
    if (events) {
      for (const event of events) {
        for (const dateStr of event.dates) {
          processEventDate(event, dateStr, false);
        }
      }
    }

    // Process custom events
    for (const customEvent of customEvents) {
      for (const dateStr of customEvent.dates) {
        processEventDate(customEvent, dateStr, true, customEvent.id);
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
  }, [events, customEvents, searchQuery, selectedCourses, showPastDates, selectedDate]);
}
