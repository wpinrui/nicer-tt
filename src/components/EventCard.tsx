import { User } from 'lucide-react';

import type { EventItem } from '../types';
import { formatTime12Hour, formatTutor, formatVenue } from '../utils/formatters';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: EventItem;
  showTutor: boolean;
  courseColor: string;
  onCourseClick?: (course: string) => void;
  isHighlighted?: boolean;
}

export function EventCard({
  event,
  showTutor,
  courseColor,
  onCourseClick,
  isHighlighted = false,
}: EventCardProps) {
  const isClickable = !!onCourseClick;

  return (
    <li className={`${styles.eventItem} ${isHighlighted ? styles.eventHighlighted : ''}`}>
      <span className={styles.eventTime}>
        <span className={styles.timeStart}>{formatTime12Hour(event.startTime)}</span>
        <span className={styles.timeSeparator}>–</span>
        <span className={styles.timeEnd}>{formatTime12Hour(event.endTime)}</span>
      </span>
      <span className={styles.courseTagWrapper}>
        <span
          className={`${styles.courseTag} ${isClickable ? styles.courseTagClickable : ''}`}
          style={{ backgroundColor: courseColor }}
          onClick={isClickable ? () => onCourseClick(event.course) : undefined}
          title={isClickable ? `Filter by ${event.course}` : undefined}
        >
          {event.course}
        </span>
      </span>
      <span className={styles.eventGroup}>{event.group}</span>
      {event.venue && <span className={styles.eventVenue}>@ {formatVenue(event.venue)}</span>}
      {event.tutor &&
        (showTutor ? (
          <span className={styles.eventTutor}>
            <User size={14} />
            {formatTutor(event.tutor)}
          </span>
        ) : (
          <span className={styles.eventTutorIcon} title={formatTutor(event.tutor)}>
            <User size={14} />
          </span>
        ))}
    </li>
  );
}
