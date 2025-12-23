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
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const isRecording = status === 'listening';
  const isProcessing = status === 'processing' || status === 'thinking';
  const isSpeaking = status === 'speaking';
  const isDisabled = disabled || isProcessing || isSpeaking;

  // Pre-warm AudioContext on first user interaction (iOS requirement)
  const warmupAudio = useCallback(() => {
    if (audioContextRef.current) return;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      ctx.resume().then(() => {
        // Create and play a silent buffer to unlock audio
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        console.log('Audio context warmed up');
      });
    } catch (e) {
      console.log('Audio warmup failed:', e);
    }
  }, []);

  const handleToggle = useCallback(() => {
    if (isDisabled) return;
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Warm up audio on first interaction
    warmupAudio();
    
    if (isRecording) {
      console.log('Toggle: Stopping recording');
      onStopRecording();
    } else {
      console.log('Toggle: Starting recording');
      onStartRecording();
    }
  }, [isDisabled, isRecording, onStartRecording, onStopRecording, warmupAudio]);

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
        return 'Tap to send';
      case 'processing':
        return 'Processing...';
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Cooper is speaking';
      default:
        return 'Tap to speak';
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
          onClick={handleToggle}
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
          aria-label={isRecording ? "Tap to stop recording" : "Tap to start recording"}
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
