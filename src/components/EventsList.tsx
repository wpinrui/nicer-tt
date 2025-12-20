import type { DisplayGroupedEvent } from '../types';
import { useRenderTimer } from '../utils/perf';
import { EventGroup } from './EventGroup';
import styles from './EventsList.module.scss';

interface EventsListProps {
  groupedByDate: DisplayGroupedEvent[];
  courseColorMap: Map<string, string>;
  showTutor: boolean;
  onCourseClick: (course: string) => void;
  onEditCustomEvent?: (eventId: string) => void;
  onDeleteCustomEvent?: (eventId: string, date: string) => void;
}

export function EventsList({
  groupedByDate,
  courseColorMap,
  showTutor,
  onCourseClick,
  onEditCustomEvent,
  onDeleteCustomEvent,
}: EventsListProps) {
  useRenderTimer('EventsList');

  if (groupedByDate.length === 0) {
    return <div className={styles.noResults}>No events match your filters</div>;
  }

  return (
    <>
      {groupedByDate.map((group) => (
        <EventGroup
          key={group.sortKey}
          group={group}
          showTutor={showTutor}
          courseColorMap={courseColorMap}
          onCourseClick={onCourseClick}
          onEditCustomEvent={onEditCustomEvent}
          onDeleteCustomEvent={onDeleteCustomEvent}
        />
      ))}
    </>
  );
}
