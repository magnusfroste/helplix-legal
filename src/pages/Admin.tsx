import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ToggleLeft, ToggleRight, Users, Loader2, AlertTriangle, CheckCircle, Wrench, Search, Mic, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useFeatureFlags, FeatureFlag } from '@/hooks/useFeatureFlags';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  country: string;
  created_at: string;
  last_login_at: string | null;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'perplexity_case_search': <Search className="h-5 w-5" />,
  'realtime_transcription': <Mic className="h-5 w-5" />,
  'voice_cloning': <Volume2 className="h-5 w-5" />,
};

const FEATURE_LABELS: Record<string, string> = {
  'perplexity_case_search': 'Perplexity Rättsfallssökning',
  'realtime_transcription': 'Real-time Transkription',
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

  // Get current user from localStorage (since we use PIN auth)
  useEffect(() => {
    const storedUserId = localStorage.getItem('cooper_user_id');
    setCurrentUserId(storedUserId);
  }, []);

  const { isAdmin, isLoading: adminLoading, error: adminError } = useAdminAuth(currentUserId);
  const { flags, isLoading: flagsLoading, updateFlag, refreshFlags } = useFeatureFlags();

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && !isAdmin && currentUserId) {
      toast.error('Åtkomst nekad. Endast administratörer.');
      navigate('/');
    }
  }, [isAdmin, adminLoading, currentUserId, navigate]);

  // Fetch users and roles
  useEffect(() => {
    async function fetchUsers() {
      if (!isAdmin) return;
      
      setLoadingUsers(true);
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, country, created_at, last_login_at')
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
    }

    fetchUsers();
  }, [isAdmin]);

  const handleToggleFlag = async (flag: FeatureFlag) => {
    const success = await updateFlag(flag.feature_key, !flag.enabled);
    if (success) {
      toast.success(`${FEATURE_LABELS[flag.feature_key] || flag.feature_key} ${!flag.enabled ? 'aktiverad' : 'inaktiverad'}`);
    } else {
      toast.error('Kunde inte uppdatera inställning');
    }
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
                  const isNotImplemented = flag.feature_key === 'realtime_transcription';
                  
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
                            {isNotImplemented ? (
                              <Badge variant="outline" className="text-amber-600 border-amber-600">
                                <Wrench className="h-3 w-3 mr-1" />
                                Kräver WebSocket
                              </Badge>
                            ) : connectionStatus.status === 'connected' ? (
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
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggleFlag(flag)}
                        disabled={isNotImplemented}
                      />
                    </div>
                  );
                })
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
                    return (
                      <div 
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
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
                            <p className="text-sm font-mono text-muted-foreground">
                              {user.id.slice(0, 8)}...
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.last_login_at 
                                ? `Senast: ${new Date(user.last_login_at).toLocaleDateString('sv-SE')}`
                                : 'Aldrig inloggad'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                          {role === 'admin' ? 'Admin' : 'Användare'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info box */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Tips:</strong> För att göra en användare till admin, lägg till deras user_id i 
                tabellen <code className="bg-background px-1 rounded">user_roles</code> med rollen 'admin'.
              </p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
