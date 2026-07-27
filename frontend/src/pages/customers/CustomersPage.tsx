import { Users } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import CustomerTable from '@/components/features/customers/CustomerTable';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { ErrorState, EmptyState } from '@/components/shared/States';

export default function CustomersPage() {
  const { data: customers, isLoading, isError, refetch } = useCustomers();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">Customers</h1>
          <p className="text-sm text-[#9090b0]">All CRM contacts and their support tickets</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111118] border border-[#2a2a3a] text-xs text-[#9090b0]">
          <Users size={13} />
          {isLoading ? '...' : `${customers?.length ?? 0} customers`}
        </div>
      </div>

      {isLoading && <TableSkeleton rows={6} />}

      {isError && (
        <ErrorState
          title="Failed to load customers"
          message="Could not reach the backend. Make sure the server is running."
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && customers?.length === 0 && (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customers will appear here once added to the database."
        />
      )}

      {!isLoading && !isError && customers && customers.length > 0 && (
        <CustomerTable customers={customers} />
      )}
    </div>
  );
}
