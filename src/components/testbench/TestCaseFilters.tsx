import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Filters {
  countryCode: string;
  caseType: string;
  difficulty: string;
}

interface TestCaseFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const COUNTRIES = [
  { code: '', label: 'Alla länder' },
  { code: 'SE', label: '🇸🇪 Sverige' },
  { code: 'BR', label: '🇧🇷 Brasilien' },
  { code: 'MX', label: '🇲🇽 Mexiko' },
  { code: 'US', label: '🇺🇸 USA' },
  { code: 'NL', label: '🇳🇱 Nederländerna' },
  { code: 'DO', label: '🇩🇴 Dominikanska Rep.' }
];

const CASE_TYPES = [
  { code: '', label: 'Alla typer' },
  { code: 'travel_damage', label: 'Reseskador' },
  { code: 'consumer', label: 'Konsument' },
  { code: 'housing', label: 'Bostad' },
  { code: 'employment', label: 'Arbetsrätt' },
  { code: 'contract', label: 'Avtal' },
  { code: 'general', label: 'Allmänt' }
];

const DIFFICULTIES = [
  { code: '', label: 'Alla nivåer' },
  { code: 'easy', label: 'Enkel' },
  { code: 'medium', label: 'Medel' },
  { code: 'hard', label: 'Svår' }
];

export function TestCaseFilters({ filters, onFiltersChange }: TestCaseFiltersProps) {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Select 
        value={filters.countryCode} 
        onValueChange={(v) => updateFilter('countryCode', v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Land" />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code || 'all'}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={filters.caseType} 
        onValueChange={(v) => updateFilter('caseType', v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Typ" />
        </SelectTrigger>
        <SelectContent>
          {CASE_TYPES.map((c) => (
            <SelectItem key={c.code} value={c.code || 'all'}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={filters.difficulty} 
        onValueChange={(v) => updateFilter('difficulty', v)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Svårighet" />
        </SelectTrigger>
        <SelectContent>
          {DIFFICULTIES.map((d) => (
            <SelectItem key={d.code} value={d.code || 'all'}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
