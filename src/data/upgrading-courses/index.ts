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

// QUB - Biology
import QUB511 from './QUB511.json';
import QUB513 from './QUB513.json';

// QUC - Chinese Language
import QUC501 from './QUC501.json';
import QUC509 from './QUC509.json';

// QUE - English Language
import QUE502_G1 from './QUE502-G1.json';
import QUE502_G2 from './QUE502-G2.json';
import QUE502_G3 from './QUE502-G3.json';
import QUE502_G4 from './QUE502-G4.json';
import QUE502_G5 from './QUE502-G5.json';
import QUE502_G6 from './QUE502-G6.json';
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

// QUG - Geography
import QUG511 from './QUG511.json';
import QUG512 from './QUG512.json';

// QUH - History
import QUH512 from './QUH512.json';
import QUH513 from './QUH513.json';

// QUP - Physics
import QUP511 from './QUP511.json';
import QUP512 from './QUP512.json';

// QUR - English Literature
import QUR511 from './QUR511.json';

// QUS - Science
import QUS511_G1 from './QUS511-G1.json';
import QUS511_G2 from './QUS511-G2.json';
import QUS511_G3 from './QUS511-G3.json';
import QUS511_G4 from './QUS511-G4.json';

// QUT - Tamil Language
import QUT501 from './QUT501.json';
import QUT502 from './QUT502.json';
import QUT503 from './QUT503.json';

// QUY - Chemistry
import QUY511 from './QUY511.json';
import QUY512 from './QUY512.json';

/**
 * All available upgrading courses.
 * Add new courses here after importing their JSON files.
 */
export const UPGRADING_COURSES: UpgradingCourse[] = [
  // QUB - Biology
  QUB511,
  QUB513,
  // QUC - Chinese Language
  QUC501,
  QUC509,
  // QUE - English Language
  QUE502_G1,
  QUE502_G2,
  QUE502_G3,
  QUE502_G4,
  QUE502_G5,
  QUE502_G6,
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
  // QUG - Geography
  QUG511,
  QUG512,
  // QUH - History
  QUH512,
  QUH513,
  // QUP - Physics
  QUP511,
  QUP512,
  // QUR - English Literature
  QUR511,
  // QUS - Science
  QUS511_G1,
  QUS511_G2,
  QUS511_G3,
  QUS511_G4,
  // QUT - Tamil Language
  QUT501,
  QUT502,
  QUT503,
  // QUY - Chemistry
  QUY511,
  QUY512,
];
