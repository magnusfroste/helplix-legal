import { memo } from 'react';
import { cn } from '@/lib/utils';
import { TypewriterText } from './TypewriterText';

interface QuestionDisplayProps {
  question: string;
  isFirstInteraction: boolean;
  isSpeaking?: boolean;
}

export const QuestionDisplay = memo(function QuestionDisplay({ 
  question, 
  isFirstInteraction,
  isSpeaking = false,
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
        <TypewriterText 
          text={question} 
          isAnimating={isSpeaking}
        />
      </p>
    </div>
  );
});
