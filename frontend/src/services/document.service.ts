import apiClient from '@/lib/axios';
import { UploadResponse } from '@/types/document.types';

export const documentService = {
  upload: async (
    file: File,
    title: string,
    category: string,
    onProgress?: (pct: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);

    const { data } = await apiClient.post<UploadResponse>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (evt.total && onProgress) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    });
    return data;
  },
};
