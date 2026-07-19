'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
 return (
 <div className="flex h-screen items-center justify-center" role="status" aria-label="Loading">
 <div
 className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
 aria-hidden="true"
 />
 <span className="sr-only">Loading...</span>
 </div>
 );
 }

 if (!user) return fallback ?? null;

 if (requiredRole) {
 const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
 if (!roles.includes(user.role)) {
 return (
 <div className="flex h-full items-center justify-center p-8">
 <div className="text-center">
 <h2 className="text-xl font-semibold text-slate-900">
 Access Denied
 </h2>
 <p className="mt-2 text-sm text-slate-500">
 You don&apos;t have permission to view this page.
 </p>
 </div>
 </div>
 );
 }
 }

 return <>{children}</>;
}
