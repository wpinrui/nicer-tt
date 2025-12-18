import { useMemo } from 'react';
import { User, ArrowRight, ArrowLeft, ArrowLeftRight, Utensils } from 'lucide-react';
import { formatTime12Hour, formatVenue, formatTutor, isToday, createSortKey } from '../utils/formatters';
import type { Timetable, TimetableEvent } from '../utils/parseHtml';

type CompareFilter = 'none' | 'commonDays' | 'identical' | 'travel' | 'eat';
type TravelDirection = 'to' | 'from' | 'both' | 'either';
type MealType = 'lunch' | 'dinner';

interface EventItem {
  course: string;
  group: string;
  startTime: string;
  endTime: string;
  venue: string;
  tutor: string;
}

interface GroupedEvent {
  date: string;
  sortKey: string;
  events: EventItem[];
}

interface TravelInfo {
  canTravelTo: boolean;
  canTravelFrom: boolean;
  leftEarliest: string;
  rightEarliest: string;
  leftLatest: string;
  rightLatest: string;
  toDiff: number;
  fromDiff: number;
}

interface MealInfo {
  canEatLunch: boolean;
  canEatDinner: boolean;
  lunchGapStart: string;
  lunchGapEnd: string;
  dinnerGapStart: string;
  dinnerGapEnd: string;
}

interface EventsCompareViewProps {
  leftTimetable: Timetable;
  rightTimetable: Timetable;
  searchQuery: string;
  compareFilter: CompareFilter;
  travelDirection: TravelDirection;
  waitMinutes: number;
  mealType: MealType;
  lunchStart: number;
  lunchEnd: number;
  dinnerStart: number;
  dinnerEnd: number;
  showTutor: boolean;
  courseColorMap: Map<string, string>;
}

// Convert time string "HHMM" to minutes since midnight
function timeToMinutes(time: string): number {
  const hours = parseInt(time.slice(0, 2), 10);
  const minutes = parseInt(time.slice(2, 4), 10);
  return hours * 60 + minutes;
}

// Process timetable events into grouped format
function processEvents(
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
          dateStr,
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
  for (const [sortKey, events] of dateMap) {
    // Sort events by start time
    events.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    // Format date display
    const [year, month, day] = sortKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });

    grouped.push({
      sortKey,
      date: `${dayName}, ${day} ${monthName}`,
      events,
    });
  }

  grouped.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  return grouped;
}

// Get all unique dates from both timetables
function getAllDates(left: GroupedEvent[], right: GroupedEvent[]): string[] {
  const dates = new Set<string>();
  left.forEach(g => dates.add(g.sortKey));
  right.forEach(g => dates.add(g.sortKey));
  return Array.from(dates).sort();
}

// Check if two events are identical (same course, group, and time)
function eventsMatch(a: EventItem, b: EventItem): boolean {
  return a.course === b.course &&
    a.group === b.group &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime;
}

