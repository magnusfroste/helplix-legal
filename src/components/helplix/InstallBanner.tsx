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
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone = (window.navigator as any).standalone === true;
    const isPwaInstalled = isStandalone || isIosStandalone;

    // Check if user has dismissed the banner and when
    const dismissedAt = localStorage.getItem('pwa-banner-dismissed-at');
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    
    let shouldShowBanner = true;
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const timeSinceDismissed = Date.now() - dismissedTime;
      // Show again if 7 days have passed
      shouldShowBanner = timeSinceDismissed >= SEVEN_DAYS_MS;
    }

    // Show banner if not installed and either never dismissed or 7 days passed
    setIsVisible(!isPwaInstalled && shouldShowBanner);
  }, []);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    // Store timestamp instead of boolean
    localStorage.setItem('pwa-banner-dismissed-at', Date.now().toString());
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const handleInstallClick = () => {
    navigate('/install');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`bg-primary/10 border-b border-primary/20 px-3 py-2 overflow-hidden transition-all duration-200 ${
        isAnimatingOut ? 'animate-accordion-up' : 'animate-accordion-down'
      }`}
    >
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
