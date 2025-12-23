import { memo, useState, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { PushToTalkButton } from './PushToTalkButton';
import { QuestionDisplay } from './QuestionDisplay';
import { TextInputDialog } from './TextInputDialog';
import { AudioLevelIndicator } from './AudioLevelIndicator';
import { cn } from '@/lib/utils';
import type { ConversationStatus, CooperSettings } from '@/types/cooper';

interface DictaphoneScreenProps {
  status: ConversationStatus;
  currentQuestion: string;
  isFirstInteraction: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTextSubmit: (text: string) => void;
  onReplay?: () => void;
  buttonSize?: CooperSettings['buttonSize'];
  audioLevel?: number;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export const DictaphoneScreen = memo(function DictaphoneScreen({
  status,
  currentQuestion,
  isFirstInteraction,
  onStartRecording,
  onStopRecording,
  onTextSubmit,
  onReplay,
  buttonSize = 'large',
  audioLevel = 0,
  audioEnabled = true,
  onToggleAudio,
}: DictaphoneScreenProps) {
  const [showTextInput, setShowTextInput] = useState(false);

  const handleTextSubmit = useCallback((text: string) => {
    onTextSubmit(text);
    setShowTextInput(false);
  }, [onTextSubmit]);

  const isBusy = status === 'listening' || status === 'processing' || status === 'thinking' || status === 'speaking';
  const isSpeaking = status === 'speaking';

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-80px)] py-4 px-2">
      {/* Header with audio toggle */}
      <header className="w-full flex items-center justify-between px-2 py-2">
        <div className="w-10" /> {/* Spacer for centering */}
        <h1 className="text-cooper-2xl font-bold text-foreground tracking-tight">
          Cooper
        </h1>
        {onToggleAudio && (
          <button
            type="button"
            onClick={onToggleAudio}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full",
              "bg-secondary text-secondary-foreground",
              "hover:bg-secondary/80 active:scale-95",
              "transition-all duration-200",
              "touch-manipulation select-none"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
          >
            {audioEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </button>
        )}
      </header>

      {/* Question Display - maximize space */}
      <div className="flex-1 flex items-center justify-center w-full">
        <QuestionDisplay 
          question={currentQuestion}
          isFirstInteraction={isFirstInteraction}
          isSpeaking={isSpeaking && audioEnabled}
          onTypeResponse={() => setShowTextInput(true)}
        />
      </div>

      {/* Audio Level Indicator + Push-to-Talk Button */}
      <div className="pb-2 flex flex-col items-center gap-3">
        {audioEnabled && (
          <AudioLevelIndicator 
            level={audioLevel} 
            isRecording={status === 'listening'} 
          />
        )}
        
        {audioEnabled ? (
          <PushToTalkButton
            status={status}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            size={buttonSize}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowTextInput(true)}
            disabled={isBusy}
            className={cn(
              "px-6 py-3 rounded-full",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-95",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "touch-manipulation select-none font-medium"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Type your response
          </button>
        )}
        
        {/* Replay Button */}
        {onReplay && !isFirstInteraction && audioEnabled && (
          <button
            type="button"
            onClick={onReplay}
            disabled={isBusy}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full",
              "bg-secondary text-secondary-foreground",
              "hover:bg-secondary/80 active:scale-95",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "touch-manipulation select-none text-sm"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Replay last question"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="font-medium">Replay</span>
          </button>
        )}
      </div>

      {/* Text Input Dialog */}
      <TextInputDialog
        open={showTextInput}
        onOpenChange={setShowTextInput}
        onSubmit={handleTextSubmit}
        currentQuestion={currentQuestion}
      />
    </div>
  );
});
