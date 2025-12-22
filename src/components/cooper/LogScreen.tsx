import { MessageCircle, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LogEntry } from '@/types/cooper';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogScreenProps {
  entries: LogEntry[];
}

export function LogScreen({ entries }: LogScreenProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 text-center">
        <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-cooper-xl font-semibold text-foreground mb-2">
          No conversation yet
        </h2>
        <p className="text-cooper-base text-muted-foreground">
          Start talking with Cooper to see your conversation log here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <header className="px-4 py-4 border-b border-border">
        <h1 className="text-cooper-2xl font-bold text-foreground">
          Conversation Log
        </h1>
        <p className="text-cooper-base text-muted-foreground">
          {entries.length} entries
        </p>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {entries.map((entry) => (
            <LogEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function LogEntryCard({ entry }: { entry: LogEntry }) {
  const isQuestion = entry.type === 'question';
  
  return (
    <div className={cn(
      "p-4 rounded-lg animate-fade-in",
      isQuestion ? "bg-primary/5 border-l-4 border-primary" : "bg-card border border-border"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isQuestion ? "bg-primary/10" : "bg-muted"
        )}>
          {isQuestion ? (
            <MessageCircle className="h-4 w-4 text-primary" />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-sm font-medium",
              isQuestion ? "text-primary" : "text-muted-foreground"
            )}>
              {isQuestion ? 'Cooper' : 'You'}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(entry.timestamp)}
            </span>
          </div>
          
          <p className="text-cooper-base text-foreground whitespace-pre-wrap">
            {entry.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
