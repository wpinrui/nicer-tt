import { memo, useCallback } from 'react';

import type { DisplayGroupedEvent } from '../types';
import { isToday } from '../utils/formatters';
import { EventCard } from './EventCard';
import styles from './EventGroup.module.scss';

interface EventGroupProps {
  group: DisplayGroupedEvent;
  showTutor: boolean;
  courseColorMap: Map<string, string>;
  onCourseClick?: (course: string) => void;
  onEditCustomEvent?: (eventId: string) => void;
  onDeleteCustomEvent?: (eventId: string, date: string) => void;
}

export const EventGroup = memo(function EventGroup({
  group,
  showTutor,
  courseColorMap,
  onCourseClick,
  onEditCustomEvent,
  onDeleteCustomEvent,
}: EventGroupProps) {
  const createEditHandler = useCallback(
    (eventId: string | undefined) => {
      if (!eventId || !onEditCustomEvent) return undefined;
      return () => onEditCustomEvent(eventId);
    },
    [onEditCustomEvent]
  );

  const createDeleteHandler = useCallback(
    (eventId: string | undefined, date: string) => {
      if (!eventId || !onDeleteCustomEvent) return undefined;
      return () => onDeleteCustomEvent(eventId, date);
    },
    [onDeleteCustomEvent]
  );

  return (
    <div className={styles.dateGroup}>
      <div
        className={`${styles.dateHeader} ${isToday(group.sortKey) ? styles.dateHeaderToday : ''}`}
      >
        <span>
          {group.date}
          {isToday(group.sortKey) && ' (TODAY)'}
        </span>
      </div>
      <ul className={styles.eventsList}>
        {group.events.map((event, i) => {
          const isUpgrading = event.eventType === 'upgrading';
          return (
            <EventCard
              key={event.customEventId || i}
              event={event}
              showTutor={showTutor}
              courseColor={
                courseColorMap.get(event.course) || (isUpgrading ? '#16a085' : '#9c27b0')
              }
              onCourseClick={onCourseClick}
              onEdit={isUpgrading ? undefined : createEditHandler(event.customEventId)}
              onDelete={createDeleteHandler(event.customEventId, group.sortKey)}
            />
          );
        })}
      </ul>
    </div>
  );
});
