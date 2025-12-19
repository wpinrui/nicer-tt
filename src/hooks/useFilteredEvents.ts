import { useMemo } from 'react';
import type { TimetableEvent, GroupedEvent, EventItem } from '../types';
import { COURSE_COLORS } from '../utils/constants';
import { formatDateDisplay, getDateSearchString, createSortKey, getTodaySortKey } from '../utils/formatters';

function getCourseColor(course: string, courseMap: Map<string, string>): string {
  if (!courseMap.has(course)) {
    const index = courseMap.size % COURSE_COLORS.length;
    courseMap.set(course, COURSE_COLORS[index]);
  }
  return courseMap.get(course)!;
}

interface UseFilteredEventsResult {
  groupedByDate: GroupedEvent[];
  totalEvents: number;
  courseColorMap: Map<string, string>;
  uniqueCourses: string[];
  filteredCount: number;
}

export function useFilteredEvents(
  events: TimetableEvent[] | null,
  searchQuery: string,
  selectedCourses: Set<string>,
  hidePastDates: boolean,
  selectedDate: string | null = null
): UseFilteredEventsResult {
  return useMemo(() => {
    if (!events) {
      return {
        groupedByDate: [],
        totalEvents: 0,
        courseColorMap: new Map<string, string>(),
        uniqueCourses: [],
        filteredCount: 0,
      };
    }

    const dateMap = new Map<string, GroupedEvent>();
    const colorMap = new Map<string, string>();
    let total = 0;
    let filtered = 0;

    // First pass: collect all unique courses to assign colors
    const coursesSet = new Set<string>();
    for (const event of events) {
      coursesSet.add(event.course);
    }
    const coursesArray = Array.from(coursesSet).sort();
    coursesArray.forEach((course) => {
      getCourseColor(course, colorMap);
    });

    const query = searchQuery.toLowerCase();
    const hasFilters = selectedCourses.size > 0 || query.length > 0 || hidePastDates || selectedDate !== null;
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

        // Filter past dates if toggle is on
        if (hidePastDates && sortKey < todaySortKey) {
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
        const dateSearchStr = getDateSearchString(dateStr);
        if (
          query &&
          !event.course.toLowerCase().includes(query) &&
          !event.group.toLowerCase().includes(query) &&
          !event.venue.toLowerCase().includes(query) &&
          !event.tutor.toLowerCase().includes(query) &&
          !dateSearchStr.toLowerCase().includes(query)
        ) {
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
      courseColorMap: colorMap,
      uniqueCourses: coursesArray,
      filteredCount: hasFilters ? filtered : total,
    };
  }, [events, searchQuery, selectedCourses, hidePastDates, selectedDate]);
}
