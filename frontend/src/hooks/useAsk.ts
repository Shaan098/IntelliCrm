import { useMutation } from '@tanstack/react-query';
import { qaService } from '@/services/qa.service';
import { AskRequest } from '@/types/qa.types';

export function useAsk() {
  return useMutation({
    mutationFn: (payload: AskRequest) => qaService.ask(payload),
  });
}
