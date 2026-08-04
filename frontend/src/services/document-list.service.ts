import apiClient from '@/lib/axios';
import { DocumentWithCount } from '@/types/stats.types';
import { Ticket } from '@/types/customer.types';
import { TicketStatus } from '@/types/customer.types';

export const documentListService = {
  getAll: async (): Promise<DocumentWithCount[]> => {
    const { data } = await apiClient.get<DocumentWithCount[]>('/documents');
    return data;
  },
};

export const ticketService = {
  updateStatus: async (id: string, status: TicketStatus): Promise<Ticket> => {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/status`, { status });
    return data;
  },
};
