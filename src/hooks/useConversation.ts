import { useState, useCallback, useEffect, useMemo } from 'react';
import type { CooperSettings, LogEntry, ConversationStatus } from '@/types/cooper';
import { useRealtimeVoice } from './useRealtimeVoice';
import { useCooperChat } from './useCooperChat';
import { useSession } from './useSession';
import { toast } from 'sonner';

const INITIAL_QUESTION = "Hello! I'm Cooper, your legal documentation assistant. Before we begin, what language would you prefer to communicate in?";

interface UseConversationOptions {
  settings: CooperSettings;
}

export function useConversation({ settings }: UseConversationOptions) {
  // Local state
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(INITIAL_QUESTION);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);

  // Voice service
  const voice = useRealtimeVoice();

  // Chat service
  const chat = useCooperChat({
    settings,
    onError: (error) => toast.error(error),
  });

  // Session persistence
  const session = useSession({
    onError: (error) => toast.error(error),
  });

  // Derived status - memoized to prevent recalculation
  const status: ConversationStatus = useMemo(() => {
    if (voice.isRecording) return 'listening';
    if (voice.isTranscribing) return 'processing';
    if (chat.isLoading) return 'thinking';
    if (voice.isSpeaking) return 'speaking';
    return 'idle';
  }, [voice.isRecording, voice.isTranscribing, chat.isLoading, voice.isSpeaking]);

  const isBusy = useMemo(() => status !== 'idle', [status]);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      if (session.sessions.length > 0 && !session.currentSessionId) {
        const latestSession = session.sessions[0];
        session.setCurrentSessionId(latestSession.id);
        const entries = await session.loadLogEntries(latestSession.id);
        if (entries.length > 0) {
          setLogEntries(entries);
          setIsFirstInteraction(false);
          const lastQuestion = [...entries].reverse().find(e => e.type === 'question');
          if (lastQuestion) {
            setCurrentQuestion(lastQuestion.content);
          }
        }
      }
    };
    initSession();
  }, [session.sessions, session.currentSessionId]);

  // Sync language to session
  useEffect(() => {
    if (session.currentSessionId && chat.detectedLanguage) {
      session.updateSession(session.currentSessionId, { language: chat.detectedLanguage });
    }
  }, [session.currentSessionId, chat.detectedLanguage]);

  // Core action: process user response
  const processResponse = useCallback(async (text: string) => {
    let sessionId = session.currentSessionId;
    if (!sessionId) {
      try {
        sessionId = await session.createSession();
      } catch {
        return;
      }
    }

    // Save entries to DB
    const [savedQuestion, savedAnswer] = await Promise.all([
      session.addLogEntry(sessionId, { type: 'question', content: currentQuestion }),
      session.addLogEntry(sessionId, { type: 'answer', content: text }),
    ]);

    if (savedQuestion && savedAnswer) {
      setLogEntries(prev => [...prev, savedQuestion, savedAnswer]);
    }

    try {
      const nextQuestion = await chat.sendMessage(text);
      setCurrentQuestion(nextQuestion);
      setIsFirstInteraction(false);

      if (settings.autoplaySpeech && settings.audioEnabled) {
        voice.speak(nextQuestion).catch(console.error);
      }
    } catch (error) {
      console.error('AI response error:', error);
    }
  }, [session.currentSessionId, currentQuestion, settings.autoplaySpeech]);

  // Actions
  const startRecording = useCallback(async () => {
    try {
      voice.stopSpeaking();
      await voice.startRecording();
    } catch {
      toast.error('Could not access microphone');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    // Optimistic UI: Show placeholder immediately
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticEntry: LogEntry = {
      id: optimisticId,
      type: 'answer',
      content: '...',
      timestamp: new Date(),
    };
    setLogEntries(prev => [...prev, optimisticEntry]);

    try {
      const text = await voice.stopRecording();
      
      // Remove optimistic entry
      setLogEntries(prev => prev.filter(e => e.id !== optimisticId));
      
      if (!text.trim()) {
        toast.error('No speech detected');
        return;
      }
      await processResponse(text);
    } catch {
      // Remove optimistic entry on error
      setLogEntries(prev => prev.filter(e => e.id !== optimisticId));
      toast.error('Failed to process recording');
    }
  }, [processResponse]);

  const submitText = useCallback(async (text: string) => {
    await processResponse(text);
  }, [processResponse]);

  const replayQuestion = useCallback(() => {
    if (currentQuestion && !voice.isSpeaking) {
      voice.speak(currentQuestion).catch(console.error);
    }
  }, [currentQuestion, voice.isSpeaking]);

  const startNewSession = useCallback(async () => {
    try {
      await session.createSession();
      setLogEntries([]);
      setCurrentQuestion(INITIAL_QUESTION);
      setIsFirstInteraction(true);
      chat.resetConversation();
      toast.success('New session started');

      if (settings.autoplaySpeech && settings.audioEnabled) {
        voice.speak(INITIAL_QUESTION).catch(console.error);
      }
    } catch {
      console.error('Failed to start new session');
    }
  }, [settings.autoplaySpeech]);

  // Speak initial question on first load
  useEffect(() => {
    if (settings.autoplaySpeech && settings.audioEnabled && isFirstInteraction && logEntries.length === 0) {
      voice.speak(currentQuestion).catch(console.error);
    }
  }, []);

  return {
    // State (read-only)
    status,
    isBusy,
    currentQuestion,
    isFirstInteraction,
    logEntries,
    audioLevel: voice.audioLevel,

    // Actions
    startRecording,
    stopRecording,
    submitText,
    replayQuestion,
    startNewSession,

    // Pass-through for Report
    speak: voice.speak,
  };
}
