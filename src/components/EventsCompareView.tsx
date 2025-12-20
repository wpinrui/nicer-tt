import { ArrowLeft, ArrowLeftRight, ArrowRight, Utensils } from 'lucide-react';
import { useMemo } from 'react';

import type { CompareFilter, MealConfig, Timetable, TravelConfig } from '../types';
import {
  calculateMealInfo,
  calculateTravelInfo,
  eventsMatch,
  getAllDates,
  processEvents,
} from '../utils/compareUtils';
import { formatTime12Hour, isToday } from '../utils/formatters';
import { useRenderTimer } from '../utils/perf';
import { EventCard } from './EventCard';
import styles from './EventsCompareView.module.scss';

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
  useRenderTimer('EventsCompareView');

  const leftGrouped = useMemo(
    () => processEvents(leftTimetable.events, searchQuery),
    [leftTimetable.events, searchQuery]
  );

  const rightGrouped = useMemo(
    () => processEvents(rightTimetable.events, searchQuery),
    [rightTimetable.events, searchQuery]
  );

  const allDates = useMemo(
    () => getAllDates(leftGrouped, rightGrouped),
    [leftGrouped, rightGrouped]
  );
  const leftByDate = useMemo(() => new Map(leftGrouped.map((g) => [g.sortKey, g])), [leftGrouped]);
  const rightByDate = useMemo(
    () => new Map(rightGrouped.map((g) => [g.sortKey, g])),
    [rightGrouped]
  );

  const filteredDates = useMemo(() => {
    return allDates.filter((sortKey) => {
      const leftGroup = leftByDate.get(sortKey);
      const rightGroup = rightByDate.get(sortKey);

      switch (compareFilter) {
        case 'commonDays':
          return (
            leftGroup && rightGroup && leftGroup.events.length > 0 && rightGroup.events.length > 0
          );

        case 'identical': {
          if (!leftGroup || !rightGroup) return false;
          return leftGroup.events.some((le) => rightGroup.events.some((re) => eventsMatch(le, re)));
        }

        case 'travel': {
          if (!leftGroup || !rightGroup) return false;
          const travel = calculateTravelInfo(
            leftGroup.events,
            rightGroup.events,
            travelConfig.waitMinutes
          );

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

  if (filteredDates.length === 0) {
    return <div className={styles.noResults}>No events match your filters</div>;
  }

  return (
    <div className={styles.container}>
      {filteredDates.map((sortKey) => {
        const leftGroup = leftByDate.get(sortKey);
        const rightGroup = rightByDate.get(sortKey);
        const leftEvents = leftGroup?.events || [];
        const rightEvents = rightGroup?.events || [];

        const travelInfo =
          compareFilter === 'travel'
            ? calculateTravelInfo(leftEvents, rightEvents, travelConfig.waitMinutes)
            : null;

        const mealInfo =
          compareFilter === 'eat'
            ? calculateMealInfo(
                leftEvents,
                rightEvents,
                mealConfig.lunchStart,
                mealConfig.lunchEnd,
                mealConfig.dinnerStart,
                mealConfig.dinnerEnd
              )
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
          <div key={sortKey} className={styles.dateRow}>
            <div
              className={`${styles.dateHeader} ${isToday(sortKey) ? styles.dateHeaderToday : ''}`}
            >
              <span>
                {displayDate}
                {isToday(sortKey) && ' (TODAY)'}
              </span>
              {travelInfo && (
                <div className={styles.travelIndicator}>
                  {travelInfo.canTravelTo && travelInfo.canTravelFrom && (
                    <span
                      className={`${styles.travelBadge} ${styles.travelBadgeBoth}`}
                      data-tooltip={`TO: ${formatTime12Hour(travelInfo.leftEarliest)} vs ${formatTime12Hour(travelInfo.rightEarliest)} (${travelInfo.toDiff} min diff) | FROM: ${formatTime12Hour(travelInfo.leftLatest)} vs ${formatTime12Hour(travelInfo.rightLatest)} (${travelInfo.fromDiff} min diff)`}
                    >
                      <ArrowLeftRight size={12} /> Both
                    </span>
                  )}
                  {travelInfo.canTravelTo && !travelInfo.canTravelFrom && (
                    <span
                      className={`${styles.travelBadge} ${styles.travelBadgeTo}`}
                      data-tooltip={`TO school: ${formatTime12Hour(travelInfo.leftEarliest)} vs ${formatTime12Hour(travelInfo.rightEarliest)} (${travelInfo.toDiff} min diff)`}
                    >
                      <ArrowRight size={12} /> To
                    </span>
                  )}
                  {!travelInfo.canTravelTo && travelInfo.canTravelFrom && (
                    <span
                      className={`${styles.travelBadge} ${styles.travelBadgeFrom}`}
                      data-tooltip={`FROM school: ${formatTime12Hour(travelInfo.leftLatest)} vs ${formatTime12Hour(travelInfo.rightLatest)} (${travelInfo.fromDiff} min diff)`}
                    >
                      <ArrowLeft size={12} /> From
                    </span>
                  )}
                </div>
              )}
              {mealInfo && (
                <div className={styles.mealIndicator}>
                  {mealInfo.canEatLunch && (
                    <span className={`${styles.mealBadge} ${styles.mealBadgeLunch}`}>
                      <Utensils size={12} /> {formatTime12Hour(mealInfo.lunchGapStart)} to{' '}
                      {formatTime12Hour(mealInfo.lunchGapEnd)}
                    </span>
                  )}
                  {mealInfo.canEatDinner && (
                    <span className={`${styles.mealBadge} ${styles.mealBadgeDinner}`}>
                      <Utensils size={12} /> {formatTime12Hour(mealInfo.dinnerGapStart)} to{' '}
                      {formatTime12Hour(mealInfo.dinnerGapEnd)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className={styles.column} data-name={leftTimetable.name}>
              {leftEvents.length > 0 ? (
                <ul>
                  {leftEvents.map((event, i) => (
                    <EventCard
                      key={`${event.course}-${event.group}-${event.startTime}-${i}`}
                      event={event}
                      showTutor={showTutor}
                      courseColor={
                        courseColorMap.get(event.course) ||
                        ('eventType' in event && event.eventType === 'upgrading'
                          ? '#16a085'
                          : '#9c27b0')
                      }
                      isHighlighted={identicalLeft.has(i)}
                    />
                  ))}
                </ul>
              ) : (
                <div className={styles.empty}>No classes</div>
              )}
            </div>

            <div className={styles.column} data-name={rightTimetable.name}>
              {rightEvents.length > 0 ? (
                <ul>
                  {rightEvents.map((event, i) => (
                    <EventCard
                      key={`${event.course}-${event.group}-${event.startTime}-${i}`}
                      event={event}
                      showTutor={showTutor}
                      courseColor={
                        courseColorMap.get(event.course) ||
                        ('eventType' in event && event.eventType === 'upgrading'
                          ? '#16a085'
                          : '#9c27b0')
                      }
                      isHighlighted={identicalRight.has(i)}
                    />
                  ))}
                </ul>
              ) : (
                <div className={styles.empty}>No classes</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
