import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { BottomNavigation, type NavigationTab } from '@/components/cooper/BottomNavigation';
import { DictaphoneScreen } from '@/components/cooper/DictaphoneScreen';
import { LogScreen } from '@/components/cooper/LogScreen';
import { ReportScreen } from '@/components/cooper/ReportScreen';
import { SettingsScreen } from '@/components/cooper/SettingsScreen';
import { OnboardingScreen } from '@/components/cooper/OnboardingScreen';
import { PinScreen } from '@/components/cooper/PinScreen';
import { useAuth } from '@/hooks/useAuth';
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

type AuthFlow = 'select-country' | 'enter-pin' | 'create-pin' | 'confirm-pin' | 'authenticated';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dictaphone');
  const [settings, setSettings] = useState<CooperSettings>(DEFAULT_SETTINGS);
  
  // Auth flow state
  const [authFlow, setAuthFlow] = useState<AuthFlow>('select-country');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [firstPin, setFirstPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isPinLoading, setIsPinLoading] = useState(false);

  const auth = useAuth();

  // Load settings and check auth state on mount
  useEffect(() => {
    const init = async () => {
      setSettings(loadSettings());
      // Wait for auth to load
      if (!auth.isLoading) {
        if (auth.user) {
          setAuthFlow('authenticated');
          // Sync country from user
          setSettings(prev => ({
            ...prev,
            country: auth.user!.country,
            systemPrompt: getSystemPromptForCountry(auth.user!.country),
          }));
        }
        setIsLoading(false);
      }
    };
    init();
  }, [auth.isLoading, auth.user]);

  // Persist settings changes
  useEffect(() => {
    if (authFlow === 'authenticated') {
      saveSettings(settings);
    }
  }, [settings, authFlow]);

  const conversation = useConversation({ 
    settings,
    userId: auth.user?.id,
  });

  const handleToggleAudio = () => {
    setSettings(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  };

  // Country selection handler
  const handleCountrySelect = (countryCode: CountryCode) => {
    setSelectedCountry(countryCode);
    setAuthFlow('enter-pin');
    setPinError('');
  };

  // PIN handlers
  const handlePinSubmit = async (pin: string) => {
    setPinError('');
    setIsPinLoading(true);

    try {
      if (authFlow === 'enter-pin') {
        // Try to login first
        const loginResult = await auth.login(pin);
        
        if (loginResult.success && loginResult.user) {
          // Logged in successfully - use returned user data directly
          setSettings(prev => ({
            ...prev,
            country: loginResult.user!.country,
            systemPrompt: getSystemPromptForCountry(loginResult.user!.country),
          }));
          setAuthFlow('authenticated');
        } else {
          // PIN doesn't exist - create new user
          setFirstPin(pin);
          setAuthFlow('create-pin');
        }
      } else if (authFlow === 'create-pin') {
        // Show message that this is a new PIN
        setFirstPin(pin);
        setAuthFlow('confirm-pin');
      } else if (authFlow === 'confirm-pin') {
        // Confirm PIN matches
        if (pin !== firstPin) {
          setPinError('PIN-koderna matchar inte. Försök igen.');
          setAuthFlow('create-pin');
          setFirstPin('');
          return;
        }

        // Create new user
        const result = await auth.createUser(pin, selectedCountry!);
        
        if (result.success) {
          setSettings(prev => ({
            ...prev,
            country: selectedCountry!,
            systemPrompt: getSystemPromptForCountry(selectedCountry!),
          }));
          setAuthFlow('authenticated');
        } else {
          setPinError(result.error || 'Kunde inte skapa konto');
          setAuthFlow('create-pin');
          setFirstPin('');
        }
      }
    } finally {
      setIsPinLoading(false);
    }
  };

  const handlePinBack = () => {
    if (authFlow === 'confirm-pin') {
      setAuthFlow('create-pin');
      setFirstPin('');
    } else {
      setAuthFlow('select-country');
      setSelectedCountry(null);
    }
    setPinError('');
  };

  const handleLogout = () => {
    auth.logout();
    setAuthFlow('select-country');
    setSelectedCountry(null);
    setSettings(DEFAULT_SETTINGS);
  };

  // Show loading spinner while initializing
  if (isLoading || auth.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Show onboarding if no country selected
  if (authFlow === 'select-country') {
    return <OnboardingScreen onCountrySelect={handleCountrySelect} />;
  }

  // Show PIN screen
  if (authFlow === 'enter-pin' || authFlow === 'create-pin' || authFlow === 'confirm-pin') {
    const country = COUNTRIES.find(c => c.code === selectedCountry);
    const mode = authFlow === 'enter-pin' ? 'login' : authFlow === 'create-pin' ? 'create' : 'confirm';
    
    return (
      <PinScreen
        key={authFlow}
        mode={mode}
        country={country?.name || ''}
        countryFlag={country?.flag || ''}
        onPinSubmit={handlePinSubmit}
        onBack={handlePinBack}
        error={pinError}
        isLoading={isPinLoading}
      />
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
            sessionId={conversation.currentSessionId}
            userId={auth.user?.id}
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
      />
    </div>
  );
}
