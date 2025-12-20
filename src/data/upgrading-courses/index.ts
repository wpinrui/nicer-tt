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

// Science
import QUS511_G1 from './QUS511-G1.json';
import QUS511_G2 from './QUS511-G2.json';
import QUS511_G3 from './QUS511-G3.json';
import QUS511_G4 from './QUS511-G4.json';

// Physics
import QUP511 from './QUP511.json';
import QUP512 from './QUP512.json';

// Chemistry
import QUY511 from './QUY511.json';
import QUY512 from './QUY512.json';

// Biology
import QUB511 from './QUB511.json';
import QUB513 from './QUB513.json';

// History
import QUH512 from './QUH512.json';
import QUH513 from './QUH513.json';

// Geography
import QUG511 from './QUG511.json';
import QUG512 from './QUG512.json';

// English Literature
import QUR511 from './QUR511.json';

// Tamil Language
import QUT501 from './QUT501.json';
import QUT502 from './QUT502.json';
import QUT503 from './QUT503.json';

// Chinese Language
import QUC501 from './QUC501.json';
import QUC509 from './QUC509.json';

/**
 * All available upgrading courses.
 * Add new courses here after importing their JSON files.
 */
export const UPGRADING_COURSES: UpgradingCourse[] = [
  // Science
  QUS511_G1,
  QUS511_G2,
  QUS511_G3,
  QUS511_G4,
  // Physics
  QUP511,
  QUP512,
  // Chemistry
  QUY511,
  QUY512,
  // Biology
  QUB511,
  QUB513,
  // History
  QUH512,
  QUH513,
  // Geography
  QUG511,
  QUG512,
  // English Literature
  QUR511,
  // Tamil Language
  QUT501,
  QUT502,
  QUT503,
  // Chinese Language
  QUC501,
  QUC509,
];
