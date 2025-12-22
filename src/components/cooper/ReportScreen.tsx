import { FileText, Clock, Download, Share2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LogEntry } from '@/types/cooper';

interface ReportScreenProps {
  entries: LogEntry[];
  onGenerateReport?: () => void;
  onPlayReport?: () => void;
  onExportPdf?: () => void;
  onShare?: () => void;
}

export function ReportScreen({ 
  entries,
  onGenerateReport,
  onPlayReport,
  onExportPdf,
  onShare,
}: ReportScreenProps) {
  const hasEntries = entries.length > 0;

  if (!hasEntries) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-cooper-xl font-semibold text-foreground mb-2">
          No report yet
        </h2>
        <p className="text-cooper-base text-muted-foreground">
          Complete a conversation with Cooper to generate your case report.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <header className="px-4 py-4 border-b border-border">
        <h1 className="text-cooper-2xl font-bold text-foreground">
          Case Report
        </h1>
        <p className="text-cooper-base text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Generated from {entries.length} entries
        </p>
      </header>

      {/* Action Buttons */}
      <div className="px-4 py-3 border-b border-border flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1"
          onClick={onPlayReport}
        >
          <Volume2 className="h-5 w-5 mr-2" />
          Listen
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1"
          onClick={onExportPdf}
        >
          <Download className="h-5 w-5 mr-2" />
          PDF
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1"
          onClick={onShare}
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Timeline Section */}
          <section>
            <h2 className="text-cooper-lg font-semibold text-foreground mb-3">
              Chronological Timeline
            </h2>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-cooper-base text-muted-foreground italic">
                Report generation coming soon. This will show a chronological summary of events based on your conversation with Cooper.
              </p>
            </div>
          </section>

          {/* Legal Overview Section */}
          <section>
            <h2 className="text-cooper-lg font-semibold text-foreground mb-3">
              Legal Overview
            </h2>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-cooper-base text-muted-foreground italic">
                Legal analysis coming soon. This will identify potential legal issues relevant to Brazilian law.
              </p>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
