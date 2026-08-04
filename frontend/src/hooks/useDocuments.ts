import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentListService, ticketService } from '@/services/document-list.service';
import { TicketStatus } from '@/types/customer.types';

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn:  documentListService.getAll,
  });
}

export function useUpdateTicketStatus(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: TicketStatus) => ticketService.updateStatus(ticketId, status),
    onSuccess: () => {
      // Invalidate customers query so ticket status refreshes everywhere
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
