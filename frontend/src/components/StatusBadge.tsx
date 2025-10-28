// src/components/StatusBadge.tsx
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status?:
    | 'available'
    | 'in-use'
    | 'in_use'
    | 'offline'
    | 'maintenance'
    | 'active'
    | 'inactive'
    | 'ongoing'
    | 'completed'
    | string; // fallback for unexpected values
  className?: string;
}

export function StatusBadge({ status = 'unknown', className }: StatusBadgeProps) {
  // Normalize the status string to handle various formats (e.g., in_use, In Use, in-use)
  const normalizedStatus = status.toLowerCase().replace(/[_\s]/g, '-');

  const statusConfig: Record<
    string,
    { label: string; className: string }
  > = {
    available: {
      label: 'Available',
      className: 'bg-success/10 text-success border-success/20',
    },
    'in-use': {
      label: 'In Use',
      className: 'bg-primary/10 text-primary border-primary/20',
    },
    offline: {
      label: 'Offline',
      className: 'bg-muted/50 text-muted-foreground border-border',
    },
    maintenance: {
      label: 'Maintenance',
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    active: {
      label: 'Active',
      className: 'bg-success/10 text-success border-success/20',
    },
    inactive: {
      label: 'Inactive',
      className: 'bg-muted/50 text-muted-foreground border-border',
    },
    ongoing: {
      label: 'Ongoing',
      className:
        'bg-primary/10 text-primary border-primary/20 animate-pulse-glow',
    },
    completed: {
      label: 'Completed',
      className: 'bg-success/10 text-success border-success/20',
    },
  };

  // Use matching config or a default fallback
  const config =
    statusConfig[normalizedStatus] || {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className: 'bg-gray-500/10 text-gray-700 border-gray-300',
    };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
