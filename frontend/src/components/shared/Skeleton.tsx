import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-[#111118] rounded-xl border border-[#2a2a3a] p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-px">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-[#111118] rounded-t-xl border border-[#2a2a3a]">
        {[40, 120, 100, 80, 60].map((w, i) => (
          <Skeleton key={i} className="h-3" style={{ width: w }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 px-4 py-4 bg-[#111118] border-x border-b border-[#2a2a3a]"
          style={{ borderBottomLeftRadius: i === rows - 1 ? 12 : 0, borderBottomRightRadius: i === rows - 1 ? 12 : 0 }}
        >
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-3 flex-1 max-w-[140px]" />
          <Skeleton className="h-3 flex-1 max-w-[120px]" />
          <Skeleton className="h-3 flex-1 max-w-[100px]" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </motion.div>
      ))}
    </div>
  );
}

export function AnswerSkeleton() {
  return (
    <div className="space-y-3 p-5 bg-[#111118] rounded-xl border border-[#2a2a3a]">
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[#111118] rounded-xl border border-[#2a2a3a] p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-16 mb-1" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}
