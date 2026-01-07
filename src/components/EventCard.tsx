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
  /** Disable custom/upgrading event border and background styling (for compare view) */
  disableCustomStyling?: boolean;
}

export const EventCard = memo(function EventCard({
  event,
  showTutor,
  courseColor,
  onCourseClick,
  isHighlighted = false,
  onEdit,
  onDelete,
  disableCustomStyling = false,
}: EventCardProps) {
  const isClickable = !!onCourseClick;
  const isCustom = 'isCustom' in event && event.isCustom;
  const eventType = 'eventType' in event ? event.eventType : undefined;
  const isUpgrading = isCustom && eventType === 'upgrading';
  const isCohort = isCustom && eventType === 'cohort';
  const isEdited = 'isEdited' in event && event.isEdited;
  const originalVenue = 'originalVenue' in event ? event.originalVenue : undefined;
  const originalTutor = 'originalTutor' in event ? event.originalTutor : undefined;
  const originalStartTime = 'originalStartTime' in event ? event.originalStartTime : undefined;
  const originalEndTime = 'originalEndTime' in event ? event.originalEndTime : undefined;
  const courseLabel = isCohort ? 'Cohort' : isUpgrading ? 'Upgrading' : isCustom ? 'Custom' : event.course;
  const hasTimeEdit = originalStartTime || originalEndTime;

  const classNames = [
    styles.eventItem,
    isHighlighted ? styles.eventHighlighted : '',
    !disableCustomStyling &&
      (isCohort ? styles.eventCohort : isUpgrading ? styles.eventUpgrading : isCustom ? styles.eventCustom : ''),
    isEdited ? styles.eventEdited : '',
  ]
    .filter(Boolean)
    .join(' ');

  const venueTitle = originalVenue ? `Edited (was: ${formatVenue(originalVenue)})` : undefined;
  const tutorTitle = originalTutor
    ? `Edited (was: ${formatTutor(originalTutor)})`
    : formatTutor(event.tutor);
  const timeTitle = hasTimeEdit
    ? `Edited (was: ${formatTime12Hour(originalStartTime || event.startTime)} – ${formatTime12Hour(originalEndTime || event.endTime)})`
    : undefined;

  return (
    <li className={classNames}>
      <span
        className={`${styles.eventTime} ${hasTimeEdit ? styles.timeEdited : ''}`}
        title={timeTitle}
      >
        <span className={styles.timeStart}>{formatTime12Hour(event.startTime)}</span>
        <span className={styles.timeSeparator}>–</span>
        <span className={styles.timeEnd}>{formatTime12Hour(event.endTime)}</span>
      </span>
      <span className={styles.courseTagWrapper}>
        <span
          className={`${styles.courseTag} ${isClickable ? styles.courseTagClickable : ''}`}
          style={{ backgroundColor: courseColor }}
          onClick={isClickable ? () => onCourseClick(courseLabel) : undefined}
          title={isClickable ? `Filter by ${courseLabel}` : undefined}
        >
          {courseLabel}
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
          {event.venue && (
            <span
              className={`${styles.eventVenue} ${isEdited ? styles.venueHighlight : ''}`}
              title={venueTitle}
            >
              @ {formatVenue(event.venue)}
            </span>
          )}
          {isEdited && (
            <span className={styles.editedBadge} title="This event has been modified">
              edited
            </span>
          )}
        </>
      )}
      <span className={styles.rightSection}>
        {event.tutor &&
          (showTutor ? (
            <span
              className={`${styles.eventTutor} ${originalTutor ? styles.tutorEdited : ''}`}
              title={originalTutor ? tutorTitle : undefined}
            >
              <User size={14} />
              {formatTutor(event.tutor)}
            </span>
          ) : (
            <span
              className={`${styles.eventTutorIcon} ${originalTutor ? styles.tutorEdited : ''}`}
              title={tutorTitle}
            >
              <User size={14} />
            </span>
          ))}
        {(onEdit || onDelete) && (
          <span className={styles.customActions}>
            {onEdit && (
              <button
                className={styles.customActionBtn}
                onClick={onEdit}
                title={isCustom ? 'Edit custom event' : 'Edit event'}
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button
                className={`${styles.customActionBtn} ${styles.deleteBtn}`}
                onClick={onDelete}
                title={isCustom ? 'Delete custom event' : 'Delete event'}
              >
                <Trash2 size={14} />
              </button>
            )}
          </span>
        )}
      </span>
    </li>
  );
});
