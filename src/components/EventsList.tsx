import type { GroupedEvent } from '../types';
import { EventGroup } from './EventGroup';
import styles from './EventsList.module.scss';

interface EventsListProps {
  groupedByDate: GroupedEvent[];
  courseColorMap: Map<string, string>;
  showTutor: boolean;
  onCourseClick: (course: string) => void;
}

export function EventsList({
  groupedByDate,
  courseColorMap,
  showTutor,
  onCourseClick,
}: EventsListProps) {
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
        />
      ))}
    </>
  );
}
