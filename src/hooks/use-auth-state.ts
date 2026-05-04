
"use client";

import { useAuth } from '@/context/auth-context';

export function useAuthState(): [any, boolean, any] {
  const { user, loading, error } = useAuth();
  return [user, loading, error];
}
