export interface NewSubmissionInput {
  telegram?: string;
  courseName: string;
  files: File[];
  notes?: string;
}
