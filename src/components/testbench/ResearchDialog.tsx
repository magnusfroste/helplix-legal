import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestCase, COUNTRY_FLAGS } from '@/types/testbench';
import { Search, Loader2, Plus, Check } from 'lucide-react';

interface ResearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResearch: (countryCode: string, caseType: string, searchTerms?: string) => Promise<TestCase[] | null>;
  onComplete: (testCases: TestCase[]) => void;
}

const COUNTRIES = [
  { code: 'SE', label: 'Sverige' },
  { code: 'BR', label: 'Brasilien' },
  { code: 'MX', label: 'Mexiko' },
  { code: 'US', label: 'USA' },
  { code: 'NL', label: 'Nederländerna' },
  { code: 'DO', label: 'Dominikanska Rep.' }
];

const CASE_TYPES = [
  { code: 'travel_damage', label: 'Reseskador' },
  { code: 'consumer', label: 'Konsument' },
  { code: 'housing', label: 'Bostad' },
  { code: 'employment', label: 'Arbetsrätt' },
  { code: 'contract', label: 'Avtal' }
];

export function ResearchDialog({ isOpen, onClose, onResearch, onComplete }: ResearchDialogProps) {
  const [countryCode, setCountryCode] = useState('SE');
  const [caseType, setCaseType] = useState('consumer');
  const [searchTerms, setSearchTerms] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<TestCase[]>([]);
  const [selectedCases, setSelectedCases] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);
    setResults([]);
    setSelectedCases(new Set());

    const cases = await onResearch(countryCode, caseType, searchTerms || undefined);
    
    if (cases) {
      setResults(cases);
      // Auto-select all
      setSelectedCases(new Set(cases.map((_, i) => i)));
    } else {
      setError('Kunde inte hitta några fall. Försök med andra söktermer.');
    }
    
    setIsSearching(false);
  };

  const toggleCase = (index: number) => {
    setSelectedCases(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleImport = () => {
    const casesToImport = results.filter((_, i) => selectedCases.has(i));
    onComplete(casesToImport);
    handleClose();
  };

  const handleClose = () => {
    setResults([]);
    setSelectedCases(new Set());
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Research - Hitta verkliga fall</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Form */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Land</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {COUNTRY_FLAGS[c.code]} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ärendetyp</Label>
              <Select value={caseType} onValueChange={setCaseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CASE_TYPES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Söktermer (valfritt)</Label>
            <div className="flex gap-2">
              <Input 
                value={searchTerms}
                onChange={(e) => setSearchTerms(e.target.value)}
                placeholder="T.ex. flygförsening ersättning"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Hittade testfall ({results.length})</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedCases.size} valda
                </span>
              </div>
              
              <ScrollArea className="h-64 border rounded-lg p-2">
                <div className="space-y-2">
                  {results.map((tc, i) => (
                    <Card 
                      key={i}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedCases.has(i) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => toggleCase(i)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          selectedCases.has(i) ? 'bg-primary border-primary' : 'border-muted'
                        }`}>
                          {selectedCases.has(i) && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{tc.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {tc.scenario?.description?.slice(0, 100)}...
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {tc.case_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {tc.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Avbryt
            </Button>
            {results.length > 0 && (
              <Button onClick={handleImport} disabled={selectedCases.size === 0}>
                <Plus className="h-4 w-4 mr-1" />
                Importera {selectedCases.size} fall
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
