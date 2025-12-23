import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { PushToTalkButton } from './PushToTalkButton';
import { QuestionDisplay } from './QuestionDisplay';
import { TextInputDialog } from './TextInputDialog';
import { cn } from '@/lib/utils';
import type { ConversationStatus } from '@/types/cooper';

interface DictaphoneScreenProps {
  status: ConversationStatus;
  currentQuestion: string;
  isFirstInteraction: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTextSubmit: (text: string) => void;
  onReplay?: () => void;
}

export function DictaphoneScreen({
  status,
  currentQuestion,
  isFirstInteraction,
  onStartRecording,
  onStopRecording,
  onTextSubmit,
  onReplay,
}: DictaphoneScreenProps) {
  const [showTextInput, setShowTextInput] = useState(false);

  const handleTextSubmit = useCallback((text: string) => {
    onTextSubmit(text);
    setShowTextInput(false);
  }, [onTextSubmit]);

  const isBusy = status === 'listening' || status === 'processing' || status === 'thinking' || status === 'speaking';

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-140px)] py-8 px-4">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-cooper-3xl font-bold text-foreground tracking-tight">
          Cooper
        </h1>
        <p className="text-cooper-base text-muted-foreground mt-1">
          Your legal documentation assistant
        </p>
      </header>

      {/* Question Display */}
      <div className="flex-1 flex items-center justify-center w-full max-w-lg">
        <QuestionDisplay 
          question={currentQuestion}
          isFirstInteraction={isFirstInteraction}
          onTypeResponse={() => setShowTextInput(true)}
        />
      </div>

      {/* Push-to-Talk Button */}
      <div className="mb-4 flex flex-col items-center gap-4">
        <PushToTalkButton
          status={status}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
        />
        
        {/* Replay Button */}
        {onReplay && !isFirstInteraction && (
          <button
            type="button"
            onClick={onReplay}
            disabled={isBusy}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full",
              "bg-secondary text-secondary-foreground",
              "hover:bg-secondary/80 active:scale-95",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "touch-manipulation select-none"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Replay last question"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="text-cooper-base font-medium">Replay</span>
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
