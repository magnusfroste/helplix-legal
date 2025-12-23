import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useCallback } from 'react';
import type { ConversationStatus } from '@/types/cooper';

interface PushToTalkButtonProps {
  status: ConversationStatus;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
  size?: 'small' | 'large';
}

export function PushToTalkButton({
  status,
  onStartRecording,
  onStopRecording,
  disabled = false,
  size = 'large',
}: PushToTalkButtonProps) {
  // Track if we're currently pressing (to prevent duplicate events)
  const isPressing = useRef(false);
  // Track if touch started the interaction (to ignore subsequent mouse events)
  const isTouchDevice = useRef(false);
  
  const isRecording = status === 'listening';
  const isProcessing = status === 'processing' || status === 'thinking';
  const isSpeaking = status === 'speaking';
  const isDisabled = disabled || isProcessing || isSpeaking;
  
  const handleStart = useCallback(() => {
    if (isDisabled || isPressing.current) return;
    isPressing.current = true;
    onStartRecording();
  }, [isDisabled, onStartRecording]);

  const handleEnd = useCallback(() => {
    if (!isPressing.current) return;
    isPressing.current = false;
    onStopRecording();
  }, [onStopRecording]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent mouse event from firing
    isTouchDevice.current = true;
    handleStart();
  }, [handleStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Mouse handlers (only fire if not a touch device)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isTouchDevice.current) return; // Ignore if touch already handled
    e.preventDefault();
    handleStart();
  }, [handleStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isTouchDevice.current) return;
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isTouchDevice.current) return;
    if (isPressing.current) {
      handleEnd();
    }
  }, [handleEnd]);

  const getButtonStyles = () => {
    if (isRecording) {
      return "bg-cooper-recording scale-110";
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
    const iconSize = size === 'large' ? 'h-12 w-12' : 'h-8 w-8';
    if (isRecording) {
      return <Square className={cn(iconSize, "fill-current")} />;
    }
    if (isProcessing) {
      return <Loader2 className={cn(iconSize, "animate-spin")} />;
    }
    return <Mic className={iconSize} />;
  };

  const buttonSizeClass = size === 'large' ? 'w-32 h-32' : 'w-20 h-20';

  const getLabel = () => {
    switch (status) {
      case 'listening':
        return 'Release to send';
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
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        {/* Pulsing rings when recording */}
        {isRecording && (
          <>
            <span 
              className={cn(
                "absolute rounded-full bg-cooper-recording/40 animate-ping",
                buttonSizeClass
              )} 
            />
            <span 
              className={cn(
                "absolute rounded-full bg-cooper-recording/20 animate-pulse",
                buttonSizeClass
              )}
            />
          </>
        )}
        
        <button
          type="button"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          disabled={isDisabled}
          className={cn(
            "rounded-full flex items-center justify-center relative",
            "text-primary-foreground shadow-lg transition-all duration-200",
            "focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "touch-none select-none z-10 cursor-pointer",
            buttonSizeClass,
            getButtonStyles()
          )}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label={isRecording ? "Release to stop recording" : "Hold to start recording"}
        >
          {getIcon()}
        </button>
      </div>
      
      <span className={cn(
        "font-medium text-center select-none",
        size === 'large' ? "text-cooper-lg" : "text-sm",
        isRecording && "text-cooper-recording",
        isProcessing && "text-cooper-processing",
        isSpeaking && "text-cooper-speaking"
      )}>
        {getLabel()}
      </span>
    </div>
  );
}
