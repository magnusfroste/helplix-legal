import { useState } from 'react';
import { Save, RotateCcw, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  DEFAULT_SETTINGS, 
  COUNTRIES, 
  getSystemPromptForCountry,
  type CooperSettings, 
  type CountryCode 
} from '@/types/cooper';

interface SettingsScreenProps {
  settings: CooperSettings;
  onSettingsChange: (settings: CooperSettings) => void;
  onStartNewSession?: () => void;
}

export function SettingsScreen({ settings, onSettingsChange, onStartNewSession }: SettingsScreenProps) {
  const [localSettings, setLocalSettings] = useState<CooperSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [countryChanged, setCountryChanged] = useState(false);

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
    toast.success('Settings saved');
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
    toast.info('Settings reset to defaults');
  };

  const getIntensityLabel = (value: number) => {
    if (value < 30) return 'Few questions (open-ended)';
    if (value < 70) return 'Balanced';
    return 'Many questions (detailed)';
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
      toast.success('New session started with new jurisdiction');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <header className="px-4 py-4 border-b border-border">
        <h1 className="text-cooper-2xl font-bold text-foreground">
          Settings
        </h1>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          {/* Country Selection */}
          <section className="space-y-4">
            <div>
              <Label className="text-cooper-lg font-semibold">
                Country / Legal System
              </Label>
              <p className="text-cooper-base text-muted-foreground mt-1">
                {currentCountry ? `${currentCountry.flag} ${currentCountry.name}` : 'Select a country'}
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
                Start new session with {COUNTRIES.find(c => c.code === localSettings.country)?.name}
              </Button>
            )}
          </section>

          {/* Question Intensity */}
          <section className="space-y-4">
            <div>
              <Label className="text-cooper-lg font-semibold">
                Question Intensity
              </Label>
              <p className="text-cooper-base text-muted-foreground mt-1">
                {getIntensityLabel(localSettings.questionIntensity)}
              </p>
            </div>
            
            <div className="px-2">
              <Slider
                value={[localSettings.questionIntensity]}
                onValueChange={([value]) => handleChange('questionIntensity', value)}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Fewer</span>
                <span>More</span>
              </div>
            </div>
          </section>

          {/* Text Size */}
          <section className="space-y-4">
            <Label className="text-cooper-lg font-semibold">
              Text Size
            </Label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <Button
                  key={size}
                  variant={localSettings.textSize === size ? 'default' : 'outline'}
                  onClick={() => handleChange('textSize', size)}
                  className="flex-1 capitalize"
                >
                  {size}
                </Button>
              ))}
            </div>
          </section>

          {/* Button Size */}
          <section className="space-y-4">
            <Label className="text-cooper-lg font-semibold">
              Speak Button Size
            </Label>
            <div className="flex gap-2">
              {(['small', 'large'] as const).map((size) => (
                <Button
                  key={size}
                  variant={localSettings.buttonSize === size ? 'default' : 'outline'}
                  onClick={() => handleChange('buttonSize', size)}
                  className="flex-1 capitalize"
                >
                  {size}
                </Button>
              ))}
            </div>
          </section>

          {/* Audio Enabled Toggle */}
          <section className="flex items-center justify-between">
            <div>
              <Label className="text-cooper-lg font-semibold">
                Audio Mode
              </Label>
              <p className="text-cooper-base text-muted-foreground">
                Enable voice input/output (disable for text-only mode)
              </p>
            </div>
            <Switch
              checked={localSettings.audioEnabled}
              onCheckedChange={(checked) => handleChange('audioEnabled', checked)}
            />
          </section>

          {/* Autoplay Speech */}
          <section className="flex items-center justify-between">
            <div>
              <Label className="text-cooper-lg font-semibold">
                Autoplay Responses
              </Label>
              <p className="text-cooper-base text-muted-foreground">
                Automatically read Cooper's questions aloud
              </p>
            </div>
            <Switch
              checked={localSettings.autoplaySpeech}
              onCheckedChange={(checked) => handleChange('autoplaySpeech', checked)}
              disabled={!localSettings.audioEnabled}
            />
          </section>

          {/* System Prompt */}
          <section className="space-y-4">
            <div>
              <Label className="text-cooper-lg font-semibold">
                System Prompt
              </Label>
              <p className="text-cooper-base text-muted-foreground">
                Advanced: Customize Cooper's behavior
              </p>
            </div>
            <Textarea
              value={localSettings.systemPrompt}
              onChange={(e) => handleChange('systemPrompt', e.target.value)}
              className="min-h-[200px] text-sm font-mono"
              placeholder="Enter system prompt..."
            />
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-8">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
