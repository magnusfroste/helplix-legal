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

  // Update status based on voice hook states
  useEffect(() => {
    if (isRecording) {
      setStatus('listening');
    } else if (isTranscribing) {
      setStatus('processing');
    } else if (isSpeaking) {
      setStatus('speaking');
    }
  }, [isRecording, isTranscribing, isSpeaking]);

  // Speak the initial question on first load if autoplay is enabled
  useEffect(() => {
    if (settings.autoplaySpeech && isFirstInteraction && currentQuestion) {
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
    // Add the question and answer to log
    const questionEntry: LogEntry = {
      id: crypto.randomUUID(),
      type: 'question',
      content: currentQuestion,
      timestamp: new Date(),
    };
    
    const userEntry: LogEntry = {
      id: crypto.randomUUID(),
      type: 'answer',
      content: text,
      timestamp: new Date(),
    };
    
    setLogEntries(prev => [...prev, questionEntry, userEntry]);
    setStatus('thinking');
    
    // TODO: Replace with AI integration
    // For now, simulate AI response
    setTimeout(async () => {
      const nextQuestion = isFirstInteraction 
        ? `Thank you! I'll communicate in that language. Now, can you briefly describe the situation or dispute you need help documenting?`
        : "Thank you for that information. When did this situation first begin? Please give me an approximate date if you can remember.";
      
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
    }, 1000);
  }, [currentQuestion, isFirstInteraction, settings.autoplaySpeech, speak]);

  const handleTextSubmit = useCallback(async (text: string) => {
    await processUserResponse(text);
  }, [processUserResponse]);

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
          />
        );
      case 'log':
        return <LogScreen entries={logEntries} />;
      case 'report':
        return (
          <ReportScreen 
            entries={logEntries}
            onPlayReport={() => toast.info('Audio playback coming soon')}
            onExportPdf={() => toast.info('PDF export coming soon')}
            onShare={() => toast.info('Share feature coming soon')}
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
