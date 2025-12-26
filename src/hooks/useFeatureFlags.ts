import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  id: string;
  feature_key: string;
  enabled: boolean;
  description: string | null;
  requires_connection: string | null;
  created_at: string;
  updated_at: string;
}

interface UseFeatureFlagsReturn {
  flags: FeatureFlag[];
  isLoading: boolean;
  error: string | null;
  updateFlag: (featureKey: string, enabled: boolean) => Promise<boolean>;
  refreshFlags: () => Promise<void>;
  getFlag: (featureKey: string) => boolean;
}

export function useFeatureFlags(): UseFeatureFlagsReturn {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFlags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('feature_flags')
        .select('*')
        .order('feature_key');

      if (fetchError) {
        console.error('Error fetching feature flags:', fetchError);
        setError(fetchError.message);
      } else {
        setFlags(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching feature flags:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFlag = useCallback(async (featureKey: string, enabled: boolean): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('feature_flags')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('feature_key', featureKey);

      if (updateError) {
        console.error('Error updating feature flag:', updateError);
        setError(updateError.message);
        return false;
      }

      // Update local state
      setFlags(prev => prev.map(flag => 
        flag.feature_key === featureKey 
          ? { ...flag, enabled, updated_at: new Date().toISOString() }
          : flag
      ));

      return true;
    } catch (err) {
      console.error('Unexpected error updating feature flag:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const getFlag = useCallback((featureKey: string): boolean => {
    const flag = flags.find(f => f.feature_key === featureKey);
    return flag?.enabled ?? false;
  }, [flags]);

  useEffect(() => {
    refreshFlags();
  }, [refreshFlags]);

  return { flags, isLoading, error, updateFlag, refreshFlags, getFlag };
}
