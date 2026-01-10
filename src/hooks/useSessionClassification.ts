import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { LogEntry } from '@/types/helplix';

interface UseSessionClassificationOptions {
  onClassified?: (result: { case_type: string; summary: string; title: string }) => void;
  onError?: (error: string) => void;
}

const MIN_ENTRIES_FOR_CLASSIFICATION = 4; // 2 Q&A pairs minimum

export function useSessionClassification({ onClassified, onError }: UseSessionClassificationOptions = {}) {
  // Track which sessions have been classified to avoid re-classifying
  const classifiedSessions = useRef<Set<string>>(new Set());

  const classifySession = useCallback(async (
    sessionId: string,
    logEntries: LogEntry[],
    language?: string
  ) => {
    // Skip if already classified or not enough entries
    if (classifiedSessions.current.has(sessionId)) {
      console.log('Session already classified:', sessionId);
      return;
    }

    if (logEntries.length < MIN_ENTRIES_FOR_CLASSIFICATION) {
      console.log('Not enough entries for classification:', logEntries.length);
      return;
    }

    // Mark as classified to prevent duplicate calls
    classifiedSessions.current.add(sessionId);

    try {
      console.log('Classifying session:', sessionId, 'with', logEntries.length, 'entries');

      const conversationHistory = logEntries.map(entry => ({
        type: entry.type,
        content: entry.content,
      }));

      const { data, error } = await supabase.functions.invoke('classify-session', {
        body: { 
          sessionId, 
          conversationHistory,
          language,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.classification) {
        console.log('Session classified:', data.classification);
        onClassified?.(data.classification);
      }
    } catch (error) {
      console.error('Failed to classify session:', error);
      // Don't show error to user - classification is a background task
      onError?.(error instanceof Error ? error.message : 'Classification failed');
      // Remove from classified set so it can be retried
      classifiedSessions.current.delete(sessionId);
    }
  }, [onClassified, onError]);

  // Check if classification should be triggered
  const shouldClassify = useCallback((sessionId: string, entryCount: number): boolean => {
    return !classifiedSessions.current.has(sessionId) && entryCount >= MIN_ENTRIES_FOR_CLASSIFICATION;
  }, []);

  // Reset classification tracking (e.g., on new session)
  const reset = useCallback(() => {
    classifiedSessions.current.clear();
  }, []);

  return {
    classifySession,
    shouldClassify,
    reset,
  };
}
