import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { UPGRADING_COURSES } from '../../data/upgrading-courses';
import type { UpgradingCourse } from '../../types';
import styles from './AddEventModal.module.scss';
import { ModalHeader } from './ModalHeader';

interface UpgradingSelectStepProps {
  onClose: () => void;
  onBack: () => void;
  onCourseSelect: (course: UpgradingCourse) => void;
  addedCourseNames?: Set<string>;
}

export function UpgradingSelectStep({
  onClose,
  onBack,
  onCourseSelect,
  addedCourseNames,
}: UpgradingSelectStepProps) {
  const [search, setSearch] = useState('');

  const filteredCourses = useMemo(() => {
    let courses = UPGRADING_COURSES;

    // Filter out already-added courses
    if (addedCourseNames?.size) {
      courses = courses.filter((course) => !addedCourseNames.has(course.courseName));
    }

    // Filter by search query
    if (search.trim()) {
      const query = search.toLowerCase();
      courses = courses.filter((course) => course.courseName.toLowerCase().includes(query));
    }

    return courses;
  }, [search, addedCourseNames]);

  return (
    <>
      <ModalHeader title="Select Upgrading Course" onClose={onClose} onBack={onBack} />

      <div className={styles.content}>
        {UPGRADING_COURSES.length === 0 ? (
          <div className={styles.noCoursesMessage}>
            <p>No upgrading courses available yet.</p>
            <p className={styles.noCoursesHint}>
              Courses will be added as they become available. You can help by contributing your
              schedule!
            </p>
          </div>
        ) : (
          <>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.courseList}>
              {filteredCourses.length === 0 ? (
                <div className={styles.noResults}>
                  {search.trim() ? `No courses match "${search}"` : 'All courses have been added'}
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <button
                    key={course.courseName}
                    className={styles.courseListItem}
                    onClick={() => onCourseSelect(course)}
                  >
                    <span className={styles.courseName}>{course.courseName}</span>
                    <span className={styles.sessionCount}>{course.sessions.length} sessions</span>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        <Link to="/contribute" className={styles.notListedLink}>
          <span>My course is not listed</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </>
  );
}
