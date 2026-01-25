import { useState, useCallback, memo } from 'react';
import { RotateCcw, Keyboard, Plus, Cpu } from 'lucide-react';
import { PushToTalkButton } from './PushToTalkButton';
import { QuestionDisplay } from './QuestionDisplay';
import { TextInputDialog } from './TextInputDialog';
import { AudioLevelIndicator } from './AudioLevelIndicator';
import { RealtimeTranscription } from './RealtimeTranscription';
import { cn } from '@/lib/utils';
import type { ConversationStatus, CooperSettings, CountryCode } from '@/types/helplix';
import { useTranslation } from '@/hooks/useTranslation';
import { useAIConfig } from '@/hooks/useAIConfig';

interface DictaphoneScreenProps {
  status: ConversationStatus;
  currentQuestion: string;
  isFirstInteraction: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTextSubmit: (text: string) => void;
  onReplay?: () => void;
  onNewCase?: () => void;
  buttonSize?: CooperSettings['buttonSize'];
  audioLevel?: number;
  country: CountryCode | null;
  showRealtimeTranscription?: boolean;
  realtimeTranscriptionText?: string;
  hasContent?: boolean;
  showAiBadge?: boolean;
}

export const DictaphoneScreen = memo(function DictaphoneScreen({
  status,
  currentQuestion,
  isFirstInteraction,
  onStartRecording,
  onStopRecording,
  onTextSubmit,
  onReplay,
  onNewCase,
  buttonSize = 'large',
  audioLevel = 0,
  country,
  showRealtimeTranscription = false,
  realtimeTranscriptionText = '',
  hasContent = false,
  showAiBadge = false,
}: DictaphoneScreenProps) {
  const t = useTranslation(country);
  const { config } = useAIConfig();
  const [showTextInput, setShowTextInput] = useState(false);

  // Extract short model name for display
  const displayModelName = config?.model_name 
    ? config.model_name.split('/').pop() || config.model_name 
    : 'AI';

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
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-80px)] py-4 px-2 relative">
      {/* AI Model Badge - subtle bottom corner, controlled by feature flag */}
      {showAiBadge && config?.is_active && (
        <div className="absolute bottom-20 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground text-[10px]">
          <Cpu className="h-2.5 w-2.5" />
          <span>{displayModelName}</span>
        </div>
      )}
      {/* Header with New Case button */}
      <header className="w-full flex items-center justify-between px-2 py-2">
        <div className="w-16" /> {/* Spacer for centering */}
        <h1 className="text-helplix-2xl font-bold text-foreground tracking-tight">
          Helplix
        </h1>
        {onNewCase && hasContent && (
          <button
            type="button"
            onClick={onNewCase}
            disabled={isBusy}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-95",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "touch-manipulation select-none text-xs font-medium"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={t.dictaphone.newCase}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t.dictaphone.newCase}</span>
          </button>
        )}
        {(!onNewCase || !hasContent) && <div className="w-16" />} {/* Spacer when no button */}
      </header>

      {/* Question Display - maximize space */}
      <div className="flex-1 flex flex-col items-center justify-center w-full gap-4">
        {showRealtimeTranscription && status === 'listening' ? (
          <RealtimeTranscription
            text={realtimeTranscriptionText}
            isVisible={true}
            isRecording={status === 'listening'}
          />
        ) : (
          <QuestionDisplay 
            question={currentQuestion}
            isFirstInteraction={isFirstInteraction}
            isSpeaking={isSpeaking}
          />
        )}
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
          country={country}
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
              <span className="font-medium">{t.dictaphone.replay}</span>
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
            <span className="font-medium">{t.dictaphone.type}</span>
          </button>
        </div>
      </div>

      {/* Text Input Dialog */}
      <TextInputDialog
        open={showTextInput}
        onOpenChange={setShowTextInput}
        onSubmit={handleTextSubmit}
        currentQuestion={currentQuestion}
        country={country}
      />
    </div>
  );
});
