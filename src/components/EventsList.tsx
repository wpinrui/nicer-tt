import { User } from 'lucide-react';
import { formatTime12Hour, formatVenue, formatTutor, isToday } from '../utils/formatters';

interface EventItem {
  course: string;
  group: string;
  startTime: string;
  endTime: string;
  venue: string;
  tutor: string;
}

interface GroupedEvent {
  date: string;
  sortKey: string;
  events: EventItem[];
}

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
    return <div className="no-results">No events match your filters</div>;
  }

  return (
    <>
      {groupedByDate.map((group) => (
        <div key={group.sortKey} className="date-group">
          <div className={`date-header ${isToday(group.sortKey) ? 'date-header-today' : ''}`}>
            <span>
              {group.date}
              {isToday(group.sortKey) && ' (TODAY)'}
            </span>
          </div>
          <ul>
            {group.events.map((event, i) => (
              <li key={i}>
                <span className="event-time">
                  <span className="time-start">{formatTime12Hour(event.startTime)}</span>
                  <span className="time-separator">–</span>
                  <span className="time-end">{formatTime12Hour(event.endTime)}</span>
                </span>
                <span className="course-tag-wrapper">
                  <span
                    className="course-tag clickable"
                    style={{ backgroundColor: courseColorMap.get(event.course) }}
                    onClick={() => onCourseClick(event.course)}
                    title={`Filter by ${event.course}`}
                  >
                    {event.course}
                  </span>
                </span>
                <span className="event-group">{event.group}</span>
                {event.venue && (
                  <span className="event-venue">@ {formatVenue(event.venue)}</span>
                )}
                {event.tutor && (
                  showTutor ? (
                    <span className="event-tutor">
                      <User size={14} />
                      {formatTutor(event.tutor)}
                    </span>
                  ) : (
                    <span className="event-tutor-icon" title={formatTutor(event.tutor)}>
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

export type { GroupedEvent, EventItem };
