import { User } from 'lucide-react';
import { formatTime12Hour, formatVenue, formatTutor, isToday } from '../utils/formatters';
import type { GroupedEvent } from '../types';
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
        <div key={group.sortKey} className={styles.dateGroup}>
          <div className={`${styles.dateHeader} ${isToday(group.sortKey) ? styles.dateHeaderToday : ''}`}>
            <span>
              {group.date}
              {isToday(group.sortKey) && ' (TODAY)'}
            </span>
          </div>
          <ul className={styles.eventsList}>
            {group.events.map((event, i) => (
              <li key={i} className={styles.eventItem}>
                <span className={styles.eventTime}>
                  <span className={styles.timeStart}>{formatTime12Hour(event.startTime)}</span>
                  <span className={styles.timeSeparator}>–</span>
                  <span className={styles.timeEnd}>{formatTime12Hour(event.endTime)}</span>
                </span>
                <span className={styles.courseTagWrapper}>
                  <span
                    className={`${styles.courseTag} ${styles.courseTagClickable}`}
                    style={{ backgroundColor: courseColorMap.get(event.course) || '#666' }}
                    onClick={() => onCourseClick(event.course)}
                    title={`Filter by ${event.course}`}
                  >
                    {event.course}
                  </span>
                </span>
                <span className={styles.eventGroup}>{event.group}</span>
                {event.venue && (
                  <span className={styles.eventVenue}>@ {formatVenue(event.venue)}</span>
                )}
                {event.tutor && (
                  showTutor ? (
                    <span className={styles.eventTutor}>
                      <User size={14} />
                      {formatTutor(event.tutor)}
                    </span>
                  ) : (
                    <span className={styles.eventTutorIcon} title={formatTutor(event.tutor)}>
                      <User size={14} />
                    </span>
                  )
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
