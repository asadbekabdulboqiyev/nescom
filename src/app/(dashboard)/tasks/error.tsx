'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Tasks error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6" role="alert">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
        </div>
        <h2 className="mb-2 flex items-center justify-center gap-2 text-xl font-semibold text-slate-900">
          <CheckSquare className="h-5 w-5 text-slate-400" aria-hidden="true" />
          Tasks Error
        </h2>
        <p className="mb-6 max-w-md text-sm text-slate-500">
          We couldn&apos;t load your tasks. Please try again. If the problem persists, contact
          support.
        </p>
        {error?.digest && (
          <p className="mb-6 rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-500">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
