import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/stats.service';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn:  statsService.get,
    refetchInterval: 30_000, // auto-refresh every 30s
  });
}
