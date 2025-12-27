import { useState, useCallback, useRef } from 'react';
import type { CooperSettings } from '@/types/helplix';
import type { ConversationPhase } from '@/types/phases';
import type { InformationGaps } from '@/types/information-tracking';

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
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const messagesRef = useRef<Message[]>([]);

  const sendMessage = useCallback(async (userMessage: string, phase?: ConversationPhase): Promise<string> => {
    const activePhase = phase || currentPhase || 'opening';
    setIsLoading(true);

    try {
      // Add user message to history
      messagesRef.current = [
        ...messagesRef.current,
        { role: 'user', content: userMessage }
      ];

      // Detect language from first user response if not set
      // Simple heuristic: check for common language indicators
      if (!detectedLanguage && messagesRef.current.length <= 2) {
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('português') || lowerMessage.includes('portugues') || lowerMessage.includes('brazilian')) {
          setDetectedLanguage('Portuguese (Brazilian)');
        } else if (lowerMessage.includes('english')) {
          setDetectedLanguage('English');
        } else if (lowerMessage.includes('español') || lowerMessage.includes('spanish')) {
          setDetectedLanguage('Spanish');
        }
        // Otherwise let the AI figure it out from context
      }

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
            systemPrompt: systemPrompt || settings.systemPrompt, // Use jurisdiction prompt if provided
            questionIntensity: Math.round((questionIntensity ?? settings.questionIntensity) / 10), // Convert 0-100 to 1-10
            userLanguage: detectedLanguage,
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
  }, [settings, systemPrompt, questionIntensity, detectedLanguage, onResponse, onError]);

  const resetConversation = useCallback(() => {
    messagesRef.current = [];
    setDetectedLanguage(null);
  }, []);

  const getMessageHistory = useCallback(() => {
    return [...messagesRef.current];
  }, []);

  return {
    isLoading,
    detectedLanguage,
    sendMessage,
    resetConversation,
    getMessageHistory,
  };
}
