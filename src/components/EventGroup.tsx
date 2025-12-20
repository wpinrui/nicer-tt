import type { GroupedEvent } from '../types';
import { isToday } from '../utils/formatters';
import { EventCard } from './EventCard';
import styles from './EventGroup.module.scss';

interface EventGroupProps {
  group: GroupedEvent;
  showTutor: boolean;
  courseColorMap: Map<string, string>;
  onCourseClick?: (course: string) => void;
}

export function EventGroup({
  group,
  showTutor,
  courseColorMap,
  onCourseClick,
}: EventGroupProps) {
  return (
    <div className={styles.dateGroup}>
      <div className={`${styles.dateHeader} ${isToday(group.sortKey) ? styles.dateHeaderToday : ''}`}>
        <span>
          {group.date}
          {isToday(group.sortKey) && ' (TODAY)'}
        </span>
      </div>
      <ul className={styles.eventsList}>
        {group.events.map((event, i) => (
          <EventCard
            key={i}
            event={event}
            showTutor={showTutor}
            courseColor={courseColorMap.get(event.course) || '#666'}
            onCourseClick={onCourseClick}
          />
        ))}
      </ul>
    </div>
  );
}
