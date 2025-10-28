import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, color = 'primary', className }: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <Card className={cn('p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in-scale', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={cn('text-sm font-medium', trend.isPositive ? 'text-success' : 'text-destructive')}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-background/50', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}