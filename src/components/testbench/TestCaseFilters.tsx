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
  { code: '', label: 'All countries' },
  { code: 'SE', label: '🇸🇪 Sweden' },
  { code: 'BR', label: '🇧🇷 Brazil' },
  { code: 'MX', label: '🇲🇽 Mexico' },
  { code: 'US', label: '🇺🇸 USA' },
  { code: 'NL', label: '🇳🇱 Netherlands' },
  { code: 'DO', label: '🇩🇴 Dominican Rep.' }
];

const CASE_TYPES = [
  { code: '', label: 'All types' },
  { code: 'travel_damage', label: 'Travel Damage' },
  { code: 'consumer', label: 'Consumer' },
  { code: 'housing', label: 'Housing' },
  { code: 'employment', label: 'Employment' },
  { code: 'contract', label: 'Contract' },
  { code: 'general', label: 'General' }
];

const DIFFICULTIES = [
  { code: '', label: 'All levels' },
  { code: 'easy', label: 'Easy' },
  { code: 'medium', label: 'Medium' },
  { code: 'hard', label: 'Hard' }
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
          <SelectValue placeholder="Country" />
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
          <SelectValue placeholder="Type" />
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
          <SelectValue placeholder="Difficulty" />
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
