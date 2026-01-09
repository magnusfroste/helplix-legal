import { memo, CSSProperties, ReactElement, useRef } from 'react';
import { List, useDynamicRowHeight } from 'react-window';
import { Download, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LogEntry, CountryCode } from '@/types/helplix';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LogScreenProps {
  entries: LogEntry[];
  country: CountryCode | null;
  onImportEntries?: (entries: LogEntry[]) => void;
}

const VIRTUALIZATION_THRESHOLD = 20;
const DEFAULT_ROW_HEIGHT = 72;

export const LogScreen = memo(function LogScreen({ entries, country, onImportEntries }: LogScreenProps) {
  const t = useTranslation(country);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dynamicRowHeight = useDynamicRowHeight({ 
    defaultRowHeight: DEFAULT_ROW_HEIGHT,
    key: entries.length 
  });

  const handleDownload = () => {
    if (entries.length === 0) {
      toast.error('Ingen logg att ladda ned');
      return;
    }
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      entries: entries.map(e => ({
        id: e.id,
        type: e.type,
        content: e.content,
        timestamp: e.timestamp.toISOString(),
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `helplix-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Logg nedladdad');
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.entries && Array.isArray(data.entries)) {
          const importedEntries: LogEntry[] = data.entries.map((e: any) => ({
            id: e.id || crypto.randomUUID(),
            type: e.type,
            content: e.content,
            timestamp: new Date(e.timestamp),
          }));
          onImportEntries?.(importedEntries);
          toast.success(`${importedEntries.length} poster importerade`);
        } else {
          toast.error('Ogiltigt filformat');
        }
      } catch {
        toast.error('Kunde inte läsa filen');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 text-center">
        <p className="text-muted-foreground">
          {t.log.noConversation}
        </p>
        {onImportEntries && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpload}
              className="text-xs text-muted-foreground"
            >
              <Upload className="h-3 w-3 mr-1" />
              Importera
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {entries.length} {t.log.entries}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            title="Ladda ned logg"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          {onImportEntries && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUpload}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              title="Ladda upp logg"
            >
              <Upload className="h-3.5 w-3.5" />
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
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
  );
});

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