// Calculate travel compatibility for a given date
function calculateTravelInfo(
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

// Convert minutes to HHMM format
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}${mins.toString().padStart(2, '0')}`;
}

// Find gaps in a day's schedule
function findGaps(events: EventItem[]): { start: number; end: number }[] {
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
// They must have classes that "bracket" the meal time (with buffer flexibility)
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

  // Person is available if:
  // 1. They have a class ending at or after (mealStart - buffer) - they're at school or arriving
  // 2. They have a class starting at or before (mealEnd + buffer) - they have reason to stay
  // This ensures the meal window is "between" their classes (with buffer flexibility)

  const hasClassBeforeMeal = latestEnd >= mealStart - MEAL_BUFFER_MINUTES;
  const hasClassAfterMeal = earliestStart <= mealEnd + MEAL_BUFFER_MINUTES;

  // But we also need to check there's actually a class on EACH side of the meal window
  // (not just that their schedule spans the window)
  let hasClassEndingBeforeMealEnds = false;
  let hasClassStartingAfterMealStarts = false;

  for (const e of events) {
    const end = timeToMinutes(e.endTime);
    const start = timeToMinutes(e.startTime);

    // Class ends before or during the meal window (with buffer for arriving early)
    if (end <= mealEnd + MEAL_BUFFER_MINUTES && end >= mealStart - MEAL_BUFFER_MINUTES) {
      hasClassEndingBeforeMealEnds = true;
    }
    // Class that ends before meal starts (they're already at school)
    if (end <= mealStart && end >= mealStart - MEAL_BUFFER_MINUTES * 2) {
      hasClassEndingBeforeMealEnds = true;
    }

    // Class starts after or during the meal window (with buffer for staying late)
    if (start >= mealStart - MEAL_BUFFER_MINUTES && start <= mealEnd + MEAL_BUFFER_MINUTES) {
      hasClassStartingAfterMealStarts = true;
    }
    // Class that starts after meal ends (they have reason to stay)
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
  minDuration: number = 60 // 1 hour in minutes
): { start: number; end: number } | null {
  for (const leftGap of leftGaps) {
    for (const rightGap of rightGaps) {
      // Find overlap between the two gaps
      const overlapStart = Math.max(leftGap.start, rightGap.start, windowStart);
      const overlapEnd = Math.min(leftGap.end, rightGap.end, windowEnd);

      // Check if overlap is within the time window and at least minDuration
      if (overlapEnd - overlapStart >= minDuration) {
        return { start: overlapStart, end: overlapEnd };
      }
    }
  }
  return null;
}

// Calculate meal compatibility for a given date
function calculateMealInfo(
  leftEvents: EventItem[],
  rightEvents: EventItem[],
  lunchStart: number,
  lunchEnd: number,
  dinnerStart: number,
  dinnerEnd: number
): MealInfo {
  // Both must have classes on this day
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

  // Convert hours to minutes
  const lunchStartMin = lunchStart * 60;
  const lunchEndMin = lunchEnd * 60;
  const dinnerStartMin = dinnerStart * 60;
  const dinnerEndMin = dinnerEnd * 60;

  // Check if both people are "available" for each meal
  // (have classes bracketing the meal window)
  const leftAvailableLunch = isAvailableForMeal(leftEvents, lunchStartMin, lunchEndMin);
  const rightAvailableLunch = isAvailableForMeal(rightEvents, lunchStartMin, lunchEndMin);
  const leftAvailableDinner = isAvailableForMeal(leftEvents, dinnerStartMin, dinnerEndMin);
  const rightAvailableDinner = isAvailableForMeal(rightEvents, dinnerStartMin, dinnerEndMin);

  const leftGaps = findGaps(leftEvents);
  const rightGaps = findGaps(rightEvents);

  // Find lunch gap (only if both are available)
  let lunchGap: { start: number; end: number } | null = null;
  if (leftAvailableLunch && rightAvailableLunch) {
    lunchGap = findOverlappingGap(leftGaps, rightGaps, lunchStartMin, lunchEndMin);
  }

  // Find dinner gap (only if both are available)
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

export function EventsCompareView({
  leftTimetable,
  rightTimetable,
  searchQuery,
  compareFilter,
  travelDirection,
  waitMinutes,
  mealType,
  lunchStart,
  lunchEnd,
  dinnerStart,
  dinnerEnd,
  showTutor,
  courseColorMap,
}: EventsCompareViewProps) {
  // Process both timetables
  const leftGrouped = useMemo(
    () => processEvents(leftTimetable.events, searchQuery),
    [leftTimetable.events, searchQuery]
  );

  const rightGrouped = useMemo(
    () => processEvents(rightTimetable.events, searchQuery),
    [rightTimetable.events, searchQuery]
  );

  // Get all dates and create lookup maps
  const allDates = useMemo(() => getAllDates(leftGrouped, rightGrouped), [leftGrouped, rightGrouped]);
  const leftByDate = useMemo(
    () => new Map(leftGrouped.map(g => [g.sortKey, g])),
    [leftGrouped]
  );
  const rightByDate = useMemo(
    () => new Map(rightGrouped.map(g => [g.sortKey, g])),
    [rightGrouped]
  );

  // Apply compare filters
  const filteredDates = useMemo(() => {
    return allDates.filter(sortKey => {
      const leftGroup = leftByDate.get(sortKey);
      const rightGroup = rightByDate.get(sortKey);

      switch (compareFilter) {
        case 'commonDays':
          // Both must have events on this day
          return leftGroup && rightGroup && leftGroup.events.length > 0 && rightGroup.events.length > 0;

        case 'identical': {
          // Both must have at least one matching event
          if (!leftGroup || !rightGroup) return false;
          return leftGroup.events.some(le =>
            rightGroup.events.some(re => eventsMatch(le, re))
          );
        }

        case 'travel': {
          if (!leftGroup || !rightGroup) return false;
          const travel = calculateTravelInfo(leftGroup.events, rightGroup.events, waitMinutes);

          switch (travelDirection) {
            case 'to':
              return travel.canTravelTo;
            case 'from':
              return travel.canTravelFrom;
            case 'both':
              return travel.canTravelTo && travel.canTravelFrom;
            case 'either':
              return travel.canTravelTo || travel.canTravelFrom;
          }
          return false;
        }

        case 'eat': {
          if (!leftGroup || !rightGroup) return false;
          const meal = calculateMealInfo(
            leftGroup.events,
            rightGroup.events,
            lunchStart,
            lunchEnd,
            dinnerStart,
            dinnerEnd
          );

          switch (mealType) {
            case 'lunch':
              return meal.canEatLunch;
            case 'dinner':
              return meal.canEatDinner;
          }
          return false;
        }

        default:
          // No filter - show all dates
          return true;
      }
    });
  }, [allDates, leftByDate, rightByDate, compareFilter, travelDirection, waitMinutes, mealType, lunchStart, lunchEnd, dinnerStart, dinnerEnd]);

  // Render a single event item
  const renderEvent = (event: EventItem, isHighlighted: boolean = false) => (
    <li key={`${event.course}-${event.startTime}`} className={isHighlighted ? 'event-highlighted' : ''}>
      <span className="event-time">
        <span className="time-start">{formatTime12Hour(event.startTime)}</span>
        <span className="time-separator">–</span>
        <span className="time-end">{formatTime12Hour(event.endTime)}</span>
      </span>
      <span className="course-tag-wrapper">
        <span
          className="course-tag"
          style={{ backgroundColor: courseColorMap.get(event.course) || '#666' }}
        >
          {event.course}
        </span>
      </span>
      <span className="event-group">{event.group}</span>
      {event.venue && (
        <span className="event-venue">@ {formatVenue(event.venue)}</span>
      )}
      {event.tutor && (
        showTutor ? (
          <span className="event-tutor">
            <User size={14} />
            {formatTutor(event.tutor)}
          </span>
        ) : (
          <span className="event-tutor-icon" title={formatTutor(event.tutor)}>
            <User size={14} />
          </span>
        )
      )}
    </li>
  );

  if (filteredDates.length === 0) {
    return <div className="no-results">No events match your filters</div>;
  }

  return (
    <div className="events-compare-container">
      {/* Events by date */}
      {filteredDates.map(sortKey => {
        const leftGroup = leftByDate.get(sortKey);
        const rightGroup = rightByDate.get(sortKey);
        const leftEvents = leftGroup?.events || [];
        const rightEvents = rightGroup?.events || [];

        // Get travel info for travel mode indicator
        const travelInfo = compareFilter === 'travel'
          ? calculateTravelInfo(leftEvents, rightEvents, waitMinutes)
          : null;

        // Get meal info for eat mode indicator
        const mealInfo = compareFilter === 'eat'
          ? calculateMealInfo(leftEvents, rightEvents, lunchStart, lunchEnd, dinnerStart, dinnerEnd)
          : null;

        // Determine which events are identical (for identical mode highlighting)
        const identicalLeft = new Set<number>();
        const identicalRight = new Set<number>();
        if (compareFilter === 'identical') {
          leftEvents.forEach((le, li) => {
            rightEvents.forEach((re, ri) => {
              if (eventsMatch(le, re)) {
                identicalLeft.add(li);
                identicalRight.add(ri);
              }
            });
          });
        }

        // Format date for display
        const displayDate = leftGroup?.date || rightGroup?.date || sortKey;

        return (
          <div key={sortKey} className="compare-date-row">
            {/* Date header spanning both columns */}
            <div className={`compare-date-header ${isToday(sortKey) ? 'date-header-today' : ''}`}>
              <span>
                {displayDate}
                {isToday(sortKey) && ' (TODAY)'}
              </span>
              {/* Travel indicator */}
              {travelInfo && (
                <div className="travel-indicator">
                  {travelInfo.canTravelTo && travelInfo.canTravelFrom && (
                    <span
                      className="travel-badge travel-badge-both"
                      data-tooltip={`TO: ${formatTime12Hour(travelInfo.leftEarliest)} vs ${formatTime12Hour(travelInfo.rightEarliest)} (${travelInfo.toDiff} min diff) | FROM: ${formatTime12Hour(travelInfo.leftLatest)} vs ${formatTime12Hour(travelInfo.rightLatest)} (${travelInfo.fromDiff} min diff)`}
                    >
                      <ArrowLeftRight size={12} /> Both
                    </span>
                  )}
                  {travelInfo.canTravelTo && !travelInfo.canTravelFrom && (
                    <span
                      className="travel-badge travel-badge-to"
                      data-tooltip={`TO school: ${formatTime12Hour(travelInfo.leftEarliest)} vs ${formatTime12Hour(travelInfo.rightEarliest)} (${travelInfo.toDiff} min diff)`}
                    >
                      <ArrowRight size={12} /> To
                    </span>
                  )}
                  {!travelInfo.canTravelTo && travelInfo.canTravelFrom && (
                    <span
                      className="travel-badge travel-badge-from"
                      data-tooltip={`FROM school: ${formatTime12Hour(travelInfo.leftLatest)} vs ${formatTime12Hour(travelInfo.rightLatest)} (${travelInfo.fromDiff} min diff)`}
                    >
                      <ArrowLeft size={12} /> From
                    </span>
                  )}
                </div>
              )}
              {/* Meal indicator */}
              {mealInfo && (
                <div className="meal-indicator">
                  {mealInfo.canEatLunch && (
                    <span className="meal-badge meal-badge-lunch">
                      <Utensils size={12} /> {formatTime12Hour(mealInfo.lunchGapStart)}–{formatTime12Hour(mealInfo.lunchGapEnd)}
                    </span>
                  )}
                  {mealInfo.canEatDinner && (
                    <span className="meal-badge meal-badge-dinner">
                      <Utensils size={12} /> {formatTime12Hour(mealInfo.dinnerGapStart)}–{formatTime12Hour(mealInfo.dinnerGapEnd)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Left column events */}
            <div className="compare-column">
              {leftEvents.length > 0 ? (
                <ul>
                  {leftEvents.map((event, i) => renderEvent(event, identicalLeft.has(i)))}
                </ul>
              ) : (
                <div className="compare-empty">No classes</div>
              )}
            </div>

            {/* Right column events */}
            <div className="compare-column">
              {rightEvents.length > 0 ? (
                <ul>
                  {rightEvents.map((event, i) => renderEvent(event, identicalRight.has(i)))}
                </ul>
              ) : (
                <div className="compare-empty">No classes</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
