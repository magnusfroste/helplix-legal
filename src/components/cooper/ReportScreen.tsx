import { useState, useCallback } from 'react';
import { FileText, Clock, Download, Share2, Volume2, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LogEntry } from '@/types/cooper';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface ReportScreenProps {
  entries: LogEntry[];
  onPlayReport?: (text: string) => void;
}

export function ReportScreen({ 
  entries,
  onPlayReport,
}: ReportScreenProps) {
  const [timelineReport, setTimelineReport] = useState<string | null>(null);
  const [legalReport, setLegalReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  const hasEntries = entries.length > 0;

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
      
      if (reportType === 'both') {
        // Split the report into timeline and legal sections
        const parts = data.report.split(/##\s*Legal Overview|##\s*Visão Jurídica|##\s*Resumen Legal/i);
        if (parts.length >= 2) {
          setTimelineReport(parts[0].trim());
          setLegalReport('## Legal Overview\n' + parts[1].trim());
        } else {
          setTimelineReport(data.report);
          setLegalReport(null);
        }
      } else if (reportType === 'timeline') {
        setTimelineReport(data.report);
      } else {
        setLegalReport(data.report);
      }

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  }, [entries, hasEntries]);

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
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <header className="px-4 py-4 border-b border-border">
        <h1 className="text-cooper-2xl font-bold text-foreground">
          Case Report
        </h1>
        <p className="text-cooper-base text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Based on {entries.length} entries
        </p>
      </header>

      {/* Generate Button */}
      {!hasReport && (
        <div className="px-4 py-4 border-b border-border">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => generateReport('both')}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating report...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Generate Full Report
              </>
            )}
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      {hasReport && (
        <div className="px-4 py-3 border-b border-border flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1"
            onClick={handlePlayReport}
          >
            <Volume2 className="h-5 w-5 mr-2" />
            Listen
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1"
            onClick={handleExportPdf}
          >
            <Download className="h-5 w-5 mr-2" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Timeline Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-cooper-lg font-semibold text-foreground">
                Chronological Timeline
              </h2>
              {timelineReport && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => generateReport('timeline')}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 ${generatingType === 'timeline' ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              {isGenerating && generatingType === 'timeline' ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating timeline...
                </div>
              ) : timelineReport ? (
                <div className="prose prose-sm max-w-none text-foreground">
                  <MarkdownRenderer content={timelineReport} />
                </div>
              ) : (
                <p className="text-cooper-base text-muted-foreground italic">
                  Click "Generate Full Report" to create a chronological summary of events.
                </p>
              )}
            </div>
          </section>

          {/* Legal Overview Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-cooper-lg font-semibold text-foreground">
                Legal Overview
              </h2>
              {legalReport && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => generateReport('legal')}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 ${generatingType === 'legal' ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              {isGenerating && generatingType === 'legal' ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating legal overview...
                </div>
              ) : legalReport ? (
                <div className="prose prose-sm max-w-none text-foreground">
                  <MarkdownRenderer content={legalReport} />
                </div>
              ) : (
                <p className="text-cooper-base text-muted-foreground italic">
                  Click "Generate Full Report" to identify potential legal issues.
                </p>
              )}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
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
        <ul key={`list-${listKey++}`} className="list-disc pl-5 space-y-1 my-2">
          {currentList.map((item, i) => (
            <li key={i} className="text-cooper-base">{item}</li>
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
        <h2 key={index} className="text-cooper-lg font-semibold mt-4 mb-2">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} className="text-cooper-base font-semibold mt-3 mb-1">
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      flushList();
      elements.push(
        <p key={index} className="font-semibold text-cooper-base mt-2">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed.slice(2));
    } else if (trimmed.match(/^\d+\.\s/)) {
      currentList.push(trimmed.replace(/^\d+\.\s/, ''));
    } else if (trimmed) {
      flushList();
      // Handle inline bold
      const parts = trimmed.split(/\*\*(.*?)\*\*/g);
      elements.push(
        <p key={index} className="text-cooper-base my-1">
          {parts.map((part, i) => 
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          )}
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
