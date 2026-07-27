import { cn, getStatusColor, getCategoryColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      className
    )}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ');
  return (
    <Badge className={getStatusColor(status)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </Badge>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge className={getCategoryColor(category)}>
      {category}
    </Badge>
  );
}
