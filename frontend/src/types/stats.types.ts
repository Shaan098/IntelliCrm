export interface DocumentWithCount {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  _count: { chunks: number };
}

export interface Stats {
  customers:   number;
  documents:   number;
  totalTickets: number;
  open:        number;
  in_progress: number;
  resolved:    number;
  closed:      number;
}
