import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Phase = 'opening' | 'timeline' | 'details' | 'legal' | 'evidence' | 'impact' | 'closing';

export interface PhaseInstruction {
  id: string;
  country_code: string;
  phase: Phase;
  instruction: string;
  created_at: string;
  updated_at: string;
}

interface UsePhaseInstructionsReturn {
  instructions: PhaseInstruction[];
  isLoading: boolean;
  error: string | null;
  getInstruction: (countryCode: string, phase: Phase) => string;
  updateInstruction: (countryCode: string, phase: Phase, instruction: string) => Promise<boolean>;
  refreshInstructions: () => Promise<void>;
}

export const PHASES: { key: Phase; label: string; labelSv: string }[] = [
  { key: 'opening', label: 'Opening', labelSv: 'Öppning' },
  { key: 'timeline', label: 'Timeline', labelSv: 'Tidslinje' },
  { key: 'details', label: 'Details', labelSv: 'Detaljer' },
  { key: 'legal', label: 'Legal', labelSv: 'Juridik' },
  { key: 'evidence', label: 'Evidence', labelSv: 'Bevis' },
  { key: 'impact', label: 'Impact', labelSv: 'Konsekvenser' },
  { key: 'closing', label: 'Closing', labelSv: 'Avslutning' },
];

export function usePhaseInstructions(): UsePhaseInstructionsReturn {
  const [instructions, setInstructions] = useState<PhaseInstruction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshInstructions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('phase_instructions')
        .select('*')
        .order('country_code')
        .order('phase');

      if (fetchError) {
        console.error('Error fetching phase instructions:', fetchError);
        setError(fetchError.message);
      } else {
        setInstructions((data || []) as PhaseInstruction[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching phase instructions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getInstruction = useCallback((countryCode: string, phase: Phase): string => {
    const instruction = instructions.find(
      i => i.country_code === countryCode && i.phase === phase
    );
    return instruction?.instruction || '';
  }, [instructions]);

  const updateInstruction = useCallback(async (
    countryCode: string, 
    phase: Phase, 
    instruction: string
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('phase_instructions')
        .update({ instruction, updated_at: new Date().toISOString() })
        .eq('country_code', countryCode)
        .eq('phase', phase);

      if (updateError) {
        console.error('Error updating phase instruction:', updateError);
        setError(updateError.message);
        return false;
      }

      // Update local state
      setInstructions(prev => prev.map(i =>
        i.country_code === countryCode && i.phase === phase
          ? { ...i, instruction, updated_at: new Date().toISOString() }
          : i
      ));

      return true;
    } catch (err) {
      console.error('Unexpected error updating phase instruction:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  useEffect(() => {
    refreshInstructions();
  }, [refreshInstructions]);

  return { instructions, isLoading, error, getInstruction, updateInstruction, refreshInstructions };
}
