'use client';

import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-4 py-8' : 'px-6 py-16',
        className
      )}
      role="status"
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-slate-100',
          compact ? 'mb-3 h-10 w-10' : 'mb-4 h-16 w-16'
        )}
      >
        <Icon
          className={cn('text-slate-400', compact ? 'h-5 w-5' : 'h-8 w-8')}
          aria-hidden="true"
        />
      </div>
      <h3 className={cn('font-semibold text-slate-900', compact ? 'text-sm' : 'text-lg')}>
        {title}
      </h3>
      {description && (
        <p className={cn('mt-2 max-w-sm text-slate-500', compact ? 'text-xs' : 'text-sm')}>
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
