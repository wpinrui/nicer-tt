import { createSortKey, getDateSearchString } from './formatters';
import type { TimetableEvent, EventItem, GroupedEvent } from '../types';

// Re-export types for backward compatibility
export type {
  EventItem,
  GroupedEvent,
  TravelInfo,
  MealInfo,
  TravelConfig,
  MealConfig,
} from '../types';

// Convert time string "HHMM" to minutes since midnight
export function timeToMinutes(time: string): number {
  const hours = parseInt(time.slice(0, 2), 10);
  const minutes = parseInt(time.slice(2, 4), 10);
  return hours * 60 + minutes;
}

// Convert minutes to HHMM format
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}${mins.toString().padStart(2, '0')}`;
}

// Process timetable events into grouped format
export function processEvents(
  events: TimetableEvent[],
  searchQuery: string
): GroupedEvent[] {
  const dateMap = new Map<string, EventItem[]>();
  const searchLower = searchQuery.toLowerCase();

  for (const event of events) {
    for (const dateStr of event.dates) {
      const sortKey = createSortKey(dateStr);

      // Apply search filter
      if (searchQuery) {
        const searchFields = [
          event.course,
          event.group,
          event.venue,
          event.tutor,
          getDateSearchString(dateStr),
        ].join(' ').toLowerCase();

        if (!searchFields.includes(searchLower)) continue;
      }

      if (!dateMap.has(sortKey)) {
        dateMap.set(sortKey, []);
      }

      dateMap.get(sortKey)!.push({
        course: event.course,
        group: event.group,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        tutor: event.tutor,
      });
    }
  }

  // Convert to array and sort
  const grouped: GroupedEvent[] = [];
  for (const [sortKey, eventsList] of dateMap) {
    // Sort events by start time
    eventsList.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    // Format date display
    const [year, month, day] = sortKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });

    grouped.push({
      sortKey,
      date: `${dayName}, ${day} ${monthName}`,
      events: eventsList,
    });
  }

  grouped.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  return grouped;
}

// Get all unique dates from both timetables
export function getAllDates(left: GroupedEvent[], right: GroupedEvent[]): string[] {
  const dates = new Set<string>();
  left.forEach(g => dates.add(g.sortKey));
  right.forEach(g => dates.add(g.sortKey));
  return Array.from(dates).sort();
}

// Check if two events are identical (same course, group, and time)
export function eventsMatch(a: EventItem, b: EventItem): boolean {
  return a.course === b.course &&
    a.group === b.group &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime;
}

// Calculate travel compatibility for a given date
export function calculateTravelInfo(
  leftEvents: EventItem[],
  rightEvents: EventItem[],
  waitMinutes: number
): TravelInfo {
  if (leftEvents.length === 0 || rightEvents.length === 0) {
    return {
      canTravelTo: false,
      canTravelFrom: false,
      leftEarliest: '',
      rightEarliest: '',
      leftLatest: '',
      rightLatest: '',
      toDiff: 0,
      fromDiff: 0,
    };
  }

  // Find earliest and latest times for each side
  const leftEarliest = leftEvents.reduce((min, e) =>
    timeToMinutes(e.startTime) < timeToMinutes(min.startTime) ? e : min
  ).startTime;

  const rightEarliest = rightEvents.reduce((min, e) =>
    timeToMinutes(e.startTime) < timeToMinutes(min.startTime) ? e : min
  ).startTime;

  const leftLatest = leftEvents.reduce((max, e) =>
    timeToMinutes(e.endTime) > timeToMinutes(max.endTime) ? e : max
  ).endTime;

  const rightLatest = rightEvents.reduce((max, e) =>
    timeToMinutes(e.endTime) > timeToMinutes(max.endTime) ? e : max
  ).endTime;

  // Check if they can travel together
  const earlyDiff = Math.abs(timeToMinutes(leftEarliest) - timeToMinutes(rightEarliest));
  const lateDiff = Math.abs(timeToMinutes(leftLatest) - timeToMinutes(rightLatest));

  return {
    canTravelTo: earlyDiff <= waitMinutes,
    canTravelFrom: lateDiff <= waitMinutes,
    leftEarliest,
    rightEarliest,
    leftLatest,
    rightLatest,
    toDiff: earlyDiff,
    fromDiff: lateDiff,
  };
}

// Find gaps in a day's schedule
export function findGaps(events: EventItem[]): { start: number; end: number }[] {
  if (events.length === 0) return [];

  // Sort events by start time
  const sorted = [...events].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const gaps: { start: number; end: number }[] = [];

  // Gap before first class (from midnight to first class)
  const firstStart = timeToMinutes(sorted[0].startTime);
  if (firstStart > 0) {
    gaps.push({ start: 0, end: firstStart });
  }

  // Gaps between classes
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = timeToMinutes(sorted[i].endTime);
    const nextStart = timeToMinutes(sorted[i + 1].startTime);
    if (nextStart > currentEnd) {
      gaps.push({ start: currentEnd, end: nextStart });
    }
  }

  // Gap after last class (to end of day)
  const lastEnd = timeToMinutes(sorted[sorted.length - 1].endTime);
  if (lastEnd < 24 * 60) {
    gaps.push({ start: lastEnd, end: 24 * 60 });
  }

  return gaps;
}

// Buffer time: willing to arrive early or stay late by this amount (30 min)
const MEAL_BUFFER_MINUTES = 30;

// Check if a person is "available" for a meal during the given window
function isAvailableForMeal(
  events: EventItem[],
  mealStart: number,
  mealEnd: number
): boolean {
  if (events.length === 0) return false;

  // Find earliest start and latest end of classes
  let earliestStart = Infinity;
  let latestEnd = 0;

  for (const e of events) {
    const start = timeToMinutes(e.startTime);
    const end = timeToMinutes(e.endTime);
    if (start < earliestStart) earliestStart = start;
    if (end > latestEnd) latestEnd = end;
  }

  const hasClassBeforeMeal = latestEnd >= mealStart - MEAL_BUFFER_MINUTES;
  const hasClassAfterMeal = earliestStart <= mealEnd + MEAL_BUFFER_MINUTES;

  let hasClassEndingBeforeMealEnds = false;
  let hasClassStartingAfterMealStarts = false;

  for (const e of events) {
    const end = timeToMinutes(e.endTime);
    const start = timeToMinutes(e.startTime);

    if (end <= mealEnd + MEAL_BUFFER_MINUTES && end >= mealStart - MEAL_BUFFER_MINUTES) {
      hasClassEndingBeforeMealEnds = true;
    }
    if (end <= mealStart && end >= mealStart - MEAL_BUFFER_MINUTES * 2) {
      hasClassEndingBeforeMealEnds = true;
    }

    if (start >= mealStart - MEAL_BUFFER_MINUTES && start <= mealEnd + MEAL_BUFFER_MINUTES) {
      hasClassStartingAfterMealStarts = true;
    }
    if (start >= mealEnd && start <= mealEnd + MEAL_BUFFER_MINUTES * 2) {
      hasClassStartingAfterMealStarts = true;
    }
  }

  return hasClassBeforeMeal && hasClassAfterMeal &&
    hasClassEndingBeforeMealEnds && hasClassStartingAfterMealStarts;
}

// Find overlapping gap between two schedules within a time window
function findOverlappingGap(
  leftGaps: { start: number; end: number }[],
  rightGaps: { start: number; end: number }[],
  windowStart: number,
  windowEnd: number,
  minDuration: number = 60
): { start: number; end: number } | null {
  for (const leftGap of leftGaps) {
    for (const rightGap of rightGaps) {
      const overlapStart = Math.max(leftGap.start, rightGap.start, windowStart);
      const overlapEnd = Math.min(leftGap.end, rightGap.end, windowEnd);

      if (overlapEnd - overlapStart >= minDuration) {
        return { start: overlapStart, end: overlapEnd };
      }
    }
  }
  return null;
}

// Calculate meal compatibility for a given date
export function calculateMealInfo(
  leftEvents: EventItem[],
  rightEvents: EventItem[],
  lunchStart: number,
  lunchEnd: number,
  dinnerStart: number,
  dinnerEnd: number
): MealInfo {
  if (leftEvents.length === 0 || rightEvents.length === 0) {
    return {
      canEatLunch: false,
      canEatDinner: false,
      lunchGapStart: '',
      lunchGapEnd: '',
      dinnerGapStart: '',
      dinnerGapEnd: '',
    };
  }

  const lunchStartMin = lunchStart * 60;
  const lunchEndMin = lunchEnd * 60;
  const dinnerStartMin = dinnerStart * 60;
  const dinnerEndMin = dinnerEnd * 60;

  const leftAvailableLunch = isAvailableForMeal(leftEvents, lunchStartMin, lunchEndMin);
  const rightAvailableLunch = isAvailableForMeal(rightEvents, lunchStartMin, lunchEndMin);
  const leftAvailableDinner = isAvailableForMeal(leftEvents, dinnerStartMin, dinnerEndMin);
  const rightAvailableDinner = isAvailableForMeal(rightEvents, dinnerStartMin, dinnerEndMin);

  const leftGaps = findGaps(leftEvents);
  const rightGaps = findGaps(rightEvents);

  let lunchGap: { start: number; end: number } | null = null;
  if (leftAvailableLunch && rightAvailableLunch) {
    lunchGap = findOverlappingGap(leftGaps, rightGaps, lunchStartMin, lunchEndMin);
  }

  let dinnerGap: { start: number; end: number } | null = null;
  if (leftAvailableDinner && rightAvailableDinner) {
    dinnerGap = findOverlappingGap(leftGaps, rightGaps, dinnerStartMin, dinnerEndMin);
  }

  return {
    canEatLunch: lunchGap !== null,
    canEatDinner: dinnerGap !== null,
    lunchGapStart: lunchGap ? minutesToTime(lunchGap.start) : '',
    lunchGapEnd: lunchGap ? minutesToTime(lunchGap.end) : '',
    dinnerGapStart: dinnerGap ? minutesToTime(dinnerGap.start) : '',
    dinnerGapEnd: dinnerGap ? minutesToTime(dinnerGap.end) : '',
  };
}
