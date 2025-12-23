import { useState, useEffect } from 'react';
import { BottomNavigation, type NavigationTab } from '@/components/cooper/BottomNavigation';
import { DictaphoneScreen } from '@/components/cooper/DictaphoneScreen';
import { LogScreen } from '@/components/cooper/LogScreen';
import { ReportScreen } from '@/components/cooper/ReportScreen';
import { SettingsScreen } from '@/components/cooper/SettingsScreen';
import { OnboardingScreen } from '@/components/cooper/OnboardingScreen';
import { 
  DEFAULT_SETTINGS, 
  type CooperSettings, 
  type CountryCode,
  COUNTRIES,
  getSystemPromptForCountry 
} from '@/types/cooper';
import { useConversation } from '@/hooks/useConversation';

const SETTINGS_STORAGE_KEY = 'cooper-settings';

function loadSettings(): CooperSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
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
  const [activeTab, setActiveTab] = useState<NavigationTab>('dictaphone');
  const [settings, setSettings] = useState<CooperSettings>(loadSettings);

  // Persist settings changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const conversation = useConversation({ settings });

  const handleToggleAudio = () => {
    setSettings(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  };

  const handleCountrySelect = (countryCode: CountryCode) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setSettings(prev => ({
        ...prev,
        country: countryCode,
        systemPrompt: getSystemPromptForCountry(countryCode),
      }));
    }
  };

  // Show onboarding if no country selected
  if (!settings.country) {
    return <OnboardingScreen onCountrySelect={handleCountrySelect} />;
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
