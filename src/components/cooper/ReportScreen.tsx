import { useState, useCallback, useEffect } from 'react';
import { FileText, Clock, Download, Share2, Volume2, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LogEntry } from '@/types/cooper';
import { toast } from 'sonner';
import { useReport } from '@/hooks/useReport';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface ReportScreenProps {
  entries: LogEntry[];
  sessionId: string | null;
  userId?: string;
  onPlayReport?: (text: string) => void;
}

export function ReportScreen({ 
  entries,
  sessionId,
  userId,
  onPlayReport,
}: ReportScreenProps) {
  const [timelineReport, setTimelineReport] = useState<string | null>(null);
  const [legalReport, setLegalReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  const { 
    report, 
    isLoading, 
    isSaving,
    hasNewEntries, 
    saveReport 
  } = useReport({ 
    sessionId, 
    userId, 
    currentEntriesCount: entries.length 
  });

  const hasEntries = entries.length > 0;

  // Load saved report content when report loads
  useEffect(() => {
    if (report) {
      setTimelineReport(report.timeline_report);
      setLegalReport(report.legal_report);
    }
  }, [report]);

  const generateReport = useCallback(async (reportType: 'timeline' | 'legal' | 'both') => {
    if (!hasEntries) return;

    setIsGenerating(true);
    setGeneratingType(reportType);

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/cooper-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            entries: entries.map(e => ({
              type: e.type,
              content: e.content,
              timestamp: e.timestamp.toISOString(),
            })),
            reportType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data = await response.json();
      
      let newTimeline = timelineReport;
      let newLegal = legalReport;

      if (reportType === 'both') {
        // Split using Swedish header "Juridisk Översikt"
        const splitPattern = /(##\s*Juridisk Översikt)/i;
        const parts = data.report.split(splitPattern);
        
        if (parts.length >= 2) {
          newTimeline = parts[0].trim();
          newLegal = parts.slice(1).join('').trim();
        } else {
          // Fallback: find any second ## header
          const headerMatches = [...data.report.matchAll(/^##\s+[^\n]+/gm)];
          if (headerMatches.length >= 2) {
            const secondHeaderIndex = headerMatches[1].index || 0;
            newTimeline = data.report.substring(0, secondHeaderIndex).trim();
            newLegal = data.report.substring(secondHeaderIndex).trim();
          } else {
            newTimeline = data.report;
            newLegal = null;
            console.warn('Could not split report into sections');
          }
        }
        setTimelineReport(newTimeline);
        setLegalReport(newLegal);
      } else if (reportType === 'timeline') {
        newTimeline = data.report;
        setTimelineReport(newTimeline);
      } else {
        newLegal = data.report;
        setLegalReport(newLegal);
      }

      // Save to database
      await saveReport(newTimeline, newLegal);
      
      toast.success('Rapport genererad och sparad');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  }, [entries, hasEntries, timelineReport, legalReport, saveReport]);

  const handleExportPdf = useCallback(() => {
    if (!timelineReport && !legalReport) {
      toast.error('Generate a report first');
      return;
    }

    // Create a printable version
    const content = `
      <html>
        <head>
          <title>Cooper Legal Report</title>
          <style>
            body { font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            h1 { color: #1a1a1a; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #333; margin-top: 30px; }
            h3 { color: #555; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            .section { margin-bottom: 30px; }
            .timestamp { color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <h1>Cooper Legal Documentation Report</h1>
          <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
          ${timelineReport ? `<div class="section">${formatMarkdownToHtml(timelineReport)}</div>` : ''}
          ${legalReport ? `<div class="section">${formatMarkdownToHtml(legalReport)}</div>` : ''}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  }, [timelineReport, legalReport]);

  const handleShare = useCallback(async () => {
    if (!timelineReport && !legalReport) {
      toast.error('Generate a report first');
      return;
    }

    const shareText = [timelineReport, legalReport].filter(Boolean).join('\n\n---\n\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cooper Legal Report',
          text: shareText,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Report copied to clipboard');
      } catch (error) {
        console.error('Clipboard error:', error);
        toast.error('Could not copy to clipboard');
      }
    }
  }, [timelineReport, legalReport]);

  const handlePlayReport = useCallback(() => {
    const reportText = [timelineReport, legalReport].filter(Boolean).join('\n\n');
    if (reportText && onPlayReport) {
      onPlayReport(reportText);
    } else if (!reportText) {
      toast.error('Generate a report first');
    }
  }, [timelineReport, legalReport, onPlayReport]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-cooper-base text-muted-foreground">Laddar rapport...</p>
      </div>
    );
  }

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

  const hasReport = timelineReport || legalReport;

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-cooper-lg font-bold text-foreground">
            Rapport
          </h1>
          {report && (
            <span className="text-cooper-sm text-muted-foreground">
              {new Date(report.updated_at).toLocaleDateString('sv-SE')}
            </span>
          )}
        </div>
        <p className="text-cooper-sm text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {entries.length} poster
        </p>
      </header>

      {/* New entries banner */}
      {hasNewEntries && hasReport && (
        <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 min-w-0">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="text-cooper-sm truncate">
              +{entries.length - (report?.entries_count || 0)} nya poster
            </span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => generateReport('both')}
            disabled={isGenerating}
            className="shrink-0 h-7 px-2 text-xs"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Uppdatera
              </>
            )}
          </Button>
        </div>
      )}

      {/* Generate Button */}
      {!hasReport && (
        <div className="px-3 py-3 border-b border-border">
          <Button 
            size="default" 
            className="w-full"
            onClick={() => generateReport('both')}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Genererar...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generera rapport
              </>
            )}
          </Button>
        </div>
      )}

      {/* Action Buttons - icon-only on mobile for space efficiency */}
      {hasReport && (
        <div className="px-3 py-2 border-b border-border flex gap-2">
          <Button 
            variant="outline" 
            size="default" 
            className="flex-1 h-10"
            onClick={handlePlayReport}
          >
            <Volume2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Lyssna</span>
          </Button>
          <Button 
            variant="outline" 
            size="default" 
            className="flex-1 h-10"
            onClick={handleExportPdf}
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button 
            variant="outline" 
            size="default" 
            className="flex-1 h-10"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Dela</span>
          </Button>
        </div>
      )}

      {/* Saving indicator */}
      {isSaving && (
        <div className="px-3 py-1.5 bg-muted/50 text-cooper-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sparar...
        </div>
      )}

      <ScrollArea className="flex-1 w-full">
        <div className="px-3 py-3 space-y-4 w-full max-w-full overflow-x-hidden">
          {/* Timeline Section */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-cooper-base font-semibold text-foreground">
                Kronologisk tidslinje
              </h2>
              {timelineReport && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => generateReport('timeline')}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${generatingType === 'timeline' ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            <div className="bg-card border border-border rounded-lg p-3 w-full overflow-hidden">
              {isGenerating && generatingType === 'timeline' ? (
                <div className="flex items-center gap-2 text-muted-foreground text-cooper-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Genererar tidslinje...
                </div>
              ) : timelineReport ? (
                <div className="text-foreground w-full" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  <MarkdownRenderer content={timelineReport} />
                </div>
              ) : (
                <p className="text-cooper-sm text-muted-foreground italic">
                  Klicka "Generera rapport" för att skapa en kronologisk sammanfattning.
                </p>
              )}
            </div>
          </section>

          {/* Legal Overview Section */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-cooper-base font-semibold text-foreground">
                Juridisk översikt
              </h2>
              {legalReport && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => generateReport('legal')}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${generatingType === 'legal' ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            <div className="bg-card border border-border rounded-lg p-3 w-full overflow-hidden">
              {isGenerating && generatingType === 'legal' ? (
                <div className="flex items-center gap-2 text-muted-foreground text-cooper-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Genererar juridisk översikt...
                </div>
              ) : legalReport ? (
                <div className="text-foreground w-full" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  <MarkdownRenderer content={legalReport} />
                </div>
              ) : (
                <p className="text-cooper-sm text-muted-foreground italic">
                  Klicka "Generera rapport" för att identifiera potentiella juridiska frågor.
                </p>
              )}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

// Helper to render inline bold markdown
function renderInlineBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => 
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

// Simple markdown renderer component
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc pl-4 space-y-1.5 my-2">
          {currentList.map((item, i) => (
            <li key={i} className="text-cooper-sm break-words leading-relaxed">
              {renderInlineBold(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} className="text-cooper-base font-semibold mt-3 mb-1.5 break-words">
          {renderInlineBold(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} className="text-cooper-sm font-semibold mt-2 mb-1 break-words">
          {renderInlineBold(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
      flushList();
      elements.push(
        <p key={index} className="font-semibold text-cooper-sm mt-2 break-words">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed.slice(2));
    } else if (trimmed.match(/^\d+\.\s/)) {
      currentList.push(trimmed.replace(/^\d+\.\s/, ''));
    } else if (trimmed) {
      flushList();
      elements.push(
        <p key={index} className="text-cooper-sm my-1 break-words leading-relaxed">
          {renderInlineBold(trimmed)}
        </p>
      );
    }
  });

  flushList();
  return <>{elements}</>;
}

// Helper to convert markdown to basic HTML for PDF
function formatMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.*)$/gim, '<li>$1</li>')
    .replace(/^\* (.*)$/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*)$/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');
}
