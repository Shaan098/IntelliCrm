import apiClient from '@/lib/axios';
import { AskRequest, AskResponse, EmailDraftResponse, QueryResponse } from '@/types/qa.types';

export const qaService = {
  ask: async (payload: AskRequest): Promise<AskResponse> => {
    const { data } = await apiClient.post<AskResponse>('/ask', payload);
    return data;
  },

  query: async (question: string): Promise<QueryResponse> => {
    const { data } = await apiClient.post<QueryResponse>('/query', { question });
    return data;
  },

  draftEmail: async (ticketId: string): Promise<EmailDraftResponse> => {
    const { data } = await apiClient.post<EmailDraftResponse>(
      `/tickets/${ticketId}/draft-email`
    );
    return data;
  },
};
