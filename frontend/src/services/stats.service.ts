import apiClient from '@/lib/axios';
import { Stats } from '@/types/stats.types';

export const statsService = {
  get: async (): Promise<Stats> => {
    const { data } = await apiClient.get<Stats>('/stats');
    return data;
  },
};
