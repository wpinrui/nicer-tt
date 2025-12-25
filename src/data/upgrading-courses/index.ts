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

// Biology
import QUB511 from './QUB511.json';
import QUB513 from './QUB513.json';

// Chemistry
import QUY511 from './QUY511.json';
import QUY512 from './QUY512.json';

// Chinese Language
import QUC501 from './QUC501.json';
import QUC509 from './QUC509.json';

// English Language
import QUE512_G1 from './QUE512-G1.json';
import QUE512_G2 from './QUE512-G2.json';
import QUE512_G3 from './QUE512-G3.json';
import QUE512_G4 from './QUE512-G4.json';
import QUE512_G5 from './QUE512-G5.json';
import QUE513_G1 from './QUE513-G1.json';
import QUE513_G2 from './QUE513-G2.json';
import QUE513_G3 from './QUE513-G3.json';
import QUE513_G4 from './QUE513-G4.json';
import QUE513_G5 from './QUE513-G5.json';

// English Literature
import QUR511 from './QUR511.json';

// Geography
import QUG511 from './QUG511.json';
import QUG512 from './QUG512.json';

// History
import QUH512 from './QUH512.json';
import QUH513 from './QUH513.json';

// Physics
import QUP511 from './QUP511.json';
import QUP512 from './QUP512.json';

// Science
import QUS511_G1 from './QUS511-G1.json';
import QUS511_G2 from './QUS511-G2.json';
import QUS511_G3 from './QUS511-G3.json';
import QUS511_G4 from './QUS511-G4.json';

// Tamil Language
import QUT501 from './QUT501.json';
import QUT502 from './QUT502.json';
import QUT503 from './QUT503.json';

/**
 * All available upgrading courses.
 * Add new courses here after importing their JSON files.
 */
export const UPGRADING_COURSES: UpgradingCourse[] = [
  // Biology
  QUB511,
  QUB513,
  // Chemistry
  QUY511,
  QUY512,
  // Chinese Language
  QUC501,
  QUC509,
  // English Language
  QUE512_G1,
  QUE512_G2,
  QUE512_G3,
  QUE512_G4,
  QUE512_G5,
  QUE513_G1,
  QUE513_G2,
  QUE513_G3,
  QUE513_G4,
  QUE513_G5,
  // English Literature
  QUR511,
  // Geography
  QUG511,
  QUG512,
  // History
  QUH512,
  QUH513,
  // Physics
  QUP511,
  QUP512,
  // Science
  QUS511_G1,
  QUS511_G2,
  QUS511_G3,
  QUS511_G4,
  // Tamil Language
  QUT501,
  QUT502,
  QUT503,
];
