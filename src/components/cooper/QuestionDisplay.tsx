import { MessageCircle, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionDisplayProps {
  question: string;
  isFirstInteraction: boolean;
  onTypeResponse?: () => void;
}

export function QuestionDisplay({ 
  question, 
  isFirstInteraction,
  onTypeResponse 
}: QuestionDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-6 px-4 animate-fade-in">
      <div className="flex items-start gap-3 max-w-md">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className={cn(
            "text-cooper-xl font-medium text-foreground leading-relaxed",
            isFirstInteraction && "text-cooper-2xl"
          )}>
            {question}
          </p>
        </div>
      </div>
      
      {onTypeResponse && (
        <button
          onClick={onTypeResponse}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-secondary text-secondary-foreground",
            "hover:bg-secondary/80 transition-colors",
            "text-cooper-base"
          )}
        >
          <Keyboard className="h-5 w-5" />
          <span>Type response instead</span>
        </button>
      )}
    </div>
  );
}
