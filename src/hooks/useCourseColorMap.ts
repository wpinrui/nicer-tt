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

    // Distribute colors evenly across the palette so users always see
    // the full spectrum (first and last colors) regardless of course count
    const paletteLength = COURSE_COLORS.length;
    const regularCount = regularCourses.length;

    regularCourses.forEach((course, i) => {
      let colorIndex: number;
      if (regularCount === 1) {
        colorIndex = 0;
      } else {
        // Spread evenly: first course gets index 0, last gets index (paletteLength - 1)
        colorIndex = Math.round((i * (paletteLength - 1)) / (regularCount - 1));
      }
      colorMap.set(course, COURSE_COLORS[colorIndex]);
    });

    // Custom event types use their fixed colors
    customCourses.forEach((course) => {
      colorMap.set(course, CUSTOM_EVENT_COLORS[course]);
    });

    return {
      courseColorMap: colorMap,
      uniqueCourses: coursesArray,
    };
  }, [events]);
}
