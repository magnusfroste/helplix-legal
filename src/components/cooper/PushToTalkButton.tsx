import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useCallback, useEffect } from 'react';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isActiveRef = useRef(false);
  
  const isRecording = status === 'listening';
  const isProcessing = status === 'processing' || status === 'thinking';
  const isSpeaking = status === 'speaking';
  const isDisabled = disabled || isProcessing || isSpeaking;

  const handleStart = useCallback(() => {
    if (isDisabled || isActiveRef.current) return;
    console.log('PTT: Starting recording');
    isActiveRef.current = true;
    onStartRecording();
  }, [isDisabled, onStartRecording]);

  const handleEnd = useCallback(() => {
    if (!isActiveRef.current) return;
    console.log('PTT: Stopping recording');
    isActiveRef.current = false;
    onStopRecording();
  }, [onStopRecording]);

  // Use native event listeners to avoid React synthetic event issues
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      handleStart();
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    const onMouseDown = (e: MouseEvent) => {
      // Only handle left click
      if (e.button !== 0) return;
      e.preventDefault();
      handleStart();
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      handleEnd();
    };

    const onMouseLeave = () => {
      if (isActiveRef.current) {
        handleEnd();
      }
    };

    // Prevent context menu on long press
    const onContextMenu = (e: Event) => {
      e.preventDefault();
    };

    button.addEventListener('touchstart', onTouchStart, { passive: false });
    button.addEventListener('touchend', onTouchEnd, { passive: false });
    button.addEventListener('touchcancel', onTouchEnd, { passive: false });
    button.addEventListener('mousedown', onMouseDown);
    button.addEventListener('mouseup', onMouseUp);
    button.addEventListener('mouseleave', onMouseLeave);
    button.addEventListener('contextmenu', onContextMenu);

    return () => {
      button.removeEventListener('touchstart', onTouchStart);
      button.removeEventListener('touchend', onTouchEnd);
      button.removeEventListener('touchcancel', onTouchEnd);
      button.removeEventListener('mousedown', onMouseDown);
      button.removeEventListener('mouseup', onMouseUp);
      button.removeEventListener('mouseleave', onMouseLeave);
      button.removeEventListener('contextmenu', onContextMenu);
    };
  }, [handleStart, handleEnd]);

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
    return "bg-primary hover:bg-primary/90";
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
          ref={buttonRef}
          type="button"
          disabled={isDisabled}
          className={cn(
            "rounded-full flex items-center justify-center relative",
            "text-primary-foreground shadow-lg transition-all duration-200",
            "focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "select-none z-10 cursor-pointer",
            buttonSizeClass,
            getButtonStyles()
          )}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
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
