// ── Document & Chunk types ───────────────────────────
export type DocumentCategory = 'technical' | 'hr' | 'finance' | 'general';

export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  createdAt: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  page: number | null;
  documentId: string;
}

export interface UploadResponse {
  document: Document;
  totalCharacters: number;
  pagesDetected: number;
  chunksCreated: number;
}
