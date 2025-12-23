import { Keyboard } from 'lucide-react';
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
    <div className="flex flex-col items-center gap-4 px-2 animate-fade-in">
      <p className={cn(
        "text-cooper-xl font-medium text-foreground leading-relaxed text-center",
        isFirstInteraction && "text-cooper-2xl"
      )}>
        {question}
      </p>
      
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
