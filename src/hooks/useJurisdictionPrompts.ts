import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CountryCode } from '@/types/helplix';

export interface JurisdictionPrompt {
  id: string;
  country_code: string;
  system_prompt: string;
  question_intensity: number;
  created_at: string;
  updated_at: string;
}

interface UseJurisdictionPromptsReturn {
  prompts: JurisdictionPrompt[];
  isLoading: boolean;
  error: string | null;
  getPromptForCountry: (countryCode: CountryCode) => string;
  getIntensityForCountry: (countryCode: CountryCode) => number;
  updatePrompt: (countryCode: string, systemPrompt: string) => Promise<boolean>;
  updateIntensity: (countryCode: string, intensity: number) => Promise<boolean>;
  refreshPrompts: () => Promise<void>;
}

export function useJurisdictionPrompts(): UseJurisdictionPromptsReturn {
  const [prompts, setPrompts] = useState<JurisdictionPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('jurisdiction_prompts')
        .select('*')
        .order('country_code');

      if (fetchError) {
        console.error('Error fetching jurisdiction prompts:', fetchError);
        setError(fetchError.message);
      } else {
        setPrompts(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching jurisdiction prompts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPromptForCountry = useCallback((countryCode: CountryCode): string => {
    const prompt = prompts.find(p => p.country_code === countryCode);
    return prompt?.system_prompt || '';
  }, [prompts]);

  const getIntensityForCountry = useCallback((countryCode: CountryCode): number => {
    const prompt = prompts.find(p => p.country_code === countryCode);
    return prompt?.question_intensity ?? 70;
  }, [prompts]);

  const updatePrompt = useCallback(async (countryCode: string, systemPrompt: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('jurisdiction_prompts')
        .update({ system_prompt: systemPrompt, updated_at: new Date().toISOString() })
        .eq('country_code', countryCode);

      if (updateError) {
        console.error('Error updating jurisdiction prompt:', updateError);
        setError(updateError.message);
        return false;
      }

      // Update local state
      setPrompts(prev => prev.map(prompt =>
        prompt.country_code === countryCode
          ? { ...prompt, system_prompt: systemPrompt, updated_at: new Date().toISOString() }
          : prompt
      ));

    return true;
    } catch (err) {
      console.error('Unexpected error updating jurisdiction prompt:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const updateIntensity = useCallback(async (countryCode: string, intensity: number): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('jurisdiction_prompts')
        .update({ question_intensity: intensity, updated_at: new Date().toISOString() })
        .eq('country_code', countryCode);

      if (updateError) {
        console.error('Error updating question intensity:', updateError);
        setError(updateError.message);
        return false;
      }

      // Update local state
      setPrompts(prev => prev.map(prompt =>
        prompt.country_code === countryCode
          ? { ...prompt, question_intensity: intensity, updated_at: new Date().toISOString() }
          : prompt
      ));

      return true;
    } catch (err) {
      console.error('Unexpected error updating question intensity:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  useEffect(() => {
    refreshPrompts();
  }, [refreshPrompts]);

  return { prompts, isLoading, error, getPromptForCountry, getIntensityForCountry, updatePrompt, updateIntensity, refreshPrompts };
}
