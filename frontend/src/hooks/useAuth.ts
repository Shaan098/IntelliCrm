import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();

  const isAdmin   = user?.role === 'admin';
  const isSupport = user?.role === 'support';
  const isHR      = user?.role === 'hr';

  return { user, token, isAuthenticated, isAdmin, isSupport, isHR, login, logout };
}
