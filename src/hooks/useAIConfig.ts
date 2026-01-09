import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIConfig {
  id: string;
  config_key: string;
  endpoint_url: string;
  api_key: string;
  model_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_config')
        .select('*')
        .eq('config_key', 'primary')
        .single();

      if (fetchError) {
        // If no row exists, that's ok - we'll create one on save
        if (fetchError.code === 'PGRST116') {
          setConfig(null);
        } else {
          throw fetchError;
        }
      } else {
        setConfig(data as AIConfig);
      }
    } catch (err) {
      console.error('Error fetching AI config:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch AI config');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(async (updates: Partial<Omit<AIConfig, 'id' | 'config_key' | 'created_at' | 'updated_at'>>) => {
    setIsSaving(true);
    setError(null);

    try {
      if (config?.id) {
        // Update existing
        const { data, error: updateError } = await supabase
          .from('ai_config')
          .update(updates)
          .eq('id', config.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setConfig(data as AIConfig);
      } else {
        // Insert new
        const { data, error: insertError } = await supabase
          .from('ai_config')
          .insert({
            config_key: 'primary',
            endpoint_url: updates.endpoint_url || 'https://api.openai.com/v1/chat/completions',
            api_key: updates.api_key || '',
            model_name: updates.model_name || 'gpt-4o',
            is_active: updates.is_active ?? false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setConfig(data as AIConfig);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating AI config:', err);
      setError(err instanceof Error ? err.message : 'Failed to update AI config');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [config?.id]);

  const toggleActive = useCallback(async (isActive: boolean) => {
    return updateConfig({ is_active: isActive });
  }, [updateConfig]);

  return {
    config,
    isLoading,
    isSaving,
    error,
    updateConfig,
    toggleActive,
    refreshConfig: fetchConfig,
  };
}
