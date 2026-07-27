import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Mail, Calendar, Sparkles } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { StatusBadge } from '@/components/shared/Badge';
import { ErrorState } from '@/components/shared/States';
import { CardSkeleton } from '@/components/shared/Skeleton';
import EmailDraftModal from '@/components/features/tickets/EmailDraftModal';
import { formatDateTime } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/variants';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showDraft, setShowDraft] = useState(false);
  const { data: customers, isLoading, isError } = useCustomers();

  const ticket = customers
    ?.flatMap(c => c.tickets.map(t => ({ ...t, customer: c })))
    .find(t => t.id === id);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Failed to load ticket" message="Could not reach the backend." />;
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-sm text-[#9090b0]">Ticket not found.</p>
        <Link to="/customers" className="text-brand-400 hover:text-brand-300 text-sm mt-2 inline-block">
          ← Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link
        to="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-[#9090b0] hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Customers
      </Link>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
        {/* Ticket card */}
        <motion.div variants={staggerItem} className="bg-[#111118] rounded-xl border border-[#2a2a3a] p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-white mb-1">{ticket.subject}</h1>
              <div className="flex items-center gap-2">
                <StatusBadge status={ticket.status} />
                <span className="text-xs text-[#5a5a78]">·</span>
                <span className="text-xs text-[#5a5a78] flex items-center gap-1">
                  <Calendar size={11} />
                  {formatDateTime(ticket.createdAt)}
                </span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDraft(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-ai text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-glow-accent flex-shrink-0"
            >
              <Sparkles size={14} />
              Draft Email
            </motion.button>
          </div>

          <div className="p-4 bg-[#0f0f16] rounded-lg border border-[#2a2a3a]">
            <p className="text-xs font-medium text-[#5a5a78] uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-[#f0f0ff] leading-relaxed">{ticket.description}</p>
          </div>
        </motion.div>

        {/* Customer card */}
        <motion.div variants={staggerItem} className="bg-[#111118] rounded-xl border border-[#2a2a3a] p-6">
          <h2 className="text-xs font-semibold text-[#5a5a78] uppercase tracking-wider mb-4">Customer</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {ticket.customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">{ticket.customer.name}</p>
              <p className="text-sm text-[#9090b0] flex items-center gap-1.5 mt-0.5">
                <Mail size={12} /> {ticket.customer.email}
              </p>
              {ticket.customer.company && (
                <p className="text-sm text-[#9090b0] flex items-center gap-1.5 mt-0.5">
                  <Building2 size={12} /> {ticket.customer.company}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* AI Draft Modal */}
      {showDraft && (
        <EmailDraftModal
          ticketId={ticket.id}
          ticketSubject={ticket.subject}
          onClose={() => setShowDraft(false)}
        />
      )}
    </div>
  );
}
