// ── Customer & Ticket types ──────────────────────────
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  customerId: string;
  createdAt: string;
  customer?: Customer;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  createdAt: string;
  tickets: Ticket[];
}
