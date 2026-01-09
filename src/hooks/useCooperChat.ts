import { useState, useCallback, useRef, useMemo } from 'react';
import type { CooperSettings } from '@/types/helplix';
import { COUNTRIES } from '@/types/helplix';
import type { ConversationPhase } from '@/types/phases';
import type { InformationGaps } from '@/types/information-tracking';

// Get language from country code
const getLanguageFromCountry = (countryCode: string | null): string | null => {
  if (!countryCode) return null;
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country?.language || null;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseCooperChatOptions {
  settings: CooperSettings;
  systemPrompt?: string; // Override settings.systemPrompt with jurisdiction-specific prompt
  questionIntensity?: number; // Override settings.questionIntensity with jurisdiction-specific value
  currentPhase?: ConversationPhase;
  informationGaps?: InformationGaps;
  completeness?: number;
  onResponse?: (response: string) => void;
  onError?: (error: string) => void;
}

export function useCooperChat({ settings, systemPrompt, questionIntensity, currentPhase, informationGaps, completeness, onResponse, onError }: UseCooperChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<Message[]>([]);

  // Get language directly from country - no text-based detection needed
  const userLanguage = useMemo(() => getLanguageFromCountry(settings.country), [settings.country]);

  const sendMessage = useCallback(async (userMessage: string, phase?: ConversationPhase): Promise<string> => {
    const activePhase = phase || currentPhase || 'opening';
    setIsLoading(true);

    try {
      // Add user message to history
      messagesRef.current = [
        ...messagesRef.current,
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/cooper-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            messages: messagesRef.current,
            systemPrompt: systemPrompt || settings.systemPrompt,
            questionIntensity: Math.round((questionIntensity ?? settings.questionIntensity) / 10),
            userLanguage, // Always derived from country
            country: settings.country,
            currentPhase: activePhase,
            informationGaps,
            completeness,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.message;

      // Add assistant message to history
      messagesRef.current = [
        ...messagesRef.current,
        { role: 'assistant', content: assistantMessage }
      ];

      onResponse?.(assistantMessage);
      return assistantMessage;
    } catch (error) {
      console.error('Cooper chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [settings, systemPrompt, questionIntensity, userLanguage, currentPhase, informationGaps, completeness, onResponse, onError]);

  const resetConversation = useCallback(() => {
    messagesRef.current = [];
  }, []);

  const getMessageHistory = useCallback(() => {
    return [...messagesRef.current];
  }, []);

  return {
    isLoading,
    userLanguage,
    sendMessage,
    resetConversation,
    getMessageHistory,
  };
}
