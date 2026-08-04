import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, FileText, Brain, ArrowRight, TrendingUp, Ticket,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useStats } from '@/hooks/useStats';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/shared/Badge';
import { StatCardSkeleton } from '@/components/shared/Skeleton';
import { cn, timeAgo } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/variants';

// ── Animated counter ──────────────────────────────────
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplay(Math.round(from + (to - from) * ease));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return <span className={className}>{display}</span>;
}

// ── Stat card ─────────────────────────────────────────
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  sub: string;
  color: string;
  href?: string;
  index: number;
}

function StatCard({ icon: Icon, label, value, sub, color, href, index }: StatCardProps) {
  const Wrap = href ? Link : 'div';
  return (
    <motion.div variants={staggerItem} custom={index}>
      <Wrap
        to={href ?? ''}
        className={cn(
          'block bg-[#111118] rounded-xl border border-[#2a2a3a] p-5 card-hover group',
          href && 'cursor-pointer'
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-[#9090b0] uppercase tracking-wider">{label}</span>
          <div className={cn('w-8 h-8 rounded-lg bg-[#1a1a24] flex items-center justify-center', color)}>
            <Icon size={16} />
          </div>
        </div>
        <p className="text-3xl font-bold text-white tabular-nums mb-1">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-xs text-[#9090b0]">{sub}</p>
        {href && (
          <div className="flex items-center gap-1 mt-3 text-xs text-[#5a5a78] group-hover:text-brand-400 transition-colors">
            View all <ArrowRight size={11} />
          </div>
        )}
      </Wrap>
    </motion.div>
  );
}

// ── Donut chart colours ───────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  open:        '#60a5fa',
  in_progress: '#facc15',
  resolved:    '#4ade80',
  closed:      '#5a5a78',
};

const STATUS_LABELS: Record<string, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  closed:      'Closed',
};

// ── Custom tooltip ────────────────────────────────────
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-xs shadow-card">
      <p className="text-white font-medium">{STATUS_LABELS[name] ?? name}</p>
      <p className="text-[#9090b0]">{value} ticket{value !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: customers, isLoading: custLoading } = useCustomers();

  const isLoading = statsLoading || custLoading;

  const recentTickets = customers
    ?.flatMap(c => c.tickets.map(t => ({ ...t, customer: c })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6) ?? [];

  const chartData = stats
    ? ['open', 'in_progress', 'resolved', 'closed']
        .map(k => ({ name: k, value: (stats as any)[k] as number }))
        .filter(d => d.value > 0)
    : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Greeting */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-1"
        >
          {greeting},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-[#9090b0]"
        >
          Here's your CRM at a glance.
        </motion.p>
      </div>

      {/* Stat cards */}
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
          <StatCard index={0} icon={Users}    label="Customers"     value={stats?.customers   ?? 0} sub="Total contacts"         color="text-brand-400"  href="/customers" />
          <StatCard index={1} icon={Ticket}   label="Tickets"       value={stats?.totalTickets ?? 0} sub={`${stats?.open ?? 0} open`} color="text-yellow-400" />
          <StatCard index={2} icon={FileText} label="Documents"     value={stats?.documents   ?? 0} sub="Embedded in vector DB"  color="text-accent-400" href={user?.role === 'admin' ? '/documents' : undefined} />
          <StatCard index={3} icon={Brain}    label="AI Queries"    value={0}                        sub="Ask AI to get started"  color="text-pink-400"   href="/ask" />
        </motion.div>
      )}

      {/* Chart + recent tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Donut chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111118] rounded-xl border border-[#2a2a3a] p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-[#9090b0]" />
            <h2 className="text-sm font-semibold text-white">Ticket Status</h2>
          </div>

          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={900}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? '#5a5a78'}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="space-y-1.5 mt-1">
                {chartData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[d.name] }} />
                      <span className="text-xs text-[#9090b0]">{STATUS_LABELS[d.name]}</span>
                    </div>
                    <span className="text-xs font-semibold text-white tabular-nums">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Ticket size={24} className="text-[#5a5a78] mb-2" />
              <p className="text-xs text-[#5a5a78]">No tickets yet</p>
            </div>
          )}
        </motion.div>

        {/* Recent tickets */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-[#111118] rounded-xl border border-[#2a2a3a] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-[#9090b0]" />
              <h2 className="text-sm font-semibold text-white">Recent Tickets</h2>
            </div>
            <Link
              to="/customers"
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Ticket size={24} className="text-[#5a5a78] mb-2" />
              <p className="text-xs text-[#5a5a78]">No tickets yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#161622] border border-transparent hover:border-[#2a2a3a] transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-[#9090b0] truncate">{ticket.customer?.name}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-[#5a5a78] flex-shrink-0">{timeAgo(ticket.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
