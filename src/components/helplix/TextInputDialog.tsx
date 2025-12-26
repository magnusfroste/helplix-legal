import { useState, useEffect, useRef } from 'react';
import { Send, X, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { CountryCode } from '@/types/cooper';

interface TextInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (text: string) => void;
  currentQuestion: string;
  country: CountryCode | null;
}

export function TextInputDialog({
  open,
  onOpenChange,
  onSubmit,
  currentQuestion,
  country,
}: TextInputDialogProps) {
  const t = useTranslation(country);
  const [text, setText] = useState('');
  const [showQuestion, setShowQuestion] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when opened
  useEffect(() => {
    if (open && textareaRef.current) {
      // Small delay to ensure keyboard opens properly on mobile
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setText('');
      setShowQuestion(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header with close and question toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="p-2 -ml-2 rounded-full hover:bg-muted active:scale-95 transition-transform"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <span className="text-sm font-medium text-muted-foreground">
          {t.textInput.title}
        </span>
        
        <button
          type="button"
          onClick={() => setShowQuestion(!showQuestion)}
          className={cn(
            "p-2 -mr-2 rounded-full transition-all active:scale-95",
            showQuestion ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
          )}
          aria-label={showQuestion ? t.textInput.hideQuestion : t.textInput.showQuestion}
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>

      {/* Question panel (collapsible) */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 border-b border-border bg-muted/50",
          showQuestion ? "max-h-40" : "max-h-0 border-b-0"
        )}
      >
        <div className="px-4 py-3">
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            "{currentQuestion}"
          </p>
        </div>
      </div>

      {/* Text input area - fills remaining space */}
      <div className="flex-1 flex flex-col p-4 pb-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.textInput.placeholder}
          className={cn(
            "flex-1 w-full resize-none bg-transparent",
            "text-base leading-relaxed",
            "placeholder:text-muted-foreground/50",
            "focus:outline-none",
            "min-h-[100px]"
          )}
          style={{
            fontSize: '16px', // Prevents iOS zoom on focus
          }}
        />
      </div>

      {/* Send button - fixed at bottom, above keyboard */}
      <div className="px-4 py-3 pb-safe border-t border-border bg-card">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "h-12 rounded-full font-medium",
            "transition-all duration-200 active:scale-[0.98]",
            text.trim()
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send className="h-5 w-5" />
          <span>{t.textInput.send}</span>
        </button>
      </div>
    </div>
  );
}
