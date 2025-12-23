import { useState, useCallback, useEffect, useMemo } from 'react';
import type { CooperSettings, LogEntry, ConversationStatus } from '@/types/cooper';
import { COUNTRIES } from '@/types/cooper';
import type { ConversationPhase, PhaseProgress } from '@/types/phases';
import { shouldTransitionPhase, getNextPhase } from '@/types/phases';
import type { InformationTracker } from '@/types/information-tracking';
import { initializeTracker, updateTracker } from '@/types/information-tracking';
import type { QualityMetrics, AnswerQualityAssessment } from '@/types/quality-control';
import { assessAnswerQuality, generateFollowUpQuestions, shouldAskFollowUpNow, initializeQualityMetrics, updateQualityMetrics } from '@/types/quality-control';
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
  
  // Phase tracking state
  const [phaseProgress, setPhaseProgress] = useState<PhaseProgress>({
    currentPhase: 'opening',
    questionsInPhase: 0,
    coveredTopics: new Set<string>(),
    missingInfo: [],
    phaseHistory: ['opening']
  });
  
  // Information tracking state
  const [infoTracker, setInfoTracker] = useState<InformationTracker>(() => initializeTracker());
  
  // Quality control state
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>(() => initializeQualityMetrics());
  const [consecutiveFollowUps, setConsecutiveFollowUps] = useState(0);
  const [lastAssessment, setLastAssessment] = useState<AnswerQualityAssessment | null>(null);

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
    currentPhase: phaseProgress.currentPhase,
    informationGaps: infoTracker.gaps,
    completeness: infoTracker.completeness,
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
        console.log('Loading last session, found', session.sessions.length, 'sessions');
        const lastSession = session.sessions[0]; // Already sorted by updated_at desc
        session.setCurrentSessionId(lastSession.id);
        
        const entries = await session.loadLogEntries(lastSession.id);
        console.log('Loaded', entries.length, 'log entries from session', lastSession.id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, session.sessions.length, session.currentSessionId]);

  // Sync language to session
  useEffect(() => {
    if (session.currentSessionId && chat.detectedLanguage) {
      session.updateSession(session.currentSessionId, { language: chat.detectedLanguage });
    }
  }, [session.currentSessionId, chat.detectedLanguage]);

  // Core action: process user response
  const processResponse = useCallback(async (text: string) => {
    console.log('processResponse called with:', { text, userId, currentSessionId: session.currentSessionId, phase: phaseProgress.currentPhase });
    
    let sessionId = session.currentSessionId;
    if (!sessionId) {
      try {
        console.log('Creating new session for userId:', userId);
        sessionId = await session.createSession();
        console.log('Session created:', sessionId);
      } catch (error) {
        console.error('Failed to create session:', error);
        toast.error('Could not create session. Please try logging in again.');
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

    // Assess answer quality
    const qualityAssessment = assessAnswerQuality(text, phaseProgress.currentPhase, currentQuestion);
    setLastAssessment(qualityAssessment);
    
    console.log('Answer quality:', qualityAssessment.quality, 'Score:', qualityAssessment.score, 'Issues:', qualityAssessment.issues.length);
    
    // Update information tracker with user's response
    setInfoTracker(prev => updateTracker(prev, phaseProgress.currentPhase, text));
    
    // Update phase progress - increment questions in current phase
    setPhaseProgress(prev => ({
      ...prev,
      questionsInPhase: prev.questionsInPhase + 1
    }));

    // Check if we should transition to next phase
    const shouldTransition = shouldTransitionPhase(
      phaseProgress,
      text.length,
      text.length > 50 // Simple heuristic: longer responses likely contain new info
    );

    let nextPhase = phaseProgress.currentPhase;
    if (shouldTransition) {
      const newPhase = getNextPhase(phaseProgress.currentPhase);
      if (newPhase) {
        console.log(`Phase transition: ${phaseProgress.currentPhase} -> ${newPhase}`);
        nextPhase = newPhase;
        setPhaseProgress(prev => ({
          ...prev,
          currentPhase: newPhase,
          questionsInPhase: 0,
          phaseHistory: [...prev.phaseHistory, newPhase]
        }));
      }
    }

    try {
      // Check if we should ask a follow-up question immediately
      const shouldFollowUp = shouldAskFollowUpNow(qualityAssessment, consecutiveFollowUps);
      
      let nextQuestion: string;
      
      if (shouldFollowUp) {
        // Generate and ask follow-up question
        const followUps = generateFollowUpQuestions(qualityAssessment, phaseProgress.currentPhase, text);
        
        if (followUps.length > 0) {
          console.log('Asking follow-up question:', followUps[0].reason);
          nextQuestion = followUps[0].question;
          setConsecutiveFollowUps(prev => prev + 1);
          
          // Update quality metrics
          setQualityMetrics(prev => updateQualityMetrics(prev, qualityAssessment, true));
        } else {
          // No follow-up available, continue normally
          nextQuestion = await chat.sendMessage(text, nextPhase);
          setConsecutiveFollowUps(0);
          setQualityMetrics(prev => updateQualityMetrics(prev, qualityAssessment, false));
        }
      } else {
        // Continue with normal AI response
        nextQuestion = await chat.sendMessage(text, nextPhase);
        setConsecutiveFollowUps(0);
        setQualityMetrics(prev => updateQualityMetrics(prev, qualityAssessment, false));
      }
      
      setCurrentQuestion(nextQuestion);
      setIsFirstInteraction(false);

      if (settings.autoplaySpeech && settings.ttsEnabled) {
        voice.speak(nextQuestion).catch(console.error);
      }
    } catch (error) {
      console.error('AI response error:', error);
    }
  }, [userId, session.currentSessionId, session.createSession, session.addLogEntry, currentQuestion, settings.autoplaySpeech, settings.ttsEnabled, chat, voice, phaseProgress]);

  // Actions
  const startRecording = useCallback(async () => {
    if (!settings.sttEnabled) {
      toast.error('Speech-to-text is disabled');
      return;
    }
    try {
      voice.stopSpeaking();
      await voice.startRecording();
    } catch {
      toast.error('Could not access microphone');
    }
  }, [settings.sttEnabled]);

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
    if (!settings.ttsEnabled) {
      toast.error('Text-to-speech is disabled');
      return;
    }
    if (currentQuestion && !voice.isSpeaking) {
      voice.speak(currentQuestion).catch(console.error);
    }
  }, [currentQuestion, voice.isSpeaking, settings.ttsEnabled]);

  const startNewSession = useCallback(async () => {
    try {
      await session.createSession();
      setLogEntries([]);
      setCurrentQuestion(initialQuestion);
      setIsFirstInteraction(true);
      chat.resetConversation();
      
      // Reset phase tracking to opening phase
      setPhaseProgress({
        currentPhase: 'opening',
        questionsInPhase: 0,
        coveredTopics: new Set<string>(),
        missingInfo: [],
        phaseHistory: ['opening']
      });
      
      // Reset information tracker
      setInfoTracker(initializeTracker());
      
      // Reset quality metrics
      setQualityMetrics(initializeQualityMetrics());
      setConsecutiveFollowUps(0);
      setLastAssessment(null);
      
      toast.success('New session started');

      if (settings.autoplaySpeech && settings.ttsEnabled) {
        voice.speak(initialQuestion).catch(console.error);
      }
    } catch {
      console.error('Failed to start new session');
    }
  }, [settings.autoplaySpeech, initialQuestion]);


  return {
    // State (read-only)
    status,
    isBusy,
    currentQuestion,
    isFirstInteraction,
    logEntries,
    audioLevel: voice.audioLevel,
    currentSessionId: session.currentSessionId,
    phaseProgress, // Phase tracking state
    infoTracker, // Information tracking state
    qualityMetrics, // Quality metrics
    lastAssessment, // Last quality assessment

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
