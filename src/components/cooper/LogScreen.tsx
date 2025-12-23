import { memo, CSSProperties, ReactElement } from 'react';
import { List, useDynamicRowHeight, ListImperativeAPI } from 'react-window';
import { cn } from '@/lib/utils';
import type { LogEntry, CountryCode } from '@/types/cooper';
import { useTranslation } from '@/hooks/useTranslation';

interface LogScreenProps {
  entries: LogEntry[];
  country: CountryCode | null;
}

const VIRTUALIZATION_THRESHOLD = 20;
const DEFAULT_ROW_HEIGHT = 72;

export const LogScreen = memo(function LogScreen({ entries, country }: LogScreenProps) {
  const t = useTranslation(country);
  const dynamicRowHeight = useDynamicRowHeight({ 
    defaultRowHeight: DEFAULT_ROW_HEIGHT,
    key: entries.length 
  });

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 text-center">
        <p className="text-muted-foreground">
          {t.log.noConversation}
        </p>
      </div>
    );
  }

  const useVirtualization = entries.length > VIRTUALIZATION_THRESHOLD;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <header className="px-4 py-3 border-b border-border flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          {t.log.title}
        </h1>
        <span className="text-xs text-muted-foreground">
          {entries.length} {t.log.entries}
        </span>
      </header>

      {useVirtualization ? (
        <List
          className="flex-1"
          rowCount={entries.length}
          rowHeight={dynamicRowHeight}
          rowProps={{ entries, dynamicRowHeight, t }}
          rowComponent={VirtualizedLogEntry}
          overscanCount={5}
          style={{ height: 'calc(100vh - 80px - 56px)' }}
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <LogEntryCard key={entry.id} entry={entry} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

interface RowProps {
  entries: LogEntry[];
  dynamicRowHeight: ReturnType<typeof useDynamicRowHeight>;
  t: ReturnType<typeof useTranslation>;
}

function VirtualizedLogEntry({ 
  index, 
  style,
  entries,
  dynamicRowHeight,
  t,
  ariaAttributes
}: {
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
  index: number;
  style: CSSProperties;
} & RowProps): ReactElement {
  const entry = entries[index];
  const isQuestion = entry.type === 'question';

  return (
    <div 
      style={style} 
      {...ariaAttributes}
      data-index={index}
      ref={(el) => {
        if (el) {
          dynamicRowHeight.observeRowElements([el]);
        }
      }}
    >
      <div
        className={cn(
          "px-4 py-3 border-b border-border",
          isQuestion && "bg-muted/30"
        )}
      >
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className={cn(
            "text-xs font-medium",
            isQuestion ? "text-primary" : "text-muted-foreground"
          )}>
            {isQuestion ? t.log.cooper : t.log.you}
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            {formatTime(entry.timestamp)}
          </span>
        </div>
        
        <p className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap",
          isQuestion ? "text-foreground" : "text-foreground/90"
        )}>
          {entry.content}
        </p>
      </div>
    </div>
  );
}

const LogEntryCard = memo(function LogEntryCard({ entry, t }: { entry: LogEntry; t: ReturnType<typeof useTranslation> }) {
  const isQuestion = entry.type === 'question';
  
  return (
    <div className={cn(
      "px-4 py-3",
      isQuestion && "bg-muted/30"
    )}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className={cn(
          "text-xs font-medium",
          isQuestion ? "text-primary" : "text-muted-foreground"
        )}>
          {isQuestion ? 'Cooper' : 'You'}
        </span>
        <span className="text-[10px] text-muted-foreground/70">
          {formatTime(entry.timestamp)}
        </span>
      </div>
      
      <p className={cn(
        "text-sm leading-relaxed whitespace-pre-wrap",
        isQuestion ? "text-foreground" : "text-foreground/90"
      )}>
        {entry.content}
      </p>
    </div>
  );
});

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
