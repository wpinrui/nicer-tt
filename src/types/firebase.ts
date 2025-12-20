import type { Timestamp } from 'firebase/firestore';

export interface ScheduleSubmission {
  id: string;
  telegram?: string;
  courseName: string;
  fileUrls: string[];
  fileNames: string[];
  submittedAt: Timestamp;
  notes?: string;
}

export interface NewSubmissionInput {
  telegram?: string;
  courseName: string;
  files: File[];
  notes?: string;
}
