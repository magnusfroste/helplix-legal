import { memo } from 'react';
import { Scale } from 'lucide-react';
import { COUNTRIES, type CountryCode } from '@/types/cooper';
import { useTranslation } from '@/hooks/useTranslation';

interface OnboardingScreenProps {
  onCountrySelect: (countryCode: CountryCode) => void;
}

export const OnboardingScreen = memo(function OnboardingScreen({ 
  onCountrySelect 
}: OnboardingScreenProps) {
  const t = useTranslation(null); // Use default (US English) for onboarding
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Scale className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4 animate-fade-in" />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight animate-fade-in" style={{ animationDelay: '50ms' }}>
        {t.onboarding.appName}
      </h1>
      <p className="text-sm text-muted-foreground mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {t.onboarding.selectJurisdiction}
      </p>
      <div className="grid grid-cols-3 gap-6 max-w-xs">
        {COUNTRIES.map((country, index) => (
          <button
            key={country.code}
            onClick={() => onCountrySelect(country.code)}
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
});
