import { ExternalLink } from 'lucide-react';

import { UPGRADING_COURSES } from '../../data/upgrading-courses';
import type { UpgradingCourse } from '../../types';
import { CONTRIBUTION_PAGE_URL } from '../../utils/constants';
import styles from './AddEventModal.module.scss';
import { ModalHeader } from './ModalHeader';

interface UpgradingSelectStepProps {
  onClose: () => void;
  onBack: () => void;
  onCourseSelect: (course: UpgradingCourse) => void;
}

export function UpgradingSelectStep({ onClose, onBack, onCourseSelect }: UpgradingSelectStepProps) {
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
          <div className={styles.courseList}>
            {UPGRADING_COURSES.map((course) => (
              <button
                key={course.courseName}
                className={styles.courseListItem}
                onClick={() => onCourseSelect(course)}
              >
                <span className={styles.courseName}>{course.courseName}</span>
                <span className={styles.sessionCount}>{course.sessions.length} sessions</span>
              </button>
            ))}
          </div>
        )}

        <a
          href={CONTRIBUTION_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.notListedLink}
        >
          <span>My course is not listed</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </>
  );
}
