import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Building2, Mail, Ticket, ChevronRight, ChevronDown } from 'lucide-react';
import { Customer } from '@/types/customer.types';
import { StatusBadge } from '@/components/shared/Badge';
import { cn, formatDate, truncate } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/variants';

interface CustomerTableProps {
  customers: Customer[];
}

export default function CustomerTable({ customers }: CustomerTableProps) {
  const [search, setSearch]           = useState('');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [sortBy, setSortBy]           = useState<'name' | 'tickets' | 'date'>('date');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers
      .filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (sortBy === 'tickets') return b.tickets.length - a.tickets.length;
        if (sortBy === 'name')    return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [customers, search, sortBy]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a78]" size={15} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers, companies..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#111118] border border-[#2a2a3a] rounded-lg text-sm text-white placeholder-[#5a5a78] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors hover:border-[#3a3a50]"
          />
        </div>
        <div className="flex gap-2">
          {(['date', 'name', 'tickets'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded-lg border transition-colors capitalize',
                sortBy === s
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                  : 'bg-[#111118] border-[#2a2a3a] text-[#9090b0] hover:border-[#3a3a50] hover:text-white'
              )}
            >
              {s === 'date' ? 'Newest' : s === 'tickets' ? 'Tickets' : 'A–Z'}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-[#5a5a78]">
        {filtered.length} of {customers.length} customers
      </p>

      {/* Table */}
      <div className="rounded-xl border border-[#2a2a3a] overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_80px_40px] items-center gap-4 px-4 py-3 bg-[#111118] border-b border-[#2a2a3a] text-xs font-medium text-[#5a5a78] uppercase tracking-wider">
          <span>Customer</span>
          <span>Company</span>
          <span>Joined</span>
          <span>Tickets</span>
          <span />
        </div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#5a5a78]">
              No customers match your search.
            </div>
          ) : (
            filtered.map((customer) => (
              <motion.div key={customer.id} variants={staggerItem}>
                {/* Row */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_80px_40px] items-center gap-3 sm:gap-4 px-4 py-4 bg-[#111118] border-b border-[#2a2a3a] hover:bg-[#161622] transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === customer.id ? null : customer.id)}
                >
                  {/* Name + email */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{customer.name}</p>
                      <p className="text-xs text-[#9090b0] flex items-center gap-1 truncate">
                        <Mail size={10} />
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  {/* Company */}
                  <div className="hidden sm:flex items-center gap-1.5 text-sm text-[#9090b0]">
                    {customer.company && <Building2 size={13} className="flex-shrink-0" />}
                    {customer.company || <span className="text-[#5a5a78]">—</span>}
                  </div>

                  {/* Date */}
                  <div className="hidden sm:block text-xs text-[#9090b0]">
                    {formatDate(customer.createdAt)}
                  </div>

                  {/* Ticket count */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Ticket size={13} className={cn(customer.tickets.length > 0 ? 'text-brand-400' : 'text-[#5a5a78]')} />
                    <span className={cn('text-sm font-medium', customer.tickets.length > 0 ? 'text-white' : 'text-[#5a5a78]')}>
                      {customer.tickets.length}
                    </span>
                  </div>

                  {/* Expand */}
                  <div className="hidden sm:flex justify-end">
                    <ChevronDown
                      size={15}
                      className={cn('text-[#5a5a78] transition-transform', expandedId === customer.id && 'rotate-180')}
                    />
                  </div>
                </div>

                {/* Expanded tickets */}
                {expandedId === customer.id && customer.tickets.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#0f0f16] border-b border-[#2a2a3a]"
                  >
                    <div className="px-4 py-3 space-y-2">
                      <p className="text-xs font-medium text-[#5a5a78] uppercase tracking-wider mb-3">Tickets</p>
                      {customer.tickets.map((ticket) => (
                        <Link
                          key={ticket.id}
                          to={`/tickets/${ticket.id}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#111118] border border-[#2a2a3a] hover:border-brand-500/30 hover:bg-[#1a1a24] transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors truncate">
                              {ticket.subject}
                            </p>
                            <p className="text-xs text-[#9090b0] mt-0.5 truncate">
                              {truncate(ticket.description, 80)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                            <StatusBadge status={ticket.status} />
                            <ChevronRight size={14} className="text-[#5a5a78] group-hover:text-brand-400 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
