import { useState, useCallback, useEffect } from 'react';
import type { LogEntry, CooperSettings } from '@/types/helplix';
import { COUNTRIES } from '@/types/helplix';
import { useSession } from './useSession';
import { useSessionClassification } from './useSessionClassification';

function getInitialQuestion(settings: CooperSettings): string {
  if (settings.country) {
    const country = COUNTRIES.find(c => c.code === settings.country);
    if (country) {
      return country.greeting;
    }
  }
  return "Hello! I'm Helplix, your legal assistant. Can you tell me what happened?";
}

interface UseLogEntriesOptions {
  settings: CooperSettings;
  userId?: string;
  onError?: (error: string) => void;
}

export function useLogEntries({ settings, userId, onError }: UseLogEntriesOptions) {
  const initialQuestion = getInitialQuestion(settings);
  
  // Local state
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [sessionLanguage, setSessionLanguage] = useState<string | undefined>();
  
  // Session persistence
  const session = useSession({
    userId,
    onError,
  });

  // Session classification (AI-driven)
  const classification = useSessionClassification({
    onClassified: () => {
      // Refresh sessions list when classification completes
      session.loadSessions();
    },
  });

  // Update current question when country/initialQuestion changes
  useEffect(() => {
    if (isFirstInteraction && logEntries.length === 0 && settings.country) {
      setCurrentQuestion(initialQuestion);
    }
  }, [initialQuestion, settings.country, isFirstInteraction, logEntries.length]);

  // Load most recent ACTIVE session on mount (not completed or archived)
  useEffect(() => {
    const loadLastActiveSession = async () => {
      if (userId && session.sessions.length > 0 && !session.currentSessionId) {
        console.log('Loading last active session, found', session.sessions.length, 'sessions');
        
        // Find the most recent active session
        const activeSession = session.getActiveSession();
        
        if (activeSession) {
          session.setCurrentSessionId(activeSession.id);
          
          const entries = await session.loadLogEntries(activeSession.id);
          console.log('Loaded', entries.length, 'log entries from session', activeSession.id);
          if (entries.length > 0) {
            setLogEntries(entries);
            // Set the last question from AI as current question
            const lastAIQuestion = [...entries].reverse().find(e => e.type === 'question');
            if (lastAIQuestion) {
              setCurrentQuestion(lastAIQuestion.content);
              setIsFirstInteraction(false);
            }
          }
        } else {
          // No active session found, create a new one
          console.log('No active session found, creating new one');
          await session.createSession();
        }
      }
    };
    loadLastActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, session.sessions.length, session.currentSessionId]);

  // Add a question-answer pair to log entries
  const addQuestionAndAnswer = useCallback(async (
    question: string,
    answer: string
  ): Promise<{ savedQuestion: LogEntry | null; savedAnswer: LogEntry | null }> => {
    let sessionId = session.currentSessionId;
    
    if (!sessionId) {
      try {
        console.log('Creating new session for userId:', userId);
        sessionId = await session.createSession();
        console.log('Session created:', sessionId);
      } catch (error) {
        console.error('Failed to create session:', error);
        onError?.('Could not create session. Please try logging in again.');
        return { savedQuestion: null, savedAnswer: null };
      }
    }

    // Save entries to DB
    const [savedQuestion, savedAnswer] = await Promise.all([
      session.addLogEntry(sessionId, { type: 'question', content: question }),
      session.addLogEntry(sessionId, { type: 'answer', content: answer }),
    ]);

    if (savedQuestion && savedAnswer) {
      const newEntries = [...logEntries, savedQuestion, savedAnswer];
      setLogEntries(newEntries);
      
      // Trigger classification after enough entries (runs in background)
      if (classification.shouldClassify(sessionId, newEntries.length)) {
        classification.classifySession(sessionId, newEntries, sessionLanguage);
      }
    }

    return { savedQuestion, savedAnswer };
  }, [session, userId, onError, logEntries, classification, sessionLanguage]);

  // Update the current question
  const updateCurrentQuestion = useCallback((question: string) => {
    setCurrentQuestion(question);
    setIsFirstInteraction(false);
  }, []);

  // Add an optimistic entry (for UI feedback during recording)
  const addOptimisticEntry = useCallback((): string => {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticEntry: LogEntry = {
      id: optimisticId,
      type: 'answer',
      content: '...',
      timestamp: new Date(),
    };
    setLogEntries(prev => [...prev, optimisticEntry]);
    return optimisticId;
  }, []);

  // Remove an optimistic entry
  const removeOptimisticEntry = useCallback((id: string) => {
    setLogEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  // Start a new session (simple create without completing current)
  const startNewSession = useCallback(async () => {
    await session.createSession();
    setLogEntries([]);
    setCurrentQuestion(initialQuestion);
    setIsFirstInteraction(true);
    classification.reset(); // Reset classification tracking for new session
  }, [session, initialQuestion, classification]);

  // Complete current session and start a new one
  const completeCurrentAndStartNew = useCallback(async () => {
    // If there's a current session with content, mark it as completed
    if (session.currentSessionId && logEntries.length > 0) {
      await session.completeSession(session.currentSessionId);
    }
    // Create a new session
    await session.createSession();
    setLogEntries([]);
    setCurrentQuestion(initialQuestion);
    setIsFirstInteraction(true);
    classification.reset();
  }, [session, logEntries.length, initialQuestion, classification]);

  // Delete current session and its log entries
  const deleteCurrentSession = useCallback(async () => {
    if (session.currentSessionId) {
      await session.deleteSession(session.currentSessionId);
      // Create a new session immediately
      await session.createSession();
      setLogEntries([]);
      setCurrentQuestion(initialQuestion);
      setIsFirstInteraction(true);
    }
  }, [session, initialQuestion]);

  // Sync language to session
  const updateSessionLanguage = useCallback((language: string) => {
    setSessionLanguage(language);
    if (session.currentSessionId) {
      session.updateSession(session.currentSessionId, { language });
    }
  }, [session]);

  // Import entries from file
  const importEntries = useCallback((entries: LogEntry[]) => {
    setLogEntries(entries);
    // Set last question as current if exists
    const lastQuestion = [...entries].reverse().find(e => e.type === 'question');
    if (lastQuestion) {
      setCurrentQuestion(lastQuestion.content);
      setIsFirstInteraction(false);
    }
  }, []);

  // Resume a session by loading its entries
  const resumeSession = useCallback(async (sessionId: string) => {
    const entries = await session.resumeSession(sessionId);
    if (entries.length > 0) {
      setLogEntries(entries);
      const lastAIQuestion = [...entries].reverse().find(e => e.type === 'question');
      if (lastAIQuestion) {
        setCurrentQuestion(lastAIQuestion.content);
        setIsFirstInteraction(false);
      }
    } else {
      setLogEntries([]);
      setCurrentQuestion(initialQuestion);
      setIsFirstInteraction(true);
    }
  }, [session, initialQuestion]);

  // Archive a session
  const archiveSession = useCallback(async (sessionId: string) => {
    await session.archiveSession(sessionId);
  }, [session]);

  // Delete a specific session (not just current)
  const deleteSession = useCallback(async (sessionId: string) => {
    await session.deleteSession(sessionId);
    // If we deleted the current session, reset state
    if (session.currentSessionId === sessionId) {
      setLogEntries([]);
      setCurrentQuestion(initialQuestion);
      setIsFirstInteraction(true);
    }
  }, [session, initialQuestion]);

  return {
    // State
    logEntries,
    currentQuestion,
    isFirstInteraction,
    currentSessionId: session.currentSessionId,
    sessions: session.getSessionsWithMetadata(),
    isLoadingSessions: session.isLoading,
    
    // Actions
    addQuestionAndAnswer,
    updateCurrentQuestion,
    addOptimisticEntry,
    removeOptimisticEntry,
    startNewSession,
    completeCurrentAndStartNew,
    deleteCurrentSession,
    updateSessionLanguage,
    importEntries,
    resumeSession,
    archiveSession,
    deleteSession,
  };
}
