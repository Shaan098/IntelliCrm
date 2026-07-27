import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';

// Base URL routed through Vite proxy → localhost:3000
export const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 120_000, // 2 minutes — LLM calls can be very slow
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT token ────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: normalize errors ───────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: string }>) => {
    const status = error.response?.status;

    // Token expired or invalid — force logout
    if (status === 401 || status === 403) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    // Normalize error message — human-readable for common cases
    let message: string;

    if (!error.response) {
      // No response at all — network error or server is offline
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        message = 'Request timed out. The AI model may be busy — please try again.';
      } else {
        message = 'Cannot connect to the server. Make sure the backend is running on port 3000.';
      }
    } else {
      switch (status) {
        case 400: message = error.response.data?.error || 'Invalid request. Please check your input.'; break;
        case 401: message = error.response.data?.error || 'Authentication required. Please log in.'; break;
        case 403: message = error.response.data?.error || 'You don\'t have permission to perform this action.'; break;
        case 404: message = error.response.data?.error || 'The requested resource was not found.'; break;
        case 429: message = 'Too many requests. Please wait a moment and try again.'; break;
        case 500: message = error.response.data?.error || 'Server error. Check the backend logs.'; break;
        case 502: message = 'Backend is unreachable. Make sure the Express server is running on port 3000.'; break;
        case 503: message = 'Service unavailable. The server may be overloaded.'; break;
        default:  message = error.response.data?.error || error.message || 'An unexpected error occurred.';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
