import { motion } from 'framer-motion';
import { Users, Ticket, FileText, Brain, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/shared/Badge';
import { StatCardSkeleton, TableSkeleton } from '@/components/shared/Skeleton';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/variants';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  href?: string;
  index: number;
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-brand-400', href, index }: StatCardProps) {
  const Wrapper = href ? Link : 'div';
  return (
    <motion.div
      variants={staggerItem}
      custom={index}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Wrapper
        to={href ?? ''}
        className={cn(
          'block bg-[#111118] rounded-xl border border-[#2a2a3a] p-5 card-hover',
          href && 'cursor-pointer group'
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-[#9090b0] uppercase tracking-wider">{label}</span>
          <div className={cn('w-8 h-8 rounded-lg bg-[#1a1a24] flex items-center justify-center', color)}>
            <Icon size={16} />
          </div>
        </div>
        <p className="text-2xl font-bold text-white tabular-nums mb-1">{value}</p>
        {sub && <p className="text-xs text-[#9090b0]">{sub}</p>}
        {href && (
          <div className="flex items-center gap-1 mt-3 text-xs text-[#5a5a78] group-hover:text-brand-400 transition-colors">
            <span>View all</span>
            <ArrowRight size={11} />
          </div>
        )}
      </Wrapper>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: customers, isLoading, isError } = useCustomers();

  const totalTickets   = customers?.reduce((acc, c) => acc + c.tickets.length, 0) ?? 0;
  const openTickets    = customers?.flatMap(c => c.tickets).filter(t => t.status === 'open').length ?? 0;
  const recentTickets  = customers
    ?.flatMap(c => c.tickets.map(t => ({ ...t, customer: c })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8) ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero greeting */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-1"
        >
          Good{new Date().getHours() < 12 ? ' morning' : new Date().getHours() < 18 ? ' afternoon' : ' evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-[#9090b0]"
        >
          Here's what's happening in your CRM today.
        </motion.p>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard index={0} icon={Users}   label="Total Customers" value={customers?.length ?? 0} sub="CRM contacts" color="text-brand-400" href="/customers" />
          <StatCard index={1} icon={Ticket}  label="Total Tickets"   value={totalTickets} sub={`${openTickets} open`} color="text-yellow-400" />
          <StatCard index={2} icon={FileText} label="Documents"      value="—" sub="Upload PDFs to use AI" color="text-accent-400" href={user?.role === 'admin' ? '/documents' : undefined} />
          <StatCard index={3} icon={Brain}    label="Ask AI"         value="Ready" sub="RAG-powered Q&A" color="text-pink-400" href="/ask" />
        </motion.div>
      )}

      {/* Recent tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#9090b0]" />
            <h2 className="text-sm font-semibold text-white">Recent Tickets</h2>
          </div>
          <Link to="/customers" className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : isError ? (
          <div className="py-8 text-center text-sm text-red-400">Failed to load tickets</div>
        ) : recentTickets.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-[#2a2a3a]">
            <Ticket size={24} className="text-[#5a5a78] mx-auto mb-2" />
            <p className="text-sm text-[#5a5a78]">No tickets yet</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer} initial="initial" animate="animate"
            className="rounded-xl border border-[#2a2a3a] overflow-hidden"
          >
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-[2fr_1fr_120px_100px] gap-4 px-4 py-3 bg-[#0f0f16] border-b border-[#2a2a3a] text-xs font-medium text-[#5a5a78] uppercase tracking-wider">
              <span>Ticket</span>
              <span>Customer</span>
              <span>Status</span>
              <span>Created</span>
            </div>

            {recentTickets.map((ticket) => (
              <motion.div key={ticket.id} variants={staggerItem}>
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_120px_100px] gap-2 sm:gap-4 px-4 py-3.5 bg-[#111118] border-b border-[#2a2a3a] last:border-0 hover:bg-[#161622] transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-[#9090b0] truncate mt-0.5">{ticket.description.slice(0, 60)}…</p>
                  </div>
                  <p className="hidden sm:block text-sm text-[#9090b0] self-center truncate">{ticket.customer?.name}</p>
                  <div className="hidden sm:flex items-center">
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="hidden sm:block text-xs text-[#5a5a78] self-center">{timeAgo(ticket.createdAt)}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
