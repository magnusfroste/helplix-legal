import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { LogEntry } from '@/types/cooper';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogScreenProps {
  entries: LogEntry[];
}

export const LogScreen = memo(function LogScreen({ entries }: LogScreenProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 text-center">
        <p className="text-muted-foreground">
          No conversation yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <header className="px-4 py-3 border-b border-border flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Log
        </h1>
        <span className="text-xs text-muted-foreground">
          {entries.length} entries
        </span>
      </header>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {entries.map((entry) => (
            <LogEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

const LogEntryCard = memo(function LogEntryCard({ entry }: { entry: LogEntry }) {
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
