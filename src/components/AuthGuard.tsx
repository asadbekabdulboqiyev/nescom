'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Role } from '@/lib/roles';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: Role | Role[];
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <LoadingSpinner label="Checking your session" fullScreen />;
  }

  if (!user) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50" role="alert">
          <div className="text-center">
            <p className="text-sm text-slate-500">You are not signed in. Redirecting to login...</p>
          </div>
        </div>
      )
    );
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return (
        <div className="flex h-full items-center justify-center p-8" role="alert">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
              <span className="text-2xl" aria-hidden="true">
                🔒
              </span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
            <p className="mt-2 text-sm text-slate-500">
              You don&apos;t have permission to view this page. Your role is{' '}
              <span className="font-medium text-slate-700">{user.role}</span>.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
