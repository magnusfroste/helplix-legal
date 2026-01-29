import { useMemo } from 'react';
import type { CountryCode } from '@/types/helplix';
import { translations, type Translations } from '@/i18n/translations';

export function useTranslation(country: CountryCode | null): Translations {
  return useMemo(() => {
    // Default to US English if no country selected
    return translations[country || 'US'];
  }, [country]);
}
