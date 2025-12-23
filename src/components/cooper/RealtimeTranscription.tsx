import { memo } from 'react';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeTranscriptionProps {
  text: string;
  isVisible: boolean;
  isRecording: boolean;
}

export const RealtimeTranscription = memo(function RealtimeTranscription({
  text,
  isVisible,
  isRecording,
}: RealtimeTranscriptionProps) {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={cn(
        "bg-primary/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-primary/20",
        "transition-all duration-300"
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {isRecording ? (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            ) : (
              <Mic className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-medium mb-1">
              {isRecording ? 'Recording...' : 'Your speech:'}
            </p>
            {text ? (
              <p className="text-base text-foreground leading-relaxed break-words">
                {text}
              </p>
            ) : (
              <p className="text-base text-muted-foreground/60 italic">
                Speak now...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
