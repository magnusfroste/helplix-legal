import { useState, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  text: string;
  isAnimating: boolean;
  speed?: number; // ms per character
  className?: string;
  onComplete?: () => void;
}

export const TypewriterText = memo(function TypewriterText({
  text,
  isAnimating,
  speed = 35,
  className,
  onComplete,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isAnimating) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, isAnimating, speed, onComplete]);

  return (
    <span className={cn(className)}>
      {displayedText}
      {isAnimating && !isComplete && (
        <span className="inline-block w-0.5 h-[1em] bg-primary ml-0.5 animate-pulse" />
      )}
    </span>
  );
});
