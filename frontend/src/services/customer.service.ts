import apiClient from '@/lib/axios';
import { Customer } from '@/types/customer.types';

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await apiClient.get<Customer[]>('/customers');
    return data;
  },
};
