import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, MessageSquare,
  LogOut, ChevronLeft, ChevronRight, Brain, Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui.store';
import { cn, getInitials, getRoleColor } from '@/lib/utils';
import { sidebarVariants } from '@/animations/variants';
import { springSmooth } from '@/animations/transitions';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers',  icon: Users,           label: 'Customers'  },
  { to: '/ask',        icon: Brain,           label: 'Ask AI'     },
];

const adminItems = [
  { to: '/documents', icon: FileText, label: 'Documents' },
];

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
}

function SidebarNavItem({ to, icon: Icon, label, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
          'text-[#9090b0] hover:text-[#f0f0ff] hover:bg-[#1a1a24]',
          isActive && 'text-white bg-[#1a1a24] shadow-glow-sm',
          collapsed && 'justify-center px-2'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-lg bg-brand-500/10 border border-brand-500/20"
              transition={springSmooth}
            />
          )}
          <Icon
            className={cn(
              'relative z-10 flex-shrink-0 transition-colors',
              isActive ? 'text-brand-400' : 'text-[#9090b0] group-hover:text-[#f0f0ff]'
            )}
            size={18}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden',
                  isActive ? 'text-white' : ''
                )}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Tooltip when collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-[#22222f] border border-[#2a2a3a] text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-card-lg">
              {label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
      transition={springSmooth}
      className="relative flex flex-col h-full bg-[#111118] border-r border-[#2a2a3a] overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div className={cn('flex items-center px-4 py-5 border-b border-[#2a2a3a]', sidebarCollapsed && 'justify-center px-2')}>
        <AnimatePresence mode="wait">
          {!sidebarCollapsed ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-brand flex-shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">
                Intelli<span className="gradient-text">CRM</span>
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-brand"
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {/* Main nav */}
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.to}
            {...item}
            collapsed={sidebarCollapsed}
          />
        ))}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className={cn('pt-4 pb-2', sidebarCollapsed ? 'px-2' : 'px-3')}>
              {!sidebarCollapsed ? (
                <div className="flex items-center gap-1.5">
                  <Shield size={11} className="text-brand-500" />
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-[#5a5a78]">
                    Admin
                  </span>
                </div>
              ) : (
                <div className="border-t border-[#2a2a3a]" />
              )}
            </div>
            {adminItems.map((item) => (
              <SidebarNavItem
                key={item.to}
                {...item}
                collapsed={sidebarCollapsed}
              />
            ))}
          </>
        )}
      </nav>

      {/* User profile */}
      <div className={cn('border-t border-[#2a2a3a] p-3', sidebarCollapsed && 'flex justify-center')}>
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user ? getInitials(user.name) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <span className={cn(
                'inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border',
                getRoleColor(user?.role || '')
              )}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-[#5a5a78] hover:text-[#ef4444] hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-[#5a5a78] hover:text-[#ef4444] hover:bg-red-500/10 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center text-[#9090b0] hover:text-white hover:border-[#3a3a50] transition-colors z-10 shadow-card"
      >
        {sidebarCollapsed
          ? <ChevronRight size={12} />
          : <ChevronLeft size={12} />
        }
      </button>
    </motion.aside>
  );
}
