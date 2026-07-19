'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useUser() {
  const { user, token, loading } = useAuth();
  return { user, token, loading };
}
