import { useMutation } from '@tanstack/react-query';
import { qaService } from '@/services/qa.service';

export function useDraftEmail(ticketId: string) {
  return useMutation({
    mutationFn: () => qaService.draftEmail(ticketId),
  });
}
