import apiClient from '@/lib/axios';
import { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from '@/types/auth.types';

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', payload);
    return data;
  },
};
