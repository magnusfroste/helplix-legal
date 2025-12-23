import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { PushToTalkButton } from './PushToTalkButton';
import { QuestionDisplay } from './QuestionDisplay';
import { TextInputDialog } from './TextInputDialog';
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
}

export function DictaphoneScreen({
  status,
  currentQuestion,
  isFirstInteraction,
  onStartRecording,
  onStopRecording,
  onTextSubmit,
  onReplay,
  buttonSize = 'large',
}: DictaphoneScreenProps) {
  const [showTextInput, setShowTextInput] = useState(false);

  const handleTextSubmit = useCallback((text: string) => {
    onTextSubmit(text);
    setShowTextInput(false);
  }, [onTextSubmit]);

  const isBusy = status === 'listening' || status === 'processing' || status === 'thinking' || status === 'speaking';

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-80px)] py-4 px-2">
      {/* Header - compact */}
      <header className="text-center py-2">
        <h1 className="text-cooper-2xl font-bold text-foreground tracking-tight">
          Cooper
        </h1>
      </header>

      {/* Question Display - maximize space */}
      <div className="flex-1 flex items-center justify-center w-full">
        <QuestionDisplay 
          question={currentQuestion}
          isFirstInteraction={isFirstInteraction}
          onTypeResponse={() => setShowTextInput(true)}
        />
      </div>

      {/* Push-to-Talk Button */}
      <div className="pb-2 flex flex-col items-center gap-3">
        <PushToTalkButton
          status={status}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          size={buttonSize}
        />
        
        {/* Replay Button */}
        {onReplay && !isFirstInteraction && (
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
}
