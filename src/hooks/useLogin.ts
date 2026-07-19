'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useLogin() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { login: handleLogin, error, loading };
}
