import type { NewSubmissionInput } from '../types/firebase';
import { uploadFiles } from './storage';

interface SubmitResponse {
  success: boolean;
  issueNumber: number;
  issueUrl: string;
}

export async function submitSchedule(input: NewSubmissionInput): Promise<string> {
  // Generate a temporary ID for the upload folder
  const tempId = `submission-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Upload files to Firebase Storage first
  const uploadResults = await uploadFiles(tempId, input.files);

  // Call the API to create a GitHub issue
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      courseName: input.courseName,
      telegram: input.telegram,
      notes: input.notes,
      fileUrls: uploadResults.map((r) => r.url),
      fileNames: uploadResults.map((r) => r.fileName),
    }),
  });

  if (!response.ok) {
    // Handle non-JSON error responses (e.g., 404 from dev server)
    const text = await response.text();
    let message = 'Failed to submit';
    try {
      const error = JSON.parse(text);
      message = error.error || message;
    } catch {
      if (response.status === 404) {
        message = 'API not available. Run "vercel dev" for local testing.';
      }
    }
    throw new Error(message);
  }

  const result: SubmitResponse = await response.json();

  // Return issue number as the reference ID
  return `#${result.issueNumber}`;
}
