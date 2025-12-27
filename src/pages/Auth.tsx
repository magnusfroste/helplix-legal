import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Loader2, Mail, Lock, ArrowLeft, FileText, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { COUNTRIES, type CountryCode } from '@/types/helplix';
import { useToast } from '@/hooks/use-toast';
import { translations } from '@/i18n/translations';
import { useDetectedLanguage } from '@/hooks/useDetectedLanguage';
import { z } from 'zod';

type AuthMode = 'landing' | 'select-country' | 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const detectedLanguage = useDetectedLanguage();
  
  // Use detected browser language as default
  const [displayLanguage, setDisplayLanguage] = useState<CountryCode>(detectedLanguage);
  const [mode, setMode] = useState<AuthMode>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const t = translations[displayLanguage].auth;

  // Dynamic validation schemas based on language
  const emailSchema = z.string().email(t.invalidEmail);
  const passwordSchema = z.string().min(6, t.passwordMinLength);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/', { replace: true });
      } else {
        setIsCheckingSession(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError(t.wrongCredentials);
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
      setError(t.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCountry) {
      setError(t.selectCountryError);
      return;
    }
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            country: selectedCountry,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError(t.emailAlreadyRegistered);
        } else {
          setError(error.message);
        }
      } else {
        toast({
          title: t.accountCreated,
          description: t.youAreLoggedIn,
        });
      }
    } catch (err) {
      setError(t.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setDisplayLanguage(country);
    setMode('signup');
  };

  const handleGetStarted = () => {
    // Use already selected display language as country
    setSelectedCountry(displayLanguage);
    setMode('signup');
  };

  const handleGoToLogin = () => {
    setMode('login');
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Landing page with app description
  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <Scale className="w-12 h-12 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Helplix Assist</h1>
            <p className="text-muted-foreground text-center text-sm">
              {t.tagline}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{t.feature1}</p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{t.feature2}</p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{t.feature3}</p>
            </div>
          </div>

          {/* Country flags preview */}
          <div className="flex justify-center gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  setDisplayLanguage(country.code);
                }}
                className={`text-2xl p-2 rounded-lg transition-all duration-200 
                           hover:scale-110 hover:bg-muted/50
                           ${displayLanguage === country.code ? 'bg-muted ring-2 ring-primary' : ''}`}
                aria-label={country.name}
              >
                {country.flag}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Button onClick={handleGetStarted} className="w-full" size="lg">
              {t.getStarted}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t.alreadyHaveAccount}{' '}
              <button
                onClick={handleGoToLogin}
                className="text-primary hover:underline"
              >
                {t.login}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Country selection for signup
  if (mode === 'select-country') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Button
          variant="ghost"
          onClick={() => setMode('landing')}
          className="absolute top-4 left-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </Button>
        
        <Scale className="w-10 h-10 text-primary mb-4 animate-fade-in" />
        <h1 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">
          Helplix Assist
        </h1>
        <p className="text-sm text-muted-foreground mb-8 animate-fade-in">
          {t.selectCountry}
        </p>
        
        <div className="grid grid-cols-3 gap-6 max-w-xs">
          {COUNTRIES.map((country, index) => (
            <button
              key={country.code}
              onClick={() => handleCountrySelect(country.code)}
              className="text-6xl p-4 rounded-2xl transition-all duration-200 
                         hover:scale-110 hover:bg-muted/50 
                         active:scale-95 active:bg-muted
                         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                         animate-fade-in opacity-0"
              style={{ animationDelay: `${150 + index * 100}ms`, animationFillMode: 'forwards' }}
              aria-label={country.name}
            >
              {country.flag}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const selectedCountryData = selectedCountry ? COUNTRIES.find(c => c.code === selectedCountry) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Back button for signup */}
        {mode === 'signup' && (
          <Button
            variant="ghost"
            onClick={() => setMode('select-country')}
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <Scale className="w-10 h-10 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Helplix Assist</h1>
          {mode === 'signup' && selectedCountryData && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-2xl">{selectedCountryData.flag}</span>
              <span className="text-sm">{selectedCountryData.name}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive animate-fade-in">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              t.login
            ) : (
              t.createAccount
            )}
          </Button>
        </form>

        {/* Toggle mode */}
        <div className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              {t.noAccount}{' '}
              <button
                onClick={() => setMode('select-country')}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                {t.signUp}
              </button>
            </>
          ) : (
            <>
              {t.alreadyHaveAccount}{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setSelectedCountry(null);
                }}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                {t.login}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
