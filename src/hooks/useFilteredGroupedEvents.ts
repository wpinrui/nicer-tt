import { useMemo } from 'react';

import type {
  CustomEvent,
  DisplayEventItem,
  DisplayGroupedEvent,
  EventInstanceKey,
  EventOverride,
  TimetableEvent,
} from '../types';
import { createEventInstanceKey } from '../types';
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

interface OverrideOptions {
  overrides: Record<EventInstanceKey, EventOverride>;
  deletions: EventInstanceKey[];
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
 * Applies overrides and filters out deleted events.
 *
 * @param events - Array of timetable events (or null if no data loaded)
 * @param customEvents - Array of custom events to merge with regular events
 * @param filters - Filter options to apply
 * @param overrideOptions - Overrides and deletions to apply to imported events
 * @returns groupedByDate - Filtered events grouped by date, sorted chronologically
 * @returns totalEvents - Total count before filtering
 * @returns filteredCount - Count after applying filters
 */
export function useFilteredGroupedEvents(
  events: TimetableEvent[] | null,
  customEvents: CustomEvent[],
  filters: FilterOptions,
  overrideOptions: OverrideOptions = { overrides: {}, deletions: [] }
): UseFilteredGroupedEventsResult {
  const { searchQuery, selectedCourses, showPastDates, selectedDate } = filters;
  const { overrides, deletions } = overrideOptions;

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
      // For imported events, check if deleted
      let eventInstanceKey: EventInstanceKey | undefined;
      if (!isCustom) {
        eventInstanceKey = createEventInstanceKey(
          event.course,
          event.group,
          dateStr,
          event.startTime
        );
        if (deletions.includes(eventInstanceKey)) {
          return; // Skip deleted events
        }
      }

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
        // Custom/upgrading events use their eventType as filter name, not their course code
        let effectiveCourse: string;
        if ('eventType' in event && event.eventType) {
          effectiveCourse = event.eventType === 'upgrading' ? 'Upgrading' : 'Custom';
        } else {
          effectiveCourse = event.course;
        }
        if (!selectedCourses.has(effectiveCourse)) {
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

      // Apply overrides for imported events
      let venue = event.venue;
      let tutor = event.tutor;
      let startTime = event.startTime;
      let endTime = event.endTime;
      let isEdited = false;
      let originalVenue: string | undefined;
      let originalTutor: string | undefined;
      let originalStartTime: string | undefined;
      let originalEndTime: string | undefined;
      if (!isCustom && eventInstanceKey) {
        const override = overrides[eventInstanceKey];
        if (override?.venue !== undefined) {
          originalVenue = event.venue;
          venue = override.venue;
          isEdited = true;
        }
        if (override?.tutor !== undefined) {
          originalTutor = event.tutor;
          tutor = override.tutor;
          isEdited = true;
        }
        if (override?.startTime !== undefined) {
          originalStartTime = event.startTime;
          startTime = override.startTime;
          isEdited = true;
        }
        if (override?.endTime !== undefined) {
          originalEndTime = event.endTime;
          endTime = override.endTime;
          isEdited = true;
        }
      }

      const eventItem: DisplayEventItem = {
        course: event.course,
        group: event.group,
        startTime,
        endTime,
        venue,
        tutor,
        isCustom,
        customEventId,
        eventType: isCustom && 'eventType' in event ? event.eventType : undefined,
        description: isCustom && 'description' in event ? event.description : undefined,
        eventInstanceKey,
        isEdited,
        originalVenue,
        originalTutor,
        originalStartTime,
        originalEndTime,
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
  }, [
    events,
    customEvents,
    searchQuery,
    selectedCourses,
    showPastDates,
    selectedDate,
    overrides,
    deletions,
  ]);
}
