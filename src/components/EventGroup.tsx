import { memo, useCallback } from 'react';

import type { DisplayGroupedEvent, EventInstanceKey } from '../types';
import { CUSTOM_EVENT_COLORS } from '../utils/constants';
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
  onEditImportedEvent?: (
    eventKey: EventInstanceKey,
    currentVenue: string,
    currentTutor: string,
    currentStartTime: string,
    currentEndTime: string
  ) => void;
  onDeleteImportedEvent?: (eventKey: EventInstanceKey) => void;
}

export const EventGroup = memo(function EventGroup({
  group,
  showTutor,
  courseColorMap,
  onCourseClick,
  onEditCustomEvent,
  onDeleteCustomEvent,
  onEditImportedEvent,
  onDeleteImportedEvent,
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

  const createImportedEditHandler = useCallback(
    (
      eventKey: EventInstanceKey | undefined,
      currentVenue: string,
      currentTutor: string,
      currentStartTime: string,
      currentEndTime: string
    ) => {
      if (!eventKey || !onEditImportedEvent) return undefined;
      return () =>
        onEditImportedEvent(eventKey, currentVenue, currentTutor, currentStartTime, currentEndTime);
    },
    [onEditImportedEvent]
  );

  const createImportedDeleteHandler = useCallback(
    (eventKey: EventInstanceKey | undefined) => {
      if (!eventKey || !onDeleteImportedEvent) return undefined;
      return () => onDeleteImportedEvent(eventKey);
    },
    [onDeleteImportedEvent]
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
          const isCustom = event.isCustom;

          // For custom events, use custom event handlers
          // For imported events, use imported event handlers
          let onEdit: (() => void) | undefined;
          let onDelete: (() => void) | undefined;

          if (isCustom) {
            onEdit = isUpgrading ? undefined : createEditHandler(event.customEventId);
            onDelete = createDeleteHandler(event.customEventId, group.sortKey);
          } else {
            // Imported events - use eventInstanceKey for edit/delete
            onEdit = createImportedEditHandler(
              event.eventInstanceKey,
              event.venue,
              event.tutor,
              event.startTime,
              event.endTime
            );
            onDelete = createImportedDeleteHandler(event.eventInstanceKey);
          }

          return (
            <EventCard
              key={event.customEventId || event.eventInstanceKey || i}
              event={event}
              showTutor={showTutor}
              courseColor={
                courseColorMap.get(event.course) ||
                (isUpgrading ? CUSTOM_EVENT_COLORS.Upgrading : CUSTOM_EVENT_COLORS.Custom)
              }
              onCourseClick={onCourseClick}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </ul>
    </div>
  );
});
