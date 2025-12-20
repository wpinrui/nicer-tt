import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { storage } from './config';

export interface UploadResult {
  url: string;
  fileName: string;
}

export async function uploadFile(
  submissionId: string,
  file: File
): Promise<UploadResult> {
  const storageRef = ref(storage, `uploads/${submissionId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    url,
    fileName: file.name,
  };
}

export async function uploadFiles(
  submissionId: string,
  files: File[]
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadFile(submissionId, file));
  return Promise.all(uploadPromises);
}
