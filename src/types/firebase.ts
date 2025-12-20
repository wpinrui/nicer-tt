import type { Timestamp } from 'firebase/firestore';

export interface ScheduleSubmission {
  id: string;
  email: string;
  courseName: string;
  courseCode?: string;
  fileUrls: string[];
  fileNames: string[];
  submittedAt: Timestamp;
  notes?: string;
}

export interface NewSubmissionInput {
  email: string;
  courseName: string;
  courseCode?: string;
  files: File[];
  notes?: string;
}
