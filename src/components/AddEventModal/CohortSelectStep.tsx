import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { COHORT_EVENTS, type CohortEvent } from '../../data/cohort-events';
import styles from './AddEventModal.module.scss';
import { ModalHeader } from './ModalHeader';

interface CohortSelectStepProps {
  onClose: () => void;
  onBack: () => void;
  onEventSelect: (event: CohortEvent) => void;
  addedEventNames?: Set<string>;
}

export function CohortSelectStep({
  onClose,
  onBack,
  onEventSelect,
  addedEventNames,
}: CohortSelectStepProps) {
  const [search, setSearch] = useState('');

  const filteredEvents = useMemo(() => {
    let events = COHORT_EVENTS;

    // Filter out already-added events
    if (addedEventNames?.size) {
      events = events.filter((event) => !addedEventNames.has(event.courseName));
    }

    // Filter by search query
    if (search.trim()) {
      const query = search.toLowerCase();
      events = events.filter((event) => event.courseName.toLowerCase().includes(query));
    }

    return events;
  }, [search, addedEventNames]);

  return (
    <>
      <ModalHeader title="Select Cohort Event" onClose={onClose} onBack={onBack} />

      <div className={styles.content}>
        {COHORT_EVENTS.length === 0 ? (
          <div className={styles.noCoursesMessage}>
            <p>No cohort events available yet.</p>
            <p className={styles.noCoursesHint}>
              Cohort events will be added as they become available.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.courseList}>
              {filteredEvents.length === 0 ? (
                <div className={styles.noResults}>
                  {search.trim() ? `No events match "${search}"` : 'All events have been added'}
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <button
                    key={event.courseName}
                    className={styles.courseListItem}
                    onClick={() => onEventSelect(event)}
                  >
                    <span className={styles.courseName}>{event.courseName}</span>
                    <span className={styles.sessionCount}>{event.sessions.length} sessions</span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
