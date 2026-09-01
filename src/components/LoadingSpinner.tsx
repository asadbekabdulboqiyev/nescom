'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
};

export function LoadingSpinner({
  size = 'md',
  label = 'Loading',
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center gap-3',
        fullScreen && 'h-screen w-full',
        className
      )}
    >
      <span
        className={cn(
          'inline-block animate-spin rounded-full border-blue-600 border-t-transparent',
          sizeStyles[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}...</span>
    </span>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <span
            className={cn(
              'inline-block animate-spin rounded-full border-blue-600 border-t-transparent',
              sizeStyles[size]
            )}
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-slate-500" role="status">
            {label}...
          </p>
        </div>
      </div>
    );
  }

  return spinner;
}
