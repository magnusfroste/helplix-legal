import { useState, useCallback } from 'react';
import { PushToTalkButton } from './PushToTalkButton';
import { QuestionDisplay } from './QuestionDisplay';
import { TextInputDialog } from './TextInputDialog';
import type { ConversationStatus } from '@/types/cooper';

interface DictaphoneScreenProps {
  status: ConversationStatus;
  currentQuestion: string;
  isFirstInteraction: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTextSubmit: (text: string) => void;
}

export function DictaphoneScreen({
  status,
  currentQuestion,
  isFirstInteraction,
  onStartRecording,
  onStopRecording,
  onTextSubmit,
}: DictaphoneScreenProps) {
  const [showTextInput, setShowTextInput] = useState(false);

  const handleTextSubmit = useCallback((text: string) => {
    onTextSubmit(text);
    setShowTextInput(false);
  }, [onTextSubmit]);

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
      <div className="mb-4">
        <PushToTalkButton
          status={status}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
        />
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
