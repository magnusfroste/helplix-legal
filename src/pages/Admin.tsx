import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ToggleLeft, ToggleRight, Users, Loader2, AlertTriangle, CheckCircle, Wrench, Search, Mic, Volume2, ShieldCheck, ShieldOff, FileText, Save, ChevronDown, ChevronUp, Gauge, ListTree, BookOpen, Plus, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useFeatureFlags, FeatureFlag } from '@/hooks/useFeatureFlags';
import { useJurisdictionPrompts } from '@/hooks/useJurisdictionPrompts';
import { usePhaseInstructions, PHASES, Phase } from '@/hooks/usePhaseInstructions';
import { useBehaviorGuidelines, BehaviorGuideline } from '@/hooks/useBehaviorGuidelines';
import { supabase } from '@/integrations/supabase/client';
import { COUNTRIES } from '@/types/helplix';

interface User {
  id: string;
  country: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'perplexity_case_search': <Search className="h-5 w-5" />,
  'realtime_transcription': <Mic className="h-5 w-5" />,
  'streaming_tts': <Volume2 className="h-5 w-5" />,
  'voice_cloning': <Volume2 className="h-5 w-5" />,
};

const FEATURE_LABELS: Record<string, string> = {
  'perplexity_case_search': 'Perplexity Rättsfallssökning',
  'realtime_transcription': 'Real-time Transkription',
  'streaming_tts': 'Streaming TTS',
  'voice_cloning': 'Avancerad Röstkloning',
};

const CONNECTION_STATUS: Record<string, { label: string; available: boolean }> = {
  'perplexity': { label: 'Perplexity API', available: true }, // Connected
  'elevenlabs': { label: 'ElevenLabs API', available: true }, // Connected
};

