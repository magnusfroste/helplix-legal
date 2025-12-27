import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation, type NavigationTab } from '@/components/helplix/BottomNavigation';
import { DictaphoneScreen } from '@/components/helplix/DictaphoneScreen';
import { LogScreen } from '@/components/helplix/LogScreen';
import { ReportScreen } from '@/components/helplix/ReportScreen';
import { SettingsScreen } from '@/components/helplix/SettingsScreen';
import { DictaphoneSkeleton, LogSkeleton, ReportSkeleton } from '@/components/helplix/skeletons';
import { useAuth } from '@/hooks/useAuth';
import { COUNTRIES } from '@/types/helplix';
import { useConversation } from '@/hooks/useConversation';
import { useSettings } from '@/hooks/useSettings';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export default function Index() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dictaphone');
  
  const auth = useAuth();
  const { settings, setSettings, isInitialized } = useSettings({ 
    userCountry: auth.user?.country 
  });
  const { getFlag } = useFeatureFlags();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate]);

  const conversation = useConversation({ 
    settings,
    userId: auth.user?.id,
  });

  const handleLogout = async () => {
    await auth.logout();
    navigate('/auth', { replace: true });
  };

  // Show skeleton while initializing
  if (auth.isLoading || !isInitialized) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <main className="flex-1 max-w-lg mx-auto w-full overflow-hidden pb-20">
          <DictaphoneSkeleton />
        </main>
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          country={null}
        />
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
            showRealtimeTranscription={getFlag('realtime_transcription') && settings.sttEnabled}
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