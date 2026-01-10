import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RotateCcw, RefreshCw, LogOut, Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  DEFAULT_SETTINGS, 
  COUNTRIES, 
  getSystemPromptForCountry,
  type CooperSettings, 
  type CountryCode 
} from '@/types/helplix';
import { useTranslation } from '@/hooks/useTranslation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface SettingsScreenProps {
  settings: CooperSettings;
  onSettingsChange: (settings: CooperSettings) => void;
  onStartNewSession?: () => void;
  onLogout?: () => void;
  onDeleteConversation?: () => void;
  onCompleteCase?: () => void;
  hasContent?: boolean;
}

export function SettingsScreen({ settings, onSettingsChange, onStartNewSession, onLogout, onDeleteConversation, onCompleteCase, hasContent = false }: SettingsScreenProps) {
  const navigate = useNavigate();
  const t = useTranslation(settings.country);
  const [localSettings, setLocalSettings] = useState<CooperSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [countryChanged, setCountryChanged] = useState(false);
  
  // Check admin status and feature flags
  const { isAdmin } = useAdminAuth();
  const { getFlag } = useFeatureFlags();
  
  // Feature flag checks
  const isRealtimeTranscriptionEnabled = getFlag('realtime_transcription');
  const isTtsEnabled = getFlag('tts_enabled');
  const isSttEnabled = getFlag('stt_enabled');

  const handleChange = <K extends keyof CooperSettings>(
    key: K,
    value: CooperSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    setHasChanges(false);
    toast.success(t.settings.toast.saved);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
    toast.info(t.settings.toast.reset);
  };

  const currentCountry = COUNTRIES.find(c => c.code === localSettings.country);

  const handleCountryChange = (countryCode: CountryCode) => {
    const isNewCountry = countryCode !== settings.country;
    setLocalSettings(prev => ({
      ...prev,
      country: countryCode,
      systemPrompt: getSystemPromptForCountry(countryCode),
    }));
    setHasChanges(true);
    if (isNewCountry) {
      setCountryChanged(true);
    }
  };

  const handleStartNewSession = () => {
    if (onStartNewSession) {
      onStartNewSession();
      setCountryChanged(false);
      toast.success(t.settings.toast.newSession);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <header className="px-4 py-4 border-b border-border">
        <h1 className="text-helplix-2xl font-bold text-foreground">
          {t.settings.title}
        </h1>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          {/* Country Selection */}
          <section className="space-y-4">
            <div>
              <Label className="text-helplix-lg font-semibold">
                {t.settings.country.title}
              </Label>
              <p className="text-helplix-base text-muted-foreground mt-1">
                {currentCountry ? `${currentCountry.flag} ${currentCountry.name}` : t.settings.country.select}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {COUNTRIES.map((country) => (
                <Button
                  key={country.code}
                  variant={localSettings.country === country.code ? 'default' : 'outline'}
                  onClick={() => handleCountryChange(country.code)}
                  className="text-2xl h-14"
                >
                  {country.flag}
                </Button>
              ))}
            </div>

            {countryChanged && onStartNewSession && (
              <Button
                variant="secondary"
                onClick={handleStartNewSession}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.settings.country.startNew} {COUNTRIES.find(c => c.code === localSettings.country)?.name}
              </Button>
            )}
          </section>


          {/* Text Size */}
          <section className="space-y-4">
            <Label className="text-helplix-lg font-semibold">
              {t.settings.textSize.title}
            </Label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <Button
                  key={size}
                  variant={localSettings.textSize === size ? 'default' : 'outline'}
                  onClick={() => handleChange('textSize', size)}
                  className="flex-1 capitalize"
                >
                  {size === 'small' ? t.settings.textSize.small : size === 'medium' ? t.settings.textSize.medium : t.settings.textSize.large}
                </Button>
              ))}
            </div>
          </section>

          {/* Button Size */}
          <section className="space-y-4">
            <Label className="text-helplix-lg font-semibold">
              {t.settings.buttonSize.title}
            </Label>
            <div className="flex gap-2">
              {(['small', 'large'] as const).map((size) => (
                <Button
                  key={size}
                  variant={localSettings.buttonSize === size ? 'default' : 'outline'}
                  onClick={() => handleChange('buttonSize', size)}
                  className="flex-1 capitalize"
                >
                  {size === 'small' ? t.settings.buttonSize.small : t.settings.buttonSize.large}
                </Button>
              ))}
            </div>
          </section>

          {/* Audio Enabled Toggle - only show if TTS feature is enabled */}
          {isTtsEnabled && (
            <section className="flex items-center justify-between">
              <div>
                <Label className="text-helplix-lg font-semibold">
                  {t.settings.tts.title}
                </Label>
                <p className="text-helplix-base text-muted-foreground">
                  {t.settings.tts.description}
                </p>
              </div>
              <Switch
                checked={localSettings.ttsEnabled}
                onCheckedChange={(checked) => handleChange('ttsEnabled', checked)}
              />
            </section>
          )}

          {/* Speech-to-Text Toggle - only show if STT feature is enabled */}
          {isSttEnabled && (
            <section className="flex items-center justify-between">
              <div>
                <Label className="text-helplix-lg font-semibold">
                  {t.settings.stt.title}
                </Label>
                <p className="text-helplix-base text-muted-foreground">
                  {t.settings.stt.description}
                </p>
              </div>
              <Switch
                checked={localSettings.sttEnabled}
                onCheckedChange={(checked) => handleChange('sttEnabled', checked)}
              />
            </section>
          )}

          {/* Realtime Transcription - only show if feature flag is enabled AND STT is enabled */}
          {isRealtimeTranscriptionEnabled && isSttEnabled && (
            <section className="flex items-center justify-between">
              <div>
                <Label className="text-helplix-lg font-semibold">
                  {t.settings.realtimeTranscription.title}
                </Label>
                <p className="text-helplix-base text-muted-foreground">
                  {t.settings.realtimeTranscription.description}
                </p>
              </div>
              <Switch
                checked={localSettings.showRealtimeTranscription ?? false}
                onCheckedChange={(checked) => handleChange('showRealtimeTranscription', checked)}
                disabled={!localSettings.sttEnabled}
              />
            </section>
          )}

          {/* Autoplay Speech - only show if TTS feature is enabled */}
          {isTtsEnabled && (
            <section className="flex items-center justify-between">
              <div>
                <Label className="text-helplix-lg font-semibold">
                  {t.settings.autoplay.title}
                </Label>
                <p className="text-helplix-base text-muted-foreground">
                  {t.settings.autoplay.description}
                </p>
              </div>
              <Switch
                checked={localSettings.autoplaySpeech}
                onCheckedChange={(checked) => handleChange('autoplaySpeech', checked)}
                disabled={!localSettings.ttsEnabled}
              />
            </section>
          )}

          {/* Case Management Section */}
          <section className="pt-4 border-t border-border space-y-3">
            <Label className="text-helplix-lg font-semibold block mb-3">
              Ärendehantering
            </Label>
            
            {/* Complete Case - Primary action */}
            {onCompleteCase && hasContent && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="default"
                    className="w-full"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t.settings.completeCase.button}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.settings.completeCase.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.settings.completeCase.description}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.settings.completeCase.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onCompleteCase();
                        toast.success(t.settings.toast.caseCompleted);
                      }}
                    >
                      {t.settings.completeCase.confirm}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Delete Conversation - Destructive action */}
            {onDeleteConversation && hasContent && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.settings.deleteConversation.button}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.settings.deleteConversation.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.settings.deleteConversation.description}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.settings.deleteConversation.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDeleteConversation();
                        toast.success(t.settings.toast.conversationDeleted);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t.settings.deleteConversation.confirm}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Show message when no content */}
            {!hasContent && (
              <p className="text-helplix-sm text-muted-foreground text-center py-2">
                Inget pågående ärende
              </p>
            )}
          </section>


          {/* Admin Panel Link - Only visible for admins */}
          {isAdmin && (
            <section className="pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </section>
          )}

          {/* Logout */}
          {onLogout && (
            <section className="pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={onLogout}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.settings.logout}
              </Button>
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pb-8">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t.settings.reset}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {t.settings.save}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
