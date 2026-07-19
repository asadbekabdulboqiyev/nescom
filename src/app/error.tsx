'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">
              Something went wrong
            </h1>
            <p className="mb-8 max-w-md mx-auto text-sm text-slate-500">
              An unexpected error occurred. Please try again or return to the home page.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
