import Link from 'next/link';
import { Home, ArrowLeft, SearchX, MapPin, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20"
            aria-hidden="true"
          />
          <div className="relative">
            <SearchX className="h-16 w-16 text-blue-600" aria-hidden="true" />
            <MapPin className="absolute -right-3 -top-2 h-6 w-6 text-red-500" aria-hidden="true" />
          </div>
        </div>
        <p className="mb-2 font-mono text-sm font-semibold uppercase tracking-widest text-blue-600">
          404 — Not Found
        </p>
        <h1 className="mb-3 text-4xl font-bold text-slate-900">The page has vanished</h1>
        <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-slate-500">
          We couldn&apos;t find the page you&apos;re looking for. It may have been moved, deleted,
          or the link may be incorrect.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            Back to Overview
          </Link>
        </div>
        <button
          onClick={() => window.history.back()}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Go back to previous page
        </button>
      </div>
    </div>
  );
}
