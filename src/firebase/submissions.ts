import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import type { NewSubmissionInput } from '../types/firebase';
import { db } from './config';
import { uploadFiles } from './storage';

export async function submitSchedule(input: NewSubmissionInput): Promise<string> {
  // Generate a temporary ID for the upload folder
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Upload files first
  const uploadResults = await uploadFiles(tempId, input.files);

  // Create submission document
  const submissionData = {
    telegram: input.telegram || null,
    courseName: input.courseName,
    fileUrls: uploadResults.map((r) => r.url),
    fileNames: uploadResults.map((r) => r.fileName),
    submittedAt: serverTimestamp(),
    notes: input.notes || null,
  };

  const docRef = await addDoc(collection(db, 'submissions'), submissionData);

  return docRef.id;
}
