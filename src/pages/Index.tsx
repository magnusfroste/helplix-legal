import { useState } from 'react';
import { BottomNavigation, type NavigationTab } from '@/components/cooper/BottomNavigation';
import { DictaphoneScreen } from '@/components/cooper/DictaphoneScreen';
import { LogScreen } from '@/components/cooper/LogScreen';
import { ReportScreen } from '@/components/cooper/ReportScreen';
import { SettingsScreen } from '@/components/cooper/SettingsScreen';
import { DEFAULT_SETTINGS, type CooperSettings } from '@/types/cooper';
import { useConversation } from '@/hooks/useConversation';

export default function Index() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dictaphone');
  const [settings, setSettings] = useState<CooperSettings>(DEFAULT_SETTINGS);

  const conversation = useConversation({ settings });

  const handleToggleAudio = () => {
    setSettings(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  };

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
            audioEnabled={settings.audioEnabled}
            onToggleAudio={handleToggleAudio}
          />
        );
      case 'log':
        return <LogScreen entries={conversation.logEntries} />;
      case 'report':
        return (
          <ReportScreen 
            entries={conversation.logEntries}
            onPlayReport={(text) => conversation.speak(text).catch(console.error)}
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
