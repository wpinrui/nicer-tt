/**
 * Cohort Events Data
 *
 * This file exports all available cohort event presets.
 * Cohort events are shared events that apply to everyone in the cohort.
 *
 * To add a new cohort event:
 * 1. Create a new JSON file following the CohortEvent schema (same as UpgradingCourse)
 * 2. Import it below and add to the COHORT_EVENTS array
 *
 * JSON Schema:
 * {
 *   "courseName": "Event Name",
 *   "sessions": [
 *     {
 *       "date": "DD/MM",
 *       "startTime": "HH:MM",
 *       "endTime": "HH:MM",
 *       "venue": "Location",
 *       "tutor": "Optional notes"
 *     }
 *   ]
 * }
 */

import type { UpgradingCourse } from '../../types';

import NIEWelcomeCeremony from './nie-welcome-ceremony.json';

// Cohort event type alias (same structure as UpgradingCourse)
export type CohortEvent = UpgradingCourse;

/**
 * All available cohort events.
 * Add new events here after importing their JSON files.
 */
export const COHORT_EVENTS: CohortEvent[] = [
  NIEWelcomeCeremony,
];
