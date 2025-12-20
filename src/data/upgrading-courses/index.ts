/**
 * Content Upgrading Courses Data
 *
 * This file exports all available upgrading course presets.
 * Each course is imported from a separate JSON file.
 *
 * To add a new course:
 * 1. Create a new JSON file following the UpgradingCourse schema
 * 2. Import it below and add to the UPGRADING_COURSES array
 *
 * JSON Schema:
 * {
 *   "courseName": "ABC1234 - Full Course Name",
 *   "sessions": [
 *     {
 *       "date": "DD/MM",
 *       "startTime": "HH:MM",
 *       "endTime": "HH:MM",
 *       "venue": "Building-Floor-Room",
 *       "tutor": "Name"
 *     }
 *   ]
 * }
 */

import type { UpgradingCourse } from '../../types';

// Import course JSON files here (see COM1234.json.example for format)
// import ExampleCourse from './ExampleCourse.json';

/**
 * All available upgrading courses.
 * Add new courses here after importing their JSON files.
 */
export const UPGRADING_COURSES: UpgradingCourse[] = [];
