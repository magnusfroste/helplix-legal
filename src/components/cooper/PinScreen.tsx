import { useState, useCallback, useRef, useEffect } from 'react';
import { Scale, Delete, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PinScreenProps {
  mode: 'login' | 'create' | 'confirm';
  country: string;
  countryFlag: string;
  onPinSubmit: (pin: string) => void;
  onBack?: () => void;
  error?: string;
  isLoading?: boolean;
}

export function PinScreen({
  mode,
  country,
  countryFlag,
  onPinSubmit,
  onBack,
  error,
  isLoading = false,
}: PinScreenProps) {
  const [pin, setPin] = useState('');
  const maxLength = 6;

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < maxLength) {
      const newPin = pin + digit;
      setPin(newPin);
      
      // Auto-submit when 6 digits entered
      if (newPin.length === maxLength) {
        setTimeout(() => onPinSubmit(newPin), 150);
      }
    }
  }, [pin, onPinSubmit]);

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
  }, []);

  // Reset PIN when error changes
  useEffect(() => {
    if (error) {
      setPin('');
    }
  }, [error]);

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Skapa PIN-kod';
      case 'confirm':
        return 'Bekräfta PIN-kod';
      case 'login':
      default:
        return 'Ange PIN-kod';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'create':
        return 'Välj en 6-siffrig kod för att logga in';
      case 'confirm':
        return 'Ange samma kod igen för att bekräfta';
      case 'login':
      default:
        return 'Logga in med din PIN-kod';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between py-8 px-4">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 animate-fade-in">
        <Scale className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Coopers Law</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-2xl">{countryFlag}</span>
          <span className="text-sm">{country}</span>
        </div>
      </div>

      {/* PIN Display */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-lg font-medium text-foreground">{getTitle()}</h2>
        <p className="text-sm text-muted-foreground text-center">{getSubtitle()}</p>
        
        {/* PIN Dots */}
        <div className="flex gap-3 my-4">
          {Array.from({ length: maxLength }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-150",
                i < pin.length 
                  ? "bg-primary scale-110" 
                  : "bg-muted border-2 border-border"
              )}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-destructive animate-fade-in">{error}</p>
        )}
      </div>

      {/* Number Pad */}
      <div className="w-full max-w-xs">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <Button
              key={digit}
              variant="outline"
              size="lg"
              onClick={() => handleDigit(digit)}
              disabled={isLoading || pin.length >= maxLength}
              className="h-16 text-2xl font-medium hover:bg-muted active:scale-95 transition-transform"
            >
              {digit}
            </Button>
          ))}
          
          {/* Bottom row: Back/Clear, 0, Delete */}
          <Button
            variant="ghost"
            size="lg"
            onClick={onBack || handleClear}
            disabled={isLoading}
            className="h-16 text-muted-foreground hover:text-foreground"
          >
            {onBack ? 'Tillbaka' : 'Rensa'}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleDigit('0')}
            disabled={isLoading || pin.length >= maxLength}
            className="h-16 text-2xl font-medium hover:bg-muted active:scale-95 transition-transform"
          >
            0
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={handleDelete}
            disabled={isLoading || pin.length === 0}
            className="h-16 hover:text-foreground"
          >
            <Delete className="h-6 w-6" />
          </Button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="mt-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
