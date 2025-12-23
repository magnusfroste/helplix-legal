import { memo } from 'react';
import { COUNTRIES, type CountryCode } from '@/types/cooper';

interface OnboardingScreenProps {
  onCountrySelect: (countryCode: CountryCode) => void;
}

export const OnboardingScreen = memo(function OnboardingScreen({ 
  onCountrySelect 
}: OnboardingScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 sm:mb-8 tracking-tight">
        Coopers Law
      </h1>
      <div className="grid grid-cols-3 gap-6 max-w-xs">
        {COUNTRIES.map((country) => (
          <button
            key={country.code}
            onClick={() => onCountrySelect(country.code)}
            className="text-6xl p-4 rounded-2xl transition-all duration-200 
                       hover:scale-110 hover:bg-muted/50 
                       active:scale-95 active:bg-muted
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            aria-label={country.name}
          >
            {country.flag}
          </button>
        ))}
      </div>
    </div>
  );
});
