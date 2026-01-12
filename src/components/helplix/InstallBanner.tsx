import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import type { CountryCode } from '@/types/helplix';

interface InstallBannerProps {
  country: CountryCode;
}

export function InstallBanner({ country }: InstallBannerProps) {
  const navigate = useNavigate();
  const t = useTranslation(country);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone = (window.navigator as any).standalone === true;
    const isPwaInstalled = isStandalone || isIosStandalone;

    // Check if user has dismissed the banner before
    const wasDismissed = localStorage.getItem('pwa-banner-dismissed') === 'true';

    // Show banner if not installed and not dismissed
    setIsVisible(!isPwaInstalled && !wasDismissed);
    setIsDismissed(wasDismissed);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleInstallClick = () => {
    navigate('/install');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Download className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-helplix-sm text-foreground truncate">
            {t.install.bannerText}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInstallClick}
            className="h-7 px-2 text-helplix-sm text-primary hover:text-primary"
          >
            {t.install.bannerButton}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
