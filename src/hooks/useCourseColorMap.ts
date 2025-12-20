import { useMemo } from 'react';

import type { TimetableEvent } from '../types';
import { COURSE_COLORS } from '../utils/constants';

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
      coursesSet.add(event.course);
    }

    const coursesArray = Array.from(coursesSet).sort();

    coursesArray.forEach((course, index) => {
      colorMap.set(course, COURSE_COLORS[index % COURSE_COLORS.length]);
    });

    return {
      courseColorMap: colorMap,
      uniqueCourses: coursesArray,
    };
  }, [events]);
}
