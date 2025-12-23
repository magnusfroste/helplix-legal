import { useState, useCallback, useEffect, useMemo } from 'react';
import type { CooperSettings, LogEntry, ConversationStatus } from '@/types/cooper';
import { COUNTRIES } from '@/types/cooper';
import { useRealtimeVoice } from './useRealtimeVoice';
import { useCooperChat } from './useCooperChat';
import { useSession } from './useSession';
import { toast } from 'sonner';

function getInitialQuestion(settings: CooperSettings): string {
  if (settings.country) {
    const country = COUNTRIES.find(c => c.code === settings.country);
    if (country) {
      return country.greeting;
    }
  }
  return "Hello! I'm Cooper, your legal documentation assistant. Can you tell me what happened?";
}

interface UseConversationOptions {
  settings: CooperSettings;
  userId?: string;
}

export function useConversation({ settings, userId }: UseConversationOptions) {
  const initialQuestion = useMemo(() => getInitialQuestion(settings), [settings.country]);
  
  // Local state - initialize with the correct greeting for the selected country
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);

  // Update current question when country/initialQuestion changes
  useEffect(() => {
    if (isFirstInteraction && logEntries.length === 0 && settings.country) {
      setCurrentQuestion(initialQuestion);
    }
  }, [initialQuestion, settings.country]);

  // Voice service
  const voice = useRealtimeVoice();

  // Chat service
  const chat = useCooperChat({
    settings,
    onError: (error) => toast.error(error),
  });

  // Session persistence
  const session = useSession({
    userId,
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

  // Load most recent session on mount if user has sessions
  useEffect(() => {
    const loadLastSession = async () => {
      if (userId && session.sessions.length > 0 && !session.currentSessionId) {
        const lastSession = session.sessions[0]; // Already sorted by updated_at desc
        session.setCurrentSessionId(lastSession.id);
        
        const entries = await session.loadLogEntries(lastSession.id);
        if (entries.length > 0) {
          setLogEntries(entries);
          // Set the last question from AI as current question
          const lastAIQuestion = [...entries].reverse().find(e => e.type === 'question');
          if (lastAIQuestion) {
            setCurrentQuestion(lastAIQuestion.content);
            setIsFirstInteraction(false);
          }
        }
      }
    };
    loadLastSession();
  }, [userId, session.sessions.length]);

  // Sync language to session
  useEffect(() => {
    if (session.currentSessionId && chat.detectedLanguage) {
      session.updateSession(session.currentSessionId, { language: chat.detectedLanguage });
    }
  }, [session.currentSessionId, chat.detectedLanguage]);

  // Core action: process user response
  const processResponse = useCallback(async (text: string) => {
    console.log('processResponse called with:', { text, userId, currentSessionId: session.currentSessionId });
    
    let sessionId = session.currentSessionId;
    if (!sessionId) {
      try {
        console.log('Creating new session for userId:', userId);
        sessionId = await session.createSession();
        console.log('Session created:', sessionId);
      } catch (error) {
        console.error('Failed to create session:', error);
        toast.error('Kunde inte skapa session. Försök logga in igen.');
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
  }, [userId, session.currentSessionId, session.createSession, session.addLogEntry, currentQuestion, settings.autoplaySpeech, settings.audioEnabled, chat, voice]);

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
      setCurrentQuestion(initialQuestion);
      setIsFirstInteraction(true);
      chat.resetConversation();
      toast.success('New session started');

      if (settings.autoplaySpeech && settings.audioEnabled) {
        voice.speak(initialQuestion).catch(console.error);
      }
    } catch {
      console.error('Failed to start new session');
    }
  }, [settings.autoplaySpeech, initialQuestion]);

  // Speak initial question on first load (only when a country is selected)
  useEffect(() => {
    if (settings.country && settings.autoplaySpeech && settings.audioEnabled && isFirstInteraction && logEntries.length === 0) {
      voice.speak(initialQuestion).catch(console.error);
    }
  }, [initialQuestion, settings.country]);

  return {
    // State (read-only)
    status,
    isBusy,
    currentQuestion,
    isFirstInteraction,
    logEntries,
    audioLevel: voice.audioLevel,
    currentSessionId: session.currentSessionId,

    // Actions
    startRecording,
    stopRecording,
    submitText,
    replayQuestion,
    startNewSession,

    // Pass-through for Report
    speak: voice.speak,
    stopSpeaking: voice.stopSpeaking,
    isSpeaking: voice.isSpeaking,
  };
}
