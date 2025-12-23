import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
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
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleIdRef = useRef(0);
  
  const isRecording = status === 'listening';
  const isProcessing = status === 'processing' || status === 'thinking';
  const isSpeaking = status === 'speaking';
  
  const createRipple = (e: React.MouseEvent | React.TouchEvent) => {
    const button = e.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? rect.left + rect.width / 2;
      clientY = e.touches[0]?.clientY ?? rect.top + rect.height / 2;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    
    const id = rippleIdRef.current++;
    setRipples(prev => [...prev, { id, x, y }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };
  
  const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || isProcessing || isSpeaking) return;
    
    createRipple(e);
    
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
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handlePress}
        onTouchStart={handlePress}
        disabled={disabled || isProcessing}
        className={cn(
          "rounded-full flex items-center justify-center relative overflow-hidden",
          "text-primary-foreground shadow-lg transition-all duration-200",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "touch-manipulation select-none",
          buttonSizeClass,
          getButtonStyles()
        )}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        {getIcon()}
      </button>
      
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