export default function Admin() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [togglingRole, setTogglingRole] = useState<string | null>(null);

  const { isAdmin, isLoading: adminLoading, error: adminError } = useAdminAuth();
  const { flags, isLoading: flagsLoading, updateFlag, refreshFlags } = useFeatureFlags();
  const { prompts, isLoading: promptsLoading, updatePrompt, updateIntensity } = useJurisdictionPrompts();
  const { instructions, isLoading: instructionsLoading, updateInstruction, getInstruction } = usePhaseInstructions();
  const { 
    guidelines, 
    isLoading: guidelinesLoading, 
    getGlobalGuidelines,
    getGuidelinesForCountry,
    updateGuideline, 
    addGuideline,
    deleteGuideline 
  } = useBehaviorGuidelines();
  
  // Local state for editing prompts
  const [editingPrompts, setEditingPrompts] = useState<Record<string, string>>({});
  const [editingIntensity, setEditingIntensity] = useState<Record<string, number>>({});
  const [editingPhases, setEditingPhases] = useState<Record<string, string>>({});
  const [editingGuidelines, setEditingGuidelines] = useState<Record<string, string>>({});
  const [savingPrompt, setSavingPrompt] = useState<string | null>(null);
  const [savingIntensity, setSavingIntensity] = useState<string | null>(null);
  const [savingPhase, setSavingPhase] = useState<string | null>(null);
  const [savingGuideline, setSavingGuideline] = useState<string | null>(null);
  const [openPrompts, setOpenPrompts] = useState<Record<string, boolean>>({});
  const [selectedCountryForPhases, setSelectedCountryForPhases] = useState<string>('SE');
  const [selectedGuidelineTab, setSelectedGuidelineTab] = useState<string>('global');
  const [newGuidelineKey, setNewGuidelineKey] = useState('');
  const [newGuidelineText, setNewGuidelineText] = useState('');
  const [addingGuideline, setAddingGuideline] = useState(false);

  // Get current user ID from session
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('Åtkomst nekad. Endast administratörer.');
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  // Fetch users and roles
  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    setLoadingUsers(true);
    try {
      // Fetch from profiles table instead of users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, country, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;
      setUserRoles((rolesData as UserRole[]) || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Kunde inte hämta användare');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const handleToggleAdminRole = async (targetUserId: string, currentRole: 'admin' | 'user') => {
    if (!currentUserId) return;
    
    // Prevent removing own admin role
    if (targetUserId === currentUserId && currentRole === 'admin') {
      toast.error('Du kan inte ta bort din egen admin-roll');
      return;
    }

    setTogglingRole(targetUserId);

    try {
      const action = currentRole === 'admin' ? 'remove' : 'add';
      
      const { data, error } = await supabase.functions.invoke('manage-role', {
        body: {
          adminUserId: currentUserId,
          targetUserId,
          action,
          role: 'admin'
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(
          action === 'add' 
            ? 'Användare uppgraderad till admin' 
            : 'Admin-roll borttagen'
        );
        // Refresh user roles
        await fetchUsers();
      } else {
        throw new Error(data?.error || 'Okänt fel');
      }
    } catch (err) {
      console.error('Error toggling role:', err);
      toast.error(err instanceof Error ? err.message : 'Kunde inte ändra roll');
    } finally {
      setTogglingRole(null);
    }
  };

  const handleToggleFlag = async (flag: FeatureFlag) => {
    const success = await updateFlag(flag.feature_key, !flag.enabled);
    if (success) {
      toast.success(`${FEATURE_LABELS[flag.feature_key] || flag.feature_key} ${!flag.enabled ? 'aktiverad' : 'inaktiverad'}`);
    } else {
      toast.error('Kunde inte uppdatera inställning');
    }
  };

  const handlePromptEdit = (countryCode: string, value: string) => {
    setEditingPrompts(prev => ({ ...prev, [countryCode]: value }));
  };

  const handleSavePrompt = async (countryCode: string) => {
    const newPrompt = editingPrompts[countryCode];
    if (!newPrompt) return;

    setSavingPrompt(countryCode);
    const success = await updatePrompt(countryCode, newPrompt);
    
    if (success) {
      toast.success(`Systemprompt för ${COUNTRIES.find(c => c.code === countryCode)?.name || countryCode} sparad`);
      setEditingPrompts(prev => {
        const copy = { ...prev };
        delete copy[countryCode];
        return copy;
      });
    } else {
      toast.error('Kunde inte spara systemprompt');
    }
    setSavingPrompt(null);
  };

  const togglePromptOpen = (countryCode: string) => {
    setOpenPrompts(prev => ({ ...prev, [countryCode]: !prev[countryCode] }));
  };

  const handleIntensityChange = (countryCode: string, value: number) => {
    setEditingIntensity(prev => ({ ...prev, [countryCode]: value }));
  };

  const handleSaveIntensity = async (countryCode: string) => {
    const newIntensity = editingIntensity[countryCode];
    if (newIntensity === undefined) return;

    setSavingIntensity(countryCode);
    const success = await updateIntensity(countryCode, newIntensity);
    
    if (success) {
      toast.success(`Frågeintensitet för ${COUNTRIES.find(c => c.code === countryCode)?.name || countryCode} sparad`);
      setEditingIntensity(prev => {
        const copy = { ...prev };
        delete copy[countryCode];
        return copy;
      });
    } else {
      toast.error('Kunde inte spara frågeintensitet');
    }
    setSavingIntensity(null);
  };

  const getIntensityLabel = (value: number) => {
    if (value < 30) return 'Låg (öppna frågor)';
    if (value < 70) return 'Medium (balanserade frågor)';
    return 'Hög (detaljerade frågor)';
  };

  // Phase instruction handlers
  const getPhaseKey = (countryCode: string, phase: Phase) => `${countryCode}:${phase}`;

  const handlePhaseEdit = (countryCode: string, phase: Phase, value: string) => {
    const key = getPhaseKey(countryCode, phase);
    setEditingPhases(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePhase = async (countryCode: string, phase: Phase) => {
    const key = getPhaseKey(countryCode, phase);
    const newInstruction = editingPhases[key];
    if (!newInstruction) return;

    setSavingPhase(key);
    const success = await updateInstruction(countryCode, phase, newInstruction);
    
    if (success) {
      toast.success(`Fas "${PHASES.find(p => p.key === phase)?.labelSv}" sparad`);
      setEditingPhases(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } else {
      toast.error('Kunde inte spara fasinstruktion');
    }
    setSavingPhase(null);
  };

  const getCurrentPhaseValue = (countryCode: string, phase: Phase): string => {
    const key = getPhaseKey(countryCode, phase);
    return editingPhases[key] ?? getInstruction(countryCode, phase);
  };

  const hasPhaseChanges = (countryCode: string, phase: Phase): boolean => {
    const key = getPhaseKey(countryCode, phase);
    return editingPhases[key] !== undefined && 
           editingPhases[key] !== getInstruction(countryCode, phase);
  };

  const getConnectionStatus = (requiresConnection: string | null) => {
    if (!requiresConnection) {
      return { status: 'not_required', label: 'Ingen anslutning krävs' };
    }
    
    const connection = CONNECTION_STATUS[requiresConnection];
    if (!connection) {
      return { status: 'unknown', label: 'Okänd anslutning' };
    }
    
    return connection.available 
      ? { status: 'connected', label: `${connection.label} ansluten` }
      : { status: 'not_configured', label: `${connection.label} ej konfigurerad` };
  };

  const getUserRole = (userId: string): 'admin' | 'user' => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  if (adminLoading || !currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifierar behörighet...</p>
        </div>
      </div>
    );
  }

  if (adminError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Fel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{adminError}</p>
            <Button onClick={() => navigate('/')}>Tillbaka</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Admin</h1>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-60px)]">
        <div className="p-4 space-y-6 max-w-2xl mx-auto">
          
          {/* Feature Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleRight className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Aktivera eller inaktivera funktioner i applikationen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {flagsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : flags.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Inga feature flags hittades
                </p>
              ) : (
                flags.map((flag) => {
                  const connectionStatus = getConnectionStatus(flag.requires_connection);
                  
                  return (
                    <div 
                      key={flag.id}
                      className="flex items-start justify-between p-4 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-md bg-muted">
                          {FEATURE_ICONS[flag.feature_key] || <ToggleLeft className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Label className="text-base font-medium">
                            {FEATURE_LABELS[flag.feature_key] || flag.feature_key}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {flag.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {connectionStatus.status === 'connected' ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {connectionStatus.label}
                              </Badge>
                            ) : connectionStatus.status === 'not_configured' ? (
                              <Badge variant="outline" className="text-amber-600 border-amber-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {connectionStatus.label}
                              </Badge>
                            ) : null}
                            {flag.feature_key === 'realtime_transcription' && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                <Mic className="h-3 w-3 mr-1" />
                                WebSocket
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggleFlag(flag)}
                      />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Jurisdiction System Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Systempromptar per Jurisdiktion
              </CardTitle>
              <CardDescription>
                Anpassa AI-assistentens beteende för varje land
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {promptsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : prompts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Inga systempromptar hittades
                </p>
              ) : (
              prompts.map((prompt) => {
                  const country = COUNTRIES.find(c => c.code === prompt.country_code);
                  const isOpen = openPrompts[prompt.country_code] || false;
                  const currentPromptValue = editingPrompts[prompt.country_code] ?? prompt.system_prompt;
                  const currentIntensityValue = editingIntensity[prompt.country_code] ?? prompt.question_intensity;
                  const hasPromptChanges = editingPrompts[prompt.country_code] !== undefined && 
                                     editingPrompts[prompt.country_code] !== prompt.system_prompt;
                  const hasIntensityChanges = editingIntensity[prompt.country_code] !== undefined && 
                                     editingIntensity[prompt.country_code] !== prompt.question_intensity;
                  const isSavingPromptNow = savingPrompt === prompt.country_code;
                  const isSavingIntensityNow = savingIntensity === prompt.country_code;

                  return (
                    <Collapsible 
                      key={prompt.id}
                      open={isOpen}
                      onOpenChange={() => togglePromptOpen(prompt.country_code)}
                    >
                      <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{country?.flag || '🌍'}</span>
                              <div className="text-left">
                                <p className="font-medium">{country?.name || prompt.country_code}</p>
                                <p className="text-xs text-muted-foreground">
                                  {country?.language || 'Unknown'} • Intensitet: {prompt.question_intensity}%
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {(hasPromptChanges || hasIntensityChanges) && (
                                <Badge variant="outline" className="text-amber-600 border-amber-600">
                                  Osparad
                                </Badge>
                              )}
                              {isOpen ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-6">
                            {/* Question Intensity */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Gauge className="h-4 w-4 text-muted-foreground" />
                                <Label className="font-medium">Frågeintensitet</Label>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {getIntensityLabel(currentIntensityValue)}
                              </p>
                              <Slider
                                value={[currentIntensityValue]}
                                onValueChange={([value]) => handleIntensityChange(prompt.country_code, value)}
                                max={100}
                                step={10}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Färre frågor</span>
                                <span>Fler frågor</span>
                              </div>
                              {hasIntensityChanges && (
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSaveIntensity(prompt.country_code)}
                                    disabled={isSavingIntensityNow}
                                  >
                                    {isSavingIntensityNow ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Spara intensitet
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* System Prompt */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <Label className="font-medium">Systemprompt</Label>
                              </div>
                              <Textarea
                                value={currentPromptValue}
                                onChange={(e) => handlePromptEdit(prompt.country_code, e.target.value)}
                                className="min-h-[150px] text-sm font-mono"
                                placeholder="Ange systemprompt..."
                              />
                              {hasPromptChanges && (
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSavePrompt(prompt.country_code)}
                                    disabled={isSavingPromptNow}
                                  >
                                    {isSavingPromptNow ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Spara prompt
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Phase Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTree className="h-5 w-5" />
                Fasinstruktioner per Jurisdiktion
              </CardTitle>
              <CardDescription>
                Anpassa instruktioner för varje intervjufas (opening, timeline, details, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {instructionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Country selector tabs */}
                  <Tabs value={selectedCountryForPhases} onValueChange={setSelectedCountryForPhases}>
                    <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
                      {COUNTRIES.map(country => (
                        <TabsTrigger 
                          key={country.code} 
                          value={country.code}
                          className="flex items-center gap-1 text-xs px-2 py-1"
                        >
                          <span>{country.flag}</span>
                          <span className="hidden sm:inline">{country.code}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {COUNTRIES.map(country => (
                      <TabsContent key={country.code} value={country.code} className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">{country.flag}</span>
                          <div>
                            <p className="font-medium">{country.name}</p>
                            <p className="text-xs text-muted-foreground">{country.language}</p>
                          </div>
                        </div>
                        
                        {PHASES.map(phase => {
                          const currentValue = getCurrentPhaseValue(country.code, phase.key);
                          const hasChanges = hasPhaseChanges(country.code, phase.key);
                          const phaseKey = getPhaseKey(country.code, phase.key);
                          const isSaving = savingPhase === phaseKey;
                          
                          return (
                            <Collapsible key={phase.key}>
                              <div className="rounded-lg border border-border bg-card overflow-hidden">
                                <CollapsibleTrigger asChild>
                                  <button className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="font-mono text-xs">
                                        {phase.key}
                                      </Badge>
                                      <span className="text-sm font-medium">{phase.labelSv}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {hasChanges && (
                                        <Badge variant="outline" className="text-amber-600 border-amber-600 text-xs">
                                          Osparad
                                        </Badge>
                                      )}
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="px-3 pb-3 space-y-3">
                                    <Textarea
                                      value={currentValue}
                                      onChange={(e) => handlePhaseEdit(country.code, phase.key, e.target.value)}
                                      className="min-h-[120px] text-sm font-mono"
                                      placeholder={`Instruktioner för ${phase.labelSv}...`}
                                    />
                                    {hasChanges && (
                                      <div className="flex justify-end">
                                        <Button
                                          size="sm"
                                          onClick={() => handleSavePhase(country.code, phase.key)}
                                          disabled={isSaving}
                                        >
                                          {isSaving ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                          )}
                                          Spara
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          );
                        })}
                      </TabsContent>
                    ))}
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>

          {/* Behavior Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Beteenderegler
              </CardTitle>
              <CardDescription>
                Globala och jurisdiktions-specifika riktlinjer för AI-assistentens beteende
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guidelinesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Tabs value={selectedGuidelineTab} onValueChange={setSelectedGuidelineTab}>
                  <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
                    <TabsTrigger value="global" className="flex items-center gap-1 text-xs px-2 py-1">
                      <Globe className="h-3 w-3" />
                      <span>Globala</span>
                    </TabsTrigger>
                    {COUNTRIES.map(country => (
                      <TabsTrigger 
                        key={country.code} 
                        value={country.code}
                        className="flex items-center gap-1 text-xs px-2 py-1"
                      >
                        <span>{country.flag}</span>
                        <span className="hidden sm:inline">{country.code}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {/* Global guidelines */}
                  <TabsContent value="global" className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Globala Beteenderegler</p>
                        <p className="text-xs text-muted-foreground">Gäller för alla jurisdiktioner</p>
                      </div>
                    </div>
                    
                    {getGlobalGuidelines().map(guideline => {
                      const currentValue = editingGuidelines[guideline.id] ?? guideline.guideline_text;
                      const hasChanges = editingGuidelines[guideline.id] !== undefined && 
                                        editingGuidelines[guideline.id] !== guideline.guideline_text;
                      const isSaving = savingGuideline === guideline.id;
                      
                      return (
                        <div key={guideline.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="font-mono text-xs">
                              {guideline.guideline_key}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={guideline.is_enabled}
                                onCheckedChange={async (checked) => {
                                  const success = await updateGuideline(guideline.id, { is_enabled: checked });
                                  if (success) {
                                    toast.success(checked ? 'Regel aktiverad' : 'Regel inaktiverad');
                                  }
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={async () => {
                                  const success = await deleteGuideline(guideline.id);
                                  if (success) {
                                    toast.success('Regel borttagen');
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            value={currentValue}
                            onChange={(e) => setEditingGuidelines(prev => ({ ...prev, [guideline.id]: e.target.value }))}
                            className="min-h-[60px] text-sm"
                            disabled={!guideline.is_enabled}
                          />
                          {hasChanges && (
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  setSavingGuideline(guideline.id);
                                  const success = await updateGuideline(guideline.id, { guideline_text: currentValue });
                                  if (success) {
                                    toast.success('Regel sparad');
                                    setEditingGuidelines(prev => {
                                      const copy = { ...prev };
                                      delete copy[guideline.id];
                                      return copy;
                                    });
                                  }
                                  setSavingGuideline(null);
                                }}
                                disabled={isSaving}
                              >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Spara
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Add new global guideline */}
                    <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Lägg till ny global regel</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nyckel (t.ex. patience)"
                          value={newGuidelineKey}
                          onChange={(e) => setNewGuidelineKey(e.target.value)}
                          className="w-32"
                        />
                        <Input
                          placeholder="Regeltext..."
                          value={newGuidelineText}
                          onChange={(e) => setNewGuidelineText(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          disabled={!newGuidelineKey || !newGuidelineText || addingGuideline}
                          onClick={async () => {
                            setAddingGuideline(true);
                            const maxOrder = Math.max(...getGlobalGuidelines().map(g => g.sort_order), 0);
                            const success = await addGuideline({
                              country_code: null,
                              guideline_key: newGuidelineKey,
                              guideline_text: newGuidelineText,
                              is_enabled: true,
                              sort_order: maxOrder + 1
                            });
                            if (success) {
                              toast.success('Regel tillagd');
                              setNewGuidelineKey('');
                              setNewGuidelineText('');
                            }
                            setAddingGuideline(false);
                          }}
                        >
                          {addingGuideline ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Per-country guidelines */}
                  {COUNTRIES.map(country => (
                    <TabsContent key={country.code} value={country.code} className="space-y-3 mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{country.flag}</span>
                        <div>
                          <p className="font-medium">{country.name} Regler</p>
                          <p className="text-xs text-muted-foreground">Överskriver eller kompletterar globala regler</p>
                        </div>
                      </div>
                      
                      {getGuidelinesForCountry(country.code).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Inga specifika regler för {country.name}. Globala regler används.
                        </p>
                      ) : (
                        getGuidelinesForCountry(country.code).map(guideline => {
                          const currentValue = editingGuidelines[guideline.id] ?? guideline.guideline_text;
                          const hasChanges = editingGuidelines[guideline.id] !== undefined && 
                                            editingGuidelines[guideline.id] !== guideline.guideline_text;
                          const isSaving = savingGuideline === guideline.id;
                          
                          return (
                            <div key={guideline.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {guideline.guideline_key}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={guideline.is_enabled}
                                    onCheckedChange={async (checked) => {
                                      const success = await updateGuideline(guideline.id, { is_enabled: checked });
                                      if (success) {
                                        toast.success(checked ? 'Regel aktiverad' : 'Regel inaktiverad');
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={async () => {
                                      const success = await deleteGuideline(guideline.id);
                                      if (success) {
                                        toast.success('Regel borttagen');
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <Textarea
                                value={currentValue}
                                onChange={(e) => setEditingGuidelines(prev => ({ ...prev, [guideline.id]: e.target.value }))}
                                className="min-h-[60px] text-sm"
                                disabled={!guideline.is_enabled}
                              />
                              {hasChanges && (
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      setSavingGuideline(guideline.id);
                                      const success = await updateGuideline(guideline.id, { guideline_text: currentValue });
                                      if (success) {
                                        toast.success('Regel sparad');
                                        setEditingGuidelines(prev => {
                                          const copy = { ...prev };
                                          delete copy[guideline.id];
                                          return copy;
                                        });
                                      }
                                      setSavingGuideline(null);
                                    }}
                                    disabled={isSaving}
                                  >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Spara
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                      
                      {/* Add new country-specific guideline */}
                      <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Lägg till regel för {country.name}</p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nyckel"
                            value={selectedGuidelineTab === country.code ? newGuidelineKey : ''}
                            onChange={(e) => setNewGuidelineKey(e.target.value)}
                            className="w-32"
                          />
                          <Input
                            placeholder="Regeltext..."
                            value={selectedGuidelineTab === country.code ? newGuidelineText : ''}
                            onChange={(e) => setNewGuidelineText(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            disabled={!newGuidelineKey || !newGuidelineText || addingGuideline}
                            onClick={async () => {
                              setAddingGuideline(true);
                              const countryGuidelines = getGuidelinesForCountry(country.code);
                              const maxOrder = Math.max(...countryGuidelines.map(g => g.sort_order), 0);
                              const success = await addGuideline({
                                country_code: country.code,
                                guideline_key: newGuidelineKey,
                                guideline_text: newGuidelineText,
                                is_enabled: true,
                                sort_order: maxOrder + 1
                              });
                              if (success) {
                                toast.success('Regel tillagd');
                                setNewGuidelineKey('');
                                setNewGuidelineText('');
                              }
                              setAddingGuideline(false);
                            }}
                          >
                            {addingGuideline ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Användare
              </CardTitle>
              <CardDescription>
                Översikt över registrerade användare
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Inga användare hittades
                </p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => {
                    const role = getUserRole(user.id);
                    const isCurrentUser = user.id === currentUserId;
                    const isToggling = togglingRole === user.id;
                    
                    return (
                      <div 
                        key={user.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isCurrentUser ? 'border-primary/50 bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {user.country === 'SE' ? '🇸🇪' : 
                             user.country === 'BR' ? '🇧🇷' : 
                             user.country === 'MX' ? '🇲🇽' : 
                             user.country === 'DO' ? '🇩🇴' : 
                             user.country === 'US' ? '🇺🇸' : 
                             user.country === 'NL' ? '🇳🇱' : '🌍'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-mono text-muted-foreground">
                                {user.id.slice(0, 8)}...
                              </p>
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">Du</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Skapad: {new Date(user.created_at).toLocaleDateString('sv-SE')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                            {role === 'admin' ? 'Admin' : 'Användare'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleAdminRole(user.id, role)}
                            disabled={isToggling || (isCurrentUser && role === 'admin')}
                            title={
                              isCurrentUser && role === 'admin' 
                                ? 'Du kan inte ta bort din egen admin-roll'
                                : role === 'admin' 
                                  ? 'Ta bort admin-roll' 
                                  : 'Gör till admin'
                            }
                          >
                            {isToggling ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : role === 'admin' ? (
                              <ShieldOff className="h-4 w-4 text-destructive" />
                            ) : (
                              <ShieldCheck className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
