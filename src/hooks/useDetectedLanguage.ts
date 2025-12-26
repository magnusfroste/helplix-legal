import { useMemo } from 'react';
import type { CountryCode } from '@/types/helplix';

export function useDetectedLanguage(): CountryCode {
  return useMemo(() => {
    const browserLang = navigator.language?.toLowerCase() || 'en';
    
    // Map browser language to CountryCode
    if (browserLang.startsWith('pt')) return 'BR';
    if (browserLang === 'es-mx') return 'MX';
    if (browserLang === 'es-do') return 'DO';
    if (browserLang.startsWith('es')) return 'MX'; // Spanish fallback to Mexico
    if (browserLang.startsWith('sv')) return 'SE';
    if (browserLang.startsWith('nl')) return 'NL';
    
    // Default to US (English)
    return 'US';
  }, []);
}
