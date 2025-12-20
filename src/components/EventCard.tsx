import { Pencil, Trash2, User } from 'lucide-react';
import { memo } from 'react';

import type { DisplayEventItem, EventItem } from '../types';
import { formatTime12Hour, formatTutor, formatVenue } from '../utils/formatters';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: EventItem | DisplayEventItem;
  showTutor: boolean;
  courseColor: string;
  onCourseClick?: (course: string) => void;
  isHighlighted?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventCard = memo(function EventCard({
  event,
  showTutor,
  courseColor,
  onCourseClick,
  isHighlighted = false,
  onEdit,
  onDelete,
}: EventCardProps) {
  const isClickable = !!onCourseClick;
  const isCustom = 'isCustom' in event && event.isCustom;
  const isUpgrading = isCustom && 'eventType' in event && event.eventType === 'upgrading';

  const classNames = [
    styles.eventItem,
    isHighlighted ? styles.eventHighlighted : '',
    isUpgrading ? styles.eventUpgrading : isCustom ? styles.eventCustom : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={classNames}>
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
          {isCustom
            ? 'eventType' in event && event.eventType === 'upgrading'
              ? 'Upgrading'
              : 'Custom'
            : event.course}
        </span>
      </span>
      {isCustom && 'description' in event && event.description ? (
        <>
          <span className={styles.eventDescription}>{event.description}</span>
          {event.venue && <span className={styles.eventVenue}>@ {formatVenue(event.venue)}</span>}
        </>
      ) : (
        <>
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
        </>
      )}
      {isCustom && (onEdit || onDelete) && (
        <span className={styles.customActions}>
          {onEdit && (
            <button className={styles.customActionBtn} onClick={onEdit} title="Edit custom event">
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              className={`${styles.customActionBtn} ${styles.deleteBtn}`}
              onClick={onDelete}
              title="Delete custom event"
            >
              <Trash2 size={14} />
            </button>
          )}
        </span>
      )}
    </li>
  );
});
