import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConversationStatus } from '@/types/cooper';

interface PushToTalkButtonProps {
  status: ConversationStatus;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export function PushToTalkButton({
  status,
  onStartRecording,
  onStopRecording,
  disabled = false,
}: PushToTalkButtonProps) {
  const isRecording = status === 'listening';
  const isProcessing = status === 'processing' || status === 'thinking';
  const isSpeaking = status === 'speaking';
  
  const handlePress = () => {
    if (disabled || isProcessing || isSpeaking) return;
    
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const getButtonStyles = () => {
    if (isRecording) {
      return "bg-cooper-recording cooper-recording-ring";
    }
    if (isProcessing) {
      return "bg-cooper-processing";
    }
    if (isSpeaking) {
      return "bg-cooper-speaking";
    }
    return "bg-primary hover:bg-primary/90 active:scale-95";
  };

  const getIcon = () => {
    if (isRecording) {
      return <Square className="h-12 w-12 fill-current" />;
    }
    if (isProcessing) {
      return <Loader2 className="h-12 w-12 animate-spin" />;
    }
    return <Mic className="h-12 w-12" />;
  };

  const getLabel = () => {
    switch (status) {
      case 'listening':
        return 'Tap to stop';
      case 'processing':
        return 'Processing...';
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Cooper is speaking';
      default:
        return 'Hold to speak';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handlePress}
        disabled={disabled || isProcessing}
        className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center",
          "text-primary-foreground shadow-lg transition-all duration-200",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          getButtonStyles()
        )}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {getIcon()}
      </button>
      
      <span className={cn(
        "text-cooper-lg font-medium text-center",
        isRecording && "text-cooper-recording",
        isProcessing && "text-cooper-processing",
        isSpeaking && "text-cooper-speaking"
      )}>
        {getLabel()}
      </span>
    </div>
  );
}
