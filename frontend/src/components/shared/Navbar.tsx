import { useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/customers':  'Customers',
  '/ask':        'Ask AI',
  '/documents':  'Documents',
  '/tickets':    'Tickets',
};

export default function Navbar() {
  const location = useLocation();
  const { toggleTheme, theme } = useUIStore();
  const { user } = useAuth();

  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    return { label: BREADCRUMB_MAP[path] || seg, path };
  });

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#2a2a3a] bg-[#111118]/80 backdrop-blur-sm flex-shrink-0">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm">
          {crumbs.map((crumb, i) => (
            <li key={crumb.path} className="flex items-center gap-2">
              {i > 0 && <span className="text-[#5a5a78]">/</span>}
              <span className={cn(
                i === crumbs.length - 1
                  ? 'text-white font-medium'
                  : 'text-[#9090b0]'
              )}>
                {crumb.label}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9090b0] hover:text-white hover:bg-[#1a1a24] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-semibold">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
            <p className="text-xs text-[#9090b0]">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
