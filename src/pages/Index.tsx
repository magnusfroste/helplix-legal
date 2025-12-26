import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { BottomNavigation, type NavigationTab } from '@/components/cooper/BottomNavigation';
import { DictaphoneScreen } from '@/components/cooper/DictaphoneScreen';
import { LogScreen } from '@/components/cooper/LogScreen';
import { ReportScreen } from '@/components/cooper/ReportScreen';
import { SettingsScreen } from '@/components/cooper/SettingsScreen';
import { useAuth } from '@/hooks/useAuth';
import { 
  DEFAULT_SETTINGS, 
  type CooperSettings, 
  COUNTRIES,
  getSystemPromptForCountry 
} from '@/types/cooper';
import { useConversation } from '@/hooks/useConversation';

const SETTINGS_STORAGE_KEY = 'cooper-settings';

function loadSettings(): CooperSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Backward compatibility: migrate audioEnabled to ttsEnabled and sttEnabled
      if ('audioEnabled' in parsed) {
        parsed.ttsEnabled = parsed.audioEnabled;
        parsed.sttEnabled = parsed.audioEnabled;
        delete parsed.audioEnabled;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: CooperSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export default function Index() {
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dictaphone');
  const [settings, setSettings] = useState<CooperSettings>(DEFAULT_SETTINGS);
  
  const auth = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        navigate('/auth', { replace: true });
      } else if (auth.user) {
        // Initialize settings with user's country
        setSettings(prev => ({
          ...loadSettings(),
          country: auth.user!.country,
          systemPrompt: getSystemPromptForCountry(auth.user!.country),
        }));
        setIsInitialized(true);
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, navigate]);

  // Persist settings changes
  useEffect(() => {
    if (isInitialized) {
      saveSettings(settings);
    }
  }, [settings, isInitialized]);

  const conversation = useConversation({ 
    settings,
    userId: auth.user?.id,
  });

  const handleLogout = async () => {
    await auth.logout();
    navigate('/auth', { replace: true });
  };

  // Show loading spinner while initializing
  if (auth.isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'dictaphone':
        return (
          <DictaphoneScreen
            status={conversation.status}
            currentQuestion={conversation.currentQuestion}
            isFirstInteraction={conversation.isFirstInteraction}
            onStartRecording={conversation.startRecording}
            onStopRecording={conversation.stopRecording}
            onTextSubmit={conversation.submitText}
            onReplay={conversation.replayQuestion}
            buttonSize={settings.buttonSize}
            audioLevel={conversation.audioLevel}
            country={settings.country}
            showRealtimeTranscription={settings.showRealtimeTranscription && settings.sttEnabled}
            realtimeTranscriptionText={conversation.realtimeTranscriptionText || ''}
          />
        );
      case 'log':
        return <LogScreen entries={conversation.logEntries} country={settings.country} />;
      case 'report':
        return (
          <ReportScreen 
            entries={conversation.logEntries}
            sessionId={conversation.currentSessionId}
            userId={auth.user?.id}
            country={settings.country}
            language={settings.country ? COUNTRIES.find(c => c.code === settings.country)?.language : undefined}
            onPlayReport={(text) => conversation.speak(text).catch(console.error)}
            onStopReport={conversation.stopSpeaking}
            isPlaying={conversation.isSpeaking}
          />
        );
      case 'settings':
        return (
          <SettingsScreen 
            settings={settings} 
            onSettingsChange={setSettings}
            onStartNewSession={conversation.startNewSession}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <main className="flex-1 max-w-lg mx-auto w-full overflow-hidden pb-20">
        {renderScreen()}
      </main>
      
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        country={settings.country}
      />
    </div>
  );
}