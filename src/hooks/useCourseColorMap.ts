import { useMemo } from 'react';

import type { TimetableEvent } from '../types';
import { COURSE_COLORS, CUSTOM_EVENT_COLORS } from '../utils/constants';

interface UseCourseColorMapResult {
  courseColorMap: Map<string, string>;
  uniqueCourses: string[];
}

/**
 * Manages color assignment for courses.
 * Assigns consistent colors to each unique course from the COURSE_COLORS palette.
 * Colors are assigned in sorted order to ensure stability across renders.
 *
 * @param events - Array of timetable events (or null if no data loaded)
 * @returns courseColorMap - Map from course name to color hex value
 * @returns uniqueCourses - Sorted array of unique course names
 */
export function useCourseColorMap(events: TimetableEvent[] | null): UseCourseColorMapResult {
  return useMemo(() => {
    if (!events) {
      return {
        courseColorMap: new Map<string, string>(),
        uniqueCourses: [],
      };
    }

    const colorMap = new Map<string, string>();
    const coursesSet = new Set<string>();

    for (const event of events) {
      // Check for custom/upgrading events first (they use special filter names)
      if ('eventType' in event && event.eventType) {
        const courseName = event.eventType === 'upgrading' ? 'Upgrading' : 'Custom';
        coursesSet.add(courseName);
      } else if (event.course) {
        coursesSet.add(event.course);
      }
    }

    // Sort regular courses alphabetically, then append custom event types at the end
    const regularCourses = Array.from(coursesSet)
      .filter((c) => !CUSTOM_EVENT_COLORS[c])
      .sort();
    const customCourses = Array.from(coursesSet)
      .filter((c) => CUSTOM_EVENT_COLORS[c])
      .sort();
    const coursesArray = [...regularCourses, ...customCourses];

    let paletteIndex = 0;
    coursesArray.forEach((course) => {
      if (CUSTOM_EVENT_COLORS[course]) {
        colorMap.set(course, CUSTOM_EVENT_COLORS[course]);
      } else {
        colorMap.set(course, COURSE_COLORS[paletteIndex % COURSE_COLORS.length]);
        paletteIndex++;
      }
    });

    return {
      courseColorMap: colorMap,
      uniqueCourses: coursesArray,
    };
  }, [events]);
}
