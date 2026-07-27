// ── Q&A / RAG types ──────────────────────────────────
export interface Source {
  title: string;
  page: number | null;
  category: string;
  similarity: number;
}

export interface AskRequest {
  question: string;
}

export interface AskResponse {
  question: string;
  role: string;
  answer: string;
  sources: Source[];
  topScore: number;
}

export interface QueryResult {
  id: string;
  content: string;
  page: number | null;
  title: string;
  category: string;
  similarity: number;
}

export interface QueryResponse {
  question: string;
  results: QueryResult[];
}

export interface EmailDraftSource {
  title: string;
  page: number | null;
  similarity: number;
}

export interface EmailDraftResponse {
  ticket: { id: string; subject: string; status: string };
  customer: { name: string; email: string };
  draft: string;
  usedPolicyContext: boolean;
  sources: EmailDraftSource[];
}

// ── API Error ────────────────────────────────────────
export interface ApiError {
  error: string;
  statusCode?: number;
}
