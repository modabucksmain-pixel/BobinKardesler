import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from '../contexts/AuthContext';

export function useAdminGuard() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<'admin' | 'moderator' | 'user' | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (authLoading) return;
      if (!user) {
        setRole(null);
        setChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Admin role check failed:', error);
        setRole(null);
      } else {
        setRole((data?.role as 'admin' | 'moderator' | 'user') ?? 'user');
      }

      setChecking(false);
    }

    fetchRole();
  }, [user, authLoading]);

  return {
    user,
    isAdmin: role === 'admin',
    checking: authLoading || checking,
  };
}
