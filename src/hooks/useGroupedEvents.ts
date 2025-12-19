import { useMemo } from 'react';
import type { TimetableEvent, GroupedEvent, EventItem } from '../types';
import { formatDateDisplay, createSortKey } from '../utils/formatters';

interface UseGroupedEventsResult {
  groupedByDate: GroupedEvent[];
  totalEvents: number;
}

/**
 * Groups timetable events by date and sorts them chronologically.
 * Does NOT apply any filters - use useFilteredGroupedEvents for filtering.
 *
 * @param events - Array of timetable events (or null if no data loaded)
 * @returns groupedByDate - Events grouped by date, sorted chronologically
 * @returns totalEvents - Total count of event-date combinations
 */
export function useGroupedEvents(events: TimetableEvent[] | null): UseGroupedEventsResult {
  return useMemo(() => {
    if (!events) {
      return {
        groupedByDate: [],
        totalEvents: 0,
      };
    }

    const dateMap = new Map<string, GroupedEvent>();
    let total = 0;

    for (const event of events) {
      for (const dateStr of event.dates) {
        total++;

        const sortKey = createSortKey(dateStr);
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

    const sorted = Array.from(dateMap.values()).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey)
    );

    // Sort events within each date by start time
    for (const group of sorted) {
      group.events.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return {
      groupedByDate: sorted,
      totalEvents: total,
    };
  }, [events]);
}
