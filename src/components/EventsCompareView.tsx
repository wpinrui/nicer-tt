import { useMemo } from 'react';
import { User, ArrowRight, ArrowLeft, ArrowLeftRight, Utensils } from 'lucide-react';
import { formatTime12Hour, formatVenue, formatTutor, isToday } from '../utils/formatters';
import type { Timetable } from '../utils/parseHtml';
import type { CompareFilter } from '../utils/constants';
import {
  processEvents,
  getAllDates,
  eventsMatch,
  calculateTravelInfo,
  calculateMealInfo,
  type EventItem,
  type TravelConfig,
  type MealConfig,
} from '../utils/compareUtils';

interface EventsCompareViewProps {
  leftTimetable: Timetable;
  rightTimetable: Timetable;
  searchQuery: string;
  compareFilter: CompareFilter;
  travelConfig: TravelConfig;
  mealConfig: MealConfig;
  showTutor: boolean;
  courseColorMap: Map<string, string>;
}

export function EventsCompareView({
  leftTimetable,
  rightTimetable,
  searchQuery,
  compareFilter,
  travelConfig,
  mealConfig,
  showTutor,
  courseColorMap,
}: EventsCompareViewProps) {
  const leftGrouped = useMemo(
    () => processEvents(leftTimetable.events, searchQuery),
    [leftTimetable.events, searchQuery]
  );

  const rightGrouped = useMemo(
    () => processEvents(rightTimetable.events, searchQuery),
    [rightTimetable.events, searchQuery]
  );

  const allDates = useMemo(() => getAllDates(leftGrouped, rightGrouped), [leftGrouped, rightGrouped]);
  const leftByDate = useMemo(
    () => new Map(leftGrouped.map(g => [g.sortKey, g])),
    [leftGrouped]
  );
  const rightByDate = useMemo(
    () => new Map(rightGrouped.map(g => [g.sortKey, g])),
    [rightGrouped]
  );

  const filteredDates = useMemo(() => {
    return allDates.filter(sortKey => {
      const leftGroup = leftByDate.get(sortKey);
      const rightGroup = rightByDate.get(sortKey);

      switch (compareFilter) {
        case 'commonDays':
          return leftGroup && rightGroup && leftGroup.events.length > 0 && rightGroup.events.length > 0;

        case 'identical': {
          if (!leftGroup || !rightGroup) return false;
          return leftGroup.events.some(le =>
            rightGroup.events.some(re => eventsMatch(le, re))
          );
        }

        case 'travel': {
          if (!leftGroup || !rightGroup) return false;
          const travel = calculateTravelInfo(leftGroup.events, rightGroup.events, travelConfig.waitMinutes);

          switch (travelConfig.direction) {
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
            mealConfig.lunchStart,
            mealConfig.lunchEnd,
            mealConfig.dinnerStart,
            mealConfig.dinnerEnd
          );

          switch (mealConfig.type) {
            case 'lunch':
              return meal.canEatLunch;
            case 'dinner':
              return meal.canEatDinner;
          }
          return false;
        }

        default:
          return true;
      }
    });
  }, [allDates, leftByDate, rightByDate, compareFilter, travelConfig, mealConfig]);

  const renderEvent = (event: EventItem, index: number, isHighlighted: boolean = false) => (
    <li key={`${event.course}-${event.group}-${event.startTime}-${index}`} className={isHighlighted ? 'event-highlighted' : ''}>
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
      {filteredDates.map(sortKey => {
        const leftGroup = leftByDate.get(sortKey);
        const rightGroup = rightByDate.get(sortKey);
        const leftEvents = leftGroup?.events || [];
        const rightEvents = rightGroup?.events || [];

        const travelInfo = compareFilter === 'travel'
          ? calculateTravelInfo(leftEvents, rightEvents, travelConfig.waitMinutes)
          : null;

        const mealInfo = compareFilter === 'eat'
          ? calculateMealInfo(leftEvents, rightEvents, mealConfig.lunchStart, mealConfig.lunchEnd, mealConfig.dinnerStart, mealConfig.dinnerEnd)
          : null;

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

        const displayDate = leftGroup?.date || rightGroup?.date || sortKey;

        return (
          <div key={sortKey} className="compare-date-row">
            <div className={`compare-date-header ${isToday(sortKey) ? 'date-header-today' : ''}`}>
              <span>
                {displayDate}
                {isToday(sortKey) && ' (TODAY)'}
              </span>
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
              {mealInfo && (
                <div className="meal-indicator">
                  {mealInfo.canEatLunch && (
                    <span className="meal-badge meal-badge-lunch">
                      <Utensils size={12} /> {formatTime12Hour(mealInfo.lunchGapStart)} to {formatTime12Hour(mealInfo.lunchGapEnd)}
                    </span>
                  )}
                  {mealInfo.canEatDinner && (
                    <span className="meal-badge meal-badge-dinner">
                      <Utensils size={12} /> {formatTime12Hour(mealInfo.dinnerGapStart)} to {formatTime12Hour(mealInfo.dinnerGapEnd)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="compare-column">
              {leftEvents.length > 0 ? (
                <ul>
                  {leftEvents.map((event, i) => renderEvent(event, i, identicalLeft.has(i)))}
                </ul>
              ) : (
                <div className="compare-empty">No classes</div>
              )}
            </div>

            <div className="compare-column">
              {rightEvents.length > 0 ? (
                <ul>
                  {rightEvents.map((event, i) => renderEvent(event, i, identicalRight.has(i)))}
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
