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
  // Responsive text size based on question length
  const getTextSizeClass = () => {
    const length = question.length;
    
    if (isFirstInteraction) {
      if (length > 200) return "text-cooper-lg";
      if (length > 100) return "text-cooper-xl";
      return "text-cooper-2xl";
    }
    
    if (length > 300) return "text-cooper-base";
    if (length > 150) return "text-cooper-lg";
    return "text-cooper-xl";
  };

  return (
    <div className="flex flex-col items-center gap-3 px-1 animate-fade-in w-full">
      <p className={cn(
        "font-medium text-foreground leading-snug text-center transition-all duration-300",
        getTextSizeClass()
      )}>
        {question}
      </p>
      
      {onTypeResponse && (
        <button
          onClick={onTypeResponse}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
            "bg-secondary text-secondary-foreground",
            "hover:bg-secondary/80 transition-colors",
            "text-sm"
          )}
        >
          <Keyboard className="h-4 w-4" />
          <span>Type instead</span>
        </button>
      )}
    </div>
  );
}
