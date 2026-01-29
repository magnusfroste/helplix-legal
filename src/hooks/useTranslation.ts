import { useMemo } from 'react';
import type { CountryCode } from '@/types/helplix';
import { translations, type Translations } from '@/i18n/translations';

/**
 * Returns UI translations - always in English (US) regardless of selected jurisdiction.
 * The AI conversation language is handled separately via useCooperChat which uses
 * the country's language for the AI responses.
 */
export function useTranslation(_country: CountryCode | null): Translations {
  return useMemo(() => {
    // UI is always in English - AI conversation follows jurisdiction language
    return translations['US'];
  }, []);
}
