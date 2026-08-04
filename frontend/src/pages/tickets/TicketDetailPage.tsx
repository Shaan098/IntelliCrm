import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, Mail, Calendar, Sparkles, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useUpdateTicketStatus } from '@/hooks/useDocuments';
import { StatusBadge } from '@/components/shared/Badge';
import { ErrorState } from '@/components/shared/States';
import { CardSkeleton } from '@/components/shared/Skeleton';
import EmailDraftModal from '@/components/features/tickets/EmailDraftModal';
import { formatDateTime, getStatusColor, cn } from '@/lib/utils';
import { TicketStatus } from '@/types/customer.types';
import { staggerContainer, staggerItem } from '@/animations/variants';
import { toast } from 'sonner';

const STATUSES: { value: TicketStatus; label: string }[] = [
  { value: 'open',        label: 'Open'        },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved'    },
  { value: 'closed',      label: 'Closed'      },
];

function StatusDropdown({ currentStatus, ticketId }: { currentStatus: TicketStatus; ticketId: string }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useUpdateTicketStatus(ticketId);

  const handleSelect = (status: TicketStatus) => {
    if (status === currentStatus) { setOpen(false); return; }
    setOpen(false);
    mutate(status, {
      onSuccess: () => toast.success(`Status updated to "${status.replace('_', ' ')}"`),
      onError:   (e) => toast.error((e as Error).message),
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2a2a3a] bg-[#1a1a24] hover:border-[#3a3a50] transition-colors disabled:opacity-60"
      >
        {isPending
          ? <Loader2 size={13} className="animate-spin text-[#9090b0]" />
          : <StatusBadge status={currentStatus} />
        }
        <ChevronDown size={12} className={cn('text-[#5a5a78] transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1.5 z-40 w-40 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl shadow-card-lg overflow-hidden"
            >
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => handleSelect(s.value)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#22222f] transition-colors"
                >
                  <StatusBadge status={s.value} />
                  {s.value === currentStatus && <Check size={13} className="text-brand-400" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showDraft, setShowDraft] = useState(false);
  const { data: customers, isLoading, isError } = useCustomers();

  const ticketData = customers
    ?.flatMap(c => c.tickets.map(t => ({ ...t, customer: c })))
    .find(t => t.id === id);

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      <CardSkeleton /><CardSkeleton />
    </div>
  );

  if (isError) return (
    <ErrorState title="Failed to load ticket" message="Could not reach the backend." />
  );

  if (!ticketData) return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <p className="text-sm text-[#9090b0]">Ticket not found.</p>
      <Link to="/customers" className="text-brand-400 hover:text-brand-300 text-sm mt-2 inline-block">
        ← Back to customers
      </Link>
    </div>
  );

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
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-white mb-1 leading-snug">{ticketData.subject}</h1>
              <div className="flex items-center gap-2 text-xs text-[#5a5a78]">
                <Calendar size={11} />
                {formatDateTime(ticketData.createdAt)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusDropdown currentStatus={ticketData.status as TicketStatus} ticketId={ticketData.id} />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDraft(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-ai text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-glow-accent"
              >
                <Sparkles size={14} />
                Draft Reply
              </motion.button>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-[#0f0f16] rounded-lg border border-[#2a2a3a]">
            <p className="text-xs font-medium text-[#5a5a78] uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-[#f0f0ff] leading-relaxed whitespace-pre-wrap">{ticketData.description}</p>
          </div>
        </motion.div>

        {/* Customer card */}
        <motion.div variants={staggerItem} className="bg-[#111118] rounded-xl border border-[#2a2a3a] p-6">
          <h2 className="text-xs font-semibold text-[#5a5a78] uppercase tracking-wider mb-4">Customer</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {ticketData.customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-semibold text-white">{ticketData.customer.name}</p>
              <p className="text-sm text-[#9090b0] flex items-center gap-1.5">
                <Mail size={12} /> {ticketData.customer.email}
              </p>
              {ticketData.customer.company && (
                <p className="text-sm text-[#9090b0] flex items-center gap-1.5">
                  <Building2 size={12} /> {ticketData.customer.company}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* AI Draft Modal */}
      {showDraft && (
        <EmailDraftModal
          ticketId={ticketData.id}
          ticketSubject={ticketData.subject}
          onClose={() => setShowDraft(false)}
        />
      )}
    </div>
  );
}
