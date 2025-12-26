import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAdminAuthReturn {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  checkAdminStatus: () => Promise<void>;
}

export function useAdminAuth(userId: string | null): UseAdminAuthReturn {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminStatus = useCallback(async () => {
    if (!userId) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Checking admin status for user:', userId);
      
      const { data, error: fnError } = await supabase.functions.invoke('verify-admin', {
        body: { userId }
      });

      if (fnError) {
        console.error('Error calling verify-admin:', fnError);
        setError(fnError.message);
        setIsAdmin(false);
      } else {
        console.log('Admin verification result:', data);
        setIsAdmin(data?.isAdmin ?? false);
      }
    } catch (err) {
      console.error('Unexpected error checking admin status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return { isAdmin, isLoading, error, checkAdminStatus };
}
