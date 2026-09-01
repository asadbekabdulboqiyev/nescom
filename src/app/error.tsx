'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12"
      role="alert"
    >
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-10 w-10 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-500">
          An unexpected error occurred while loading this page. Please try again. If the problem
          persists, our support team can help.
        </p>
        {error?.digest && (
          <p className="mb-6 rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-500">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            If the issue continues, contact support
          </p>
          <a
            href="mailto:support@nescom.example.com"
            className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            support@nescom.example.com
          </a>
        </div>
      </div>
    </div>
  );
}
