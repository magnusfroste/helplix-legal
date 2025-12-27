import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BehaviorGuideline {
  id: string;
  country_code: string | null; // null = global
  guideline_key: string;
  guideline_text: string;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface UseBehaviorGuidelinesReturn {
  guidelines: BehaviorGuideline[];
  isLoading: boolean;
  error: string | null;
  getGlobalGuidelines: () => BehaviorGuideline[];
  getGuidelinesForCountry: (countryCode: string) => BehaviorGuideline[];
  updateGuideline: (id: string, updates: Partial<Pick<BehaviorGuideline, 'guideline_text' | 'is_enabled'>>) => Promise<boolean>;
  addGuideline: (guideline: Omit<BehaviorGuideline, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  deleteGuideline: (id: string) => Promise<boolean>;
  refreshGuidelines: () => Promise<void>;
}

export function useBehaviorGuidelines(): UseBehaviorGuidelinesReturn {
  const [guidelines, setGuidelines] = useState<BehaviorGuideline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGuidelines = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('behavior_guidelines')
        .select('*')
        .order('sort_order');

      if (fetchError) {
        console.error('Error fetching behavior guidelines:', fetchError);
        setError(fetchError.message);
      } else {
        setGuidelines((data || []) as BehaviorGuideline[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching behavior guidelines:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGlobalGuidelines = useCallback((): BehaviorGuideline[] => {
    return guidelines.filter(g => g.country_code === null);
  }, [guidelines]);

  const getGuidelinesForCountry = useCallback((countryCode: string): BehaviorGuideline[] => {
    return guidelines.filter(g => g.country_code === countryCode);
  }, [guidelines]);

  const updateGuideline = useCallback(async (
    id: string, 
    updates: Partial<Pick<BehaviorGuideline, 'guideline_text' | 'is_enabled'>>
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('behavior_guidelines')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating behavior guideline:', updateError);
        setError(updateError.message);
        return false;
      }

      // Update local state
      setGuidelines(prev => prev.map(g =>
        g.id === id
          ? { ...g, ...updates, updated_at: new Date().toISOString() }
          : g
      ));

      return true;
    } catch (err) {
      console.error('Unexpected error updating behavior guideline:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const addGuideline = useCallback(async (
    guideline: Omit<BehaviorGuideline, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    try {
      const { data, error: insertError } = await supabase
        .from('behavior_guidelines')
        .insert(guideline)
        .select()
        .single();

      if (insertError) {
        console.error('Error adding behavior guideline:', insertError);
        setError(insertError.message);
        return false;
      }

      // Update local state
      setGuidelines(prev => [...prev, data as BehaviorGuideline].sort((a, b) => a.sort_order - b.sort_order));

      return true;
    } catch (err) {
      console.error('Unexpected error adding behavior guideline:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const deleteGuideline = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('behavior_guidelines')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting behavior guideline:', deleteError);
        setError(deleteError.message);
        return false;
      }

      // Update local state
      setGuidelines(prev => prev.filter(g => g.id !== id));

      return true;
    } catch (err) {
      console.error('Unexpected error deleting behavior guideline:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  useEffect(() => {
    refreshGuidelines();
  }, [refreshGuidelines]);

  return { 
    guidelines, 
    isLoading, 
    error, 
    getGlobalGuidelines,
    getGuidelinesForCountry,
    updateGuideline, 
    addGuideline,
    deleteGuideline,
    refreshGuidelines 
  };
}
