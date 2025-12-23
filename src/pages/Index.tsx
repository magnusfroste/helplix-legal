import { useState, useCallback, useEffect } from 'react';
import { BottomNavigation, type NavigationTab } from '@/components/cooper/BottomNavigation';
import { DictaphoneScreen } from '@/components/cooper/DictaphoneScreen';
import { LogScreen } from '@/components/cooper/LogScreen';
import { ReportScreen } from '@/components/cooper/ReportScreen';
import { SettingsScreen } from '@/components/cooper/SettingsScreen';
import { 
  DEFAULT_SETTINGS, 
  type CooperSettings, 
  type LogEntry,
  type ConversationStatus 
} from '@/types/cooper';
import { useVoice } from '@/hooks/useVoice';
import { useCooperChat } from '@/hooks/useCooperChat';
import { useSession } from '@/hooks/useSession';
import { toast } from 'sonner';

const INITIAL_QUESTION = "Hello! I'm Cooper, your legal documentation assistant. Before we begin, what language would you prefer to communicate in?";

export default function Index() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dictaphone');
  const [settings, setSettings] = useState<CooperSettings>(DEFAULT_SETTINGS);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(INITIAL_QUESTION);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);

  const { 
    isRecording, 
    isTranscribing, 
    isSpeaking, 
    startRecording, 
    stopRecording, 
    speak, 
    stopSpeaking 
  } = useVoice();

  const { 
    isLoading: isThinking, 
    sendMessage,
    resetConversation,
    detectedLanguage
  } = useCooperChat({
    settings,
    onError: (error) => toast.error(error),
  });

  const {
    currentSessionId,
    setCurrentSessionId,
    sessions,
    createSession,
    loadLogEntries,
    addLogEntry,
    updateSession,
  } = useSession({
    onError: (error) => toast.error(error),
  });

  // Create a new session on first interaction or load the latest one
  useEffect(() => {
    const initSession = async () => {
      if (sessions.length > 0 && !currentSessionId) {
        // Load the most recent session
        const latestSession = sessions[0];
        setCurrentSessionId(latestSession.id);
        const entries = await loadLogEntries(latestSession.id);
        if (entries.length > 0) {
          setLogEntries(entries);
          setIsFirstInteraction(false);
          // Get the last question from the entries
          const lastQuestion = [...entries].reverse().find(e => e.type === 'question');
          if (lastQuestion) {
            setCurrentQuestion(lastQuestion.content);
          }
        }
      }
    };
    initSession();
  }, [sessions, currentSessionId, setCurrentSessionId, loadLogEntries]);

  // Update session language when detected
  useEffect(() => {
    if (currentSessionId && detectedLanguage) {
      updateSession(currentSessionId, { language: detectedLanguage });
    }
  }, [currentSessionId, detectedLanguage, updateSession]);

  // Update status based on voice hook states and AI state
  useEffect(() => {
    if (isRecording) {
      setStatus('listening');
    } else if (isTranscribing) {
      setStatus('processing');
    } else if (isThinking) {
      setStatus('thinking');
    } else if (isSpeaking) {
      setStatus('speaking');
    } else {
      setStatus('idle');
    }
  }, [isRecording, isTranscribing, isThinking, isSpeaking]);

  // Speak the initial question on first load if autoplay is enabled
  useEffect(() => {
    if (settings.autoplaySpeech && isFirstInteraction && currentQuestion && logEntries.length === 0) {
      speak(currentQuestion).catch(console.error);
    }
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      stopSpeaking(); // Stop any current speech
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Could not access microphone');
    }
  }, [startRecording, stopSpeaking]);

  const handleStopRecording = useCallback(async () => {
    try {
      const transcribedText = await stopRecording();
      
      if (!transcribedText.trim()) {
        toast.error('No speech detected. Please try again.');
        setStatus('idle');
        return;
      }

      // Process the transcribed text
      await processUserResponse(transcribedText);
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to process recording');
      setStatus('idle');
    }
  }, [stopRecording]);

  const processUserResponse = useCallback(async (text: string) => {
    // Ensure we have a session
    let sessionId = currentSessionId;
    if (!sessionId) {
      try {
        sessionId = await createSession();
      } catch (error) {
        console.error('Failed to create session:', error);
        return;
      }
    }

    // Save question to database
    const savedQuestion = await addLogEntry(sessionId, {
      type: 'question',
      content: currentQuestion,
    });

    // Save answer to database
    const savedAnswer = await addLogEntry(sessionId, {
      type: 'answer',
      content: text,
    });

    // Update local state
    if (savedQuestion && savedAnswer) {
      setLogEntries(prev => [...prev, savedQuestion, savedAnswer]);
    }
    
    setStatus('thinking');
    
    try {
      // Get AI response
      const nextQuestion = await sendMessage(text);
      
      setCurrentQuestion(nextQuestion);
      setIsFirstInteraction(false);
      setStatus('idle');
      
      // Speak the next question if autoplay is enabled
      if (settings.autoplaySpeech) {
        try {
          await speak(nextQuestion);
        } catch (error) {
          console.error('TTS error:', error);
        }
      }
    } catch (error) {
      console.error('AI response error:', error);
      setStatus('idle');
    }
  }, [currentSessionId, currentQuestion, createSession, addLogEntry, settings.autoplaySpeech, speak, sendMessage]);

  const handleTextSubmit = useCallback(async (text: string) => {
    await processUserResponse(text);
  }, [processUserResponse]);

  const handleNewSession = useCallback(async () => {
    try {
      await createSession();
      setLogEntries([]);
      setCurrentQuestion(INITIAL_QUESTION);
      setIsFirstInteraction(true);
      resetConversation();
      toast.success('New session started');
      
      if (settings.autoplaySpeech) {
        speak(INITIAL_QUESTION).catch(console.error);
      }
    } catch (error) {
      console.error('Failed to start new session:', error);
    }
  }, [createSession, resetConversation, settings.autoplaySpeech, speak]);

  const handleReplayQuestion = useCallback(() => {
    if (currentQuestion && !isSpeaking) {
      speak(currentQuestion).catch(console.error);
    }
  }, [currentQuestion, isSpeaking, speak]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'dictaphone':
        return (
          <DictaphoneScreen
            status={status}
            currentQuestion={currentQuestion}
            isFirstInteraction={isFirstInteraction}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onTextSubmit={handleTextSubmit}
            onReplay={handleReplayQuestion}
            buttonSize={settings.buttonSize}
          />
        );
      case 'log':
        return <LogScreen entries={logEntries} />;
      case 'report':
        return (
          <ReportScreen 
            entries={logEntries}
            onPlayReport={(text) => speak(text).catch(console.error)}
          />
        );
      case 'settings':
        return (
          <SettingsScreen 
            settings={settings} 
            onSettingsChange={setSettings} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-lg mx-auto">
        {renderScreen()}
      </main>
      
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
}
