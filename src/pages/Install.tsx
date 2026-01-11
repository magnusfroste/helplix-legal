import { useState, useEffect } from 'react';
import { Download, Share, Smartphone, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Installera Helplix</h1>
      </header>

      <main className="flex-1 p-4 space-y-6 max-w-lg mx-auto w-full">
        {/* App Icon & Info */}
        <div className="flex flex-col items-center text-center pt-4">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
            <img 
              src="/favicon.png" 
              alt="Helplix" 
              className="w-16 h-16 rounded-xl"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Helplix</h2>
          <p className="text-muted-foreground mt-1">Get Informed</p>
        </div>

        {/* Status Card */}
        {isInstalled ? (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Appen är installerad!</p>
                <p className="text-sm text-muted-foreground">Du hittar Helplix på din hemskärm</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Install Button (Android/Desktop) */}
            {deferredPrompt && (
              <Button 
                onClick={handleInstallClick}
                className="w-full h-14 text-lg gap-3"
                size="lg"
              >
                <Download className="h-5 w-5" />
                Installera appen
              </Button>
            )}

            {/* iOS Instructions */}
            {isIOS && !deferredPrompt && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Installera på iPhone/iPad</h3>
                  </div>
                  
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">1</span>
                      <span className="text-foreground">
                        Tryck på <Share className="inline h-4 w-4 mx-1" /> <strong>Dela</strong>-knappen i Safari
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">2</span>
                      <span className="text-foreground">Scrolla ner och välj <strong>"Lägg till på hemskärmen"</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">3</span>
                      <span className="text-foreground">Tryck <strong>"Lägg till"</strong> uppe till höger</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Android Instructions (fallback if no prompt) */}
            {isAndroid && !deferredPrompt && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Installera på Android</h3>
                  </div>
                  
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">1</span>
                      <span className="text-foreground">Öppna menyn (⋮) i Chrome</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">2</span>
                      <span className="text-foreground">Välj <strong>"Installera app"</strong> eller <strong>"Lägg till på startskärmen"</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">3</span>
                      <span className="text-foreground">Bekräfta installationen</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Desktop Instructions */}
            {!isIOS && !isAndroid && !deferredPrompt && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Installera på dator</h3>
                  </div>
                  
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">1</span>
                      <span className="text-foreground">Klicka på installera-ikonen i adressfältet (om tillgänglig)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">2</span>
                      <span className="text-foreground">Eller öppna menyn och välj <strong>"Installera Helplix"</strong></span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Benefits */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Fördelar</h3>
          <div className="grid gap-2">
            {[
              'Snabb åtkomst från hemskärmen',
              'Fungerar offline',
              'Helskärmsläge utan webbläsare',
              'Automatiska uppdateringar'
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-success shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate('/')}
        >
          Tillbaka till appen
        </Button>
      </main>
    </div>
  );
};

export default Install;
