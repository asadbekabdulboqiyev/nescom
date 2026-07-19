'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyId?: string;
}

export function useRegister() {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (data: RegisterData) => {
    setError(null);
    setLoading(true);
    try {
      await register(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { register: handleRegister, error, loading };
}
