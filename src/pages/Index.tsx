import { useState, useCallback } from 'react';
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
import { toast } from 'sonner';

const INITIAL_QUESTION = "Hello! I'm Cooper, your legal documentation assistant. Before we begin, what language would you prefer to communicate in?";

export default function Index() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dictaphone');
  const [settings, setSettings] = useState<CooperSettings>(DEFAULT_SETTINGS);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(INITIAL_QUESTION);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);

  // Recording handlers (mock for now - will integrate with speech-to-text)
  const handleStartRecording = useCallback(() => {
    setStatus('listening');
    toast.info('Recording started...');
  }, []);

  const handleStopRecording = useCallback(() => {
    setStatus('processing');
    toast.info('Processing your response...');
    
    // Simulate processing delay
    setTimeout(() => {
      // Add mock entries for demonstration
      const userEntry: LogEntry = {
        id: crypto.randomUUID(),
        type: 'answer',
        content: '[Voice response recorded]',
        timestamp: new Date(),
      };
      
      setLogEntries(prev => [...prev, 
        { 
          id: crypto.randomUUID(), 
          type: 'question', 
          content: currentQuestion, 
          timestamp: new Date() 
        },
        userEntry
      ]);
      
      setStatus('thinking');
      
      // Simulate AI response
      setTimeout(() => {
        setCurrentQuestion("Thank you. Now, can you briefly describe the situation or dispute you need help documenting?");
        setIsFirstInteraction(false);
        setStatus('idle');
      }, 1500);
    }, 1000);
  }, [currentQuestion]);

  const handleTextSubmit = useCallback((text: string) => {
    // Add the text response to log
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
    
    // Simulate AI response
    setTimeout(() => {
      setCurrentQuestion("Thank you for that information. When did this situation first begin? Please give me an approximate date if you can remember.");
      setIsFirstInteraction(false);
      setStatus('idle');
    }, 1500);
  }, [currentQuestion]);

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
