import { useState, useEffect, useCallback } from 'react';
import { 
  DEFAULT_SETTINGS, 
  type CooperSettings, 
  getSystemPromptForCountry,
  type CountryCode 
} from '@/types/helplix';

const SETTINGS_STORAGE_KEY = 'helplix-settings';

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

interface UseSettingsOptions {
  userCountry?: CountryCode;
}

export function useSettings({ userCountry }: UseSettingsOptions = {}) {
  const [settings, setSettings] = useState<CooperSettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize settings with user's country
  useEffect(() => {
    if (userCountry) {
      const loaded = loadSettings();
      setSettings({
        ...loaded,
        country: userCountry,
        systemPrompt: getSystemPromptForCountry(userCountry),
      });
      setIsInitialized(true);
    }
  }, [userCountry]);

  // Persist settings changes
  useEffect(() => {
    if (isInitialized) {
      saveSettings(settings);
    }
  }, [settings, isInitialized]);

  const updateSettings = useCallback((newSettings: CooperSettings) => {
    setSettings(newSettings);
  }, []);

  const updateSetting = useCallback(<K extends keyof CooperSettings>(
    key: K, 
    value: CooperSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
    settings,
    isInitialized,
    setSettings: updateSettings,
    updateSetting,
  };
}
