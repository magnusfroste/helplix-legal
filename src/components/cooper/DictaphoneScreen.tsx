import { memo, useState, useCallback } from 'react';
import { RotateCcw, Keyboard } from 'lucide-react';
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
}: DictaphoneScreenProps) {
  const [showTextInput, setShowTextInput] = useState(false);

  const handleTextSubmit = useCallback((text: string) => {
    onTextSubmit(text);
    setShowTextInput(false);
  }, [onTextSubmit]);

  const isBusy = status === 'listening' || status === 'processing' || status === 'thinking' || status === 'speaking';
  const isSpeaking = status === 'speaking';

  const actionButtonClass = cn(
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
    "bg-secondary text-secondary-foreground",
    "hover:bg-secondary/80 active:scale-95",
    "transition-all duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "touch-manipulation select-none text-sm"
  );

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-80px)] py-4 px-2">
      {/* Header */}
      <header className="w-full flex items-center justify-center px-2 py-2">
        <h1 className="text-cooper-2xl font-bold text-foreground tracking-tight">
          Cooper
        </h1>
      </header>

      {/* Question Display - maximize space */}
      <div className="flex-1 flex items-center justify-center w-full">
        <QuestionDisplay 
          question={currentQuestion}
          isFirstInteraction={isFirstInteraction}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* Controls area */}
      <div className="pb-2 flex flex-col items-center gap-3">
        <AudioLevelIndicator 
          level={audioLevel} 
          isRecording={status === 'listening'} 
        />
        
        <PushToTalkButton
          status={status}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          size={buttonSize}
        />
        
        {/* Action buttons row - all on same line */}
        <div className="flex items-center gap-2">
          {onReplay && !isFirstInteraction && (
            <button
              type="button"
              onClick={onReplay}
              disabled={isBusy}
              className={actionButtonClass}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Replay last question"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="font-medium">Replay</span>
            </button>
          )}
          
          <button
            type="button"
            onClick={() => setShowTextInput(true)}
            disabled={isBusy}
            className={actionButtonClass}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Keyboard className="h-4 w-4" />
            <span className="font-medium">Type</span>
          </button>
        </div>
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
