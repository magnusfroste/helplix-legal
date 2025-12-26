import { useState, useCallback } from 'react';
import { FileText, Clock, Download, Share2, Volume2, VolumeX, RefreshCw, Loader2, AlertTriangle, Scale, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LogEntry, CountryCode } from '@/types/helplix';
import { toast } from 'sonner';
import { useReport, type ReportType } from '@/hooks/useReport';
import { useTranslation } from '@/hooks/useTranslation';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { ReportSkeleton } from './skeletons';

interface ReportScreenProps {
  entries: LogEntry[];
  sessionId: string | null;
  userId?: string;
  country?: CountryCode;
  language?: string;
  onPlayReport?: (text: string) => void;
  onStopReport?: () => void;
  isPlaying?: boolean;
}

export function ReportScreen({ 
  entries,
  sessionId,
  userId,
  country,
  language,
  onPlayReport,
  onStopReport,
  isPlaying = false,
}: ReportScreenProps) {
  const t = useTranslation(country || null);
  const { getFlag } = useFeatureFlags();
  const caseSearchEnabled = getFlag('perplexity_case_search');

  const { 
    report,
    isLoading, 
    isSaving,
    hasNewEntries,
    timelineReport,
    legalReport,
    interpretationReport,
    hasReport,
    isGenerating,
    generatingType,
    isSearchingCaseLaw,
    generateReport,
    getFullReportText,
  } = useReport({ 
    sessionId, 
    userId, 
    entries,
    country,
    language,
    caseSearchEnabled,
  });

  const hasEntries = entries.length > 0;

  const handleGenerateReport = useCallback(async (reportType: ReportType) => {
    const caseLawIncluded = await generateReport(reportType);
    if (caseLawIncluded) {
      toast.success('Report generated with case law');
    } else {
      toast.success(t.report.toast.generated);
    }
  }, [generateReport, t.report.toast.generated]);

  const handleExportPdf = useCallback(() => {
    if (!hasReport) {
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
            .disclaimer { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Cooper Legal Documentation Report</h1>
          <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
          ${timelineReport ? `<div class="section">${formatMarkdownToHtml(timelineReport)}</div>` : ''}
          ${legalReport ? `<div class="section">${formatMarkdownToHtml(legalReport)}</div>` : ''}
          ${interpretationReport ? `<div class="section">${formatMarkdownToHtml(interpretationReport)}</div>` : ''}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  }, [hasReport, timelineReport, legalReport, interpretationReport]);

  const handleShare = useCallback(async () => {
    if (!hasReport) {
      toast.error('Generate a report first');
      return;
    }

    const shareText = getFullReportText();

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
  }, [hasReport, getFullReportText]);

  const handleTogglePlayReport = useCallback(() => {
    if (isPlaying) {
      onStopReport?.();
    } else {
      const reportText = getFullReportText();
      if (reportText && onPlayReport) {
        onPlayReport(reportText);
      } else if (!reportText) {
        toast.error('Generate a report first');
      }
    }
  }, [getFullReportText, onPlayReport, onStopReport, isPlaying]);

  if (isLoading) {
    return <ReportSkeleton />;
  }

  if (!hasEntries) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-cooper-xl font-semibold text-foreground mb-2">
          {t.report.noReport}
        </h2>
        <p className="text-cooper-base text-muted-foreground">
          Complete a conversation with Cooper to generate your case report.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-cooper-lg font-bold text-foreground">
            {t.report.title}
          </h1>
          {report && (
            <span className="text-cooper-sm text-muted-foreground">
              {new Date(report.updated_at).toLocaleDateString('sv-SE')}
            </span>
          )}
        </div>
        <p className="text-cooper-sm text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {entries.length} {t.report.entries}
        </p>
      </header>

      {/* New entries banner */}
      {hasNewEntries && hasReport && (
        <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 min-w-0">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="text-cooper-sm truncate">
              +{entries.length - (report?.entries_count || 0)} {t.report.newEntries}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleGenerateReport('all')}
            disabled={isGenerating}
            className="shrink-0 h-7 px-2 text-xs"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                {t.report.update}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Generate Button - always visible */}
      <div className="px-3 py-3 border-b border-border">
        <Button 
          size="default" 
          className="w-full"
          onClick={() => handleGenerateReport('all')}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t.report.generating}
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              {hasReport ? t.report.regenerate : t.report.generate}
            </>
          )}
        </Button>
      </div>

      {/* Action Buttons - icon-only on mobile for space efficiency */}
      {hasReport && (
        <div className="px-3 py-2 border-b border-border flex gap-2">
          <Button 
            variant={isPlaying ? "default" : "outline"}
            size="default" 
            className="flex-1 h-10"
            onClick={handleTogglePlayReport}
          >
            {isPlaying ? (
              <VolumeX className="h-4 w-4 sm:mr-2" />
            ) : (
              <Volume2 className="h-4 w-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{isPlaying ? t.report.stop : t.report.listen}</span>
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
            <span className="hidden sm:inline">{t.report.share}</span>
          </Button>
        </div>
      )}

      {/* Saving indicator */}
      {isSaving && (
        <div className="px-3 py-1.5 bg-muted/50 text-cooper-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t.report.saving}
        </div>
      )}

      <ScrollArea className="flex-1 w-full">
        <div className="px-3 py-3 space-y-4 w-full max-w-full overflow-x-hidden">
          {/* Timeline Section */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-cooper-base font-semibold text-foreground">
                {t.report.timeline.title}
              </h2>
              {timelineReport && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => handleGenerateReport('timeline')}
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
                  {t.report.timeline.generating}
                </div>
              ) : timelineReport ? (
                <div className="text-foreground w-full" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  <MarkdownRenderer content={timelineReport} />
                </div>
              ) : (
                <p className="text-cooper-sm text-muted-foreground italic">
                  {t.report.timeline.placeholder}
                </p>
              )}
            </div>
          </section>

          {/* Legal Overview Section */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-cooper-base font-semibold text-foreground">
                {t.report.legal.title}
              </h2>
              {legalReport && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => handleGenerateReport('legal')}
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
                  {t.report.legal.generating}
                </div>
              ) : legalReport ? (
                <div className="text-foreground w-full" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  <MarkdownRenderer content={legalReport} />
                </div>
              ) : (
                <p className="text-cooper-sm text-muted-foreground italic">
                  {t.report.legal.placeholder}
                </p>
              )}
            </div>
          </section>

          {/* Legal Interpretation Section */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                <h2 className="text-cooper-base font-semibold text-foreground">
                  {t.report.interpretation.title}
                </h2>
              </div>
              {interpretationReport && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => handleGenerateReport('interpretation')}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${generatingType === 'interpretation' ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            
            {/* Disclaimer Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-cooper-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {t.report.interpretation.disclaimer}
                </p>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-3 w-full overflow-hidden">
              {isGenerating && (generatingType === 'interpretation' || generatingType === 'all') ? (
                <div className="space-y-2">
                  {isSearchingCaseLaw && (
                    <div className="flex items-center gap-2 text-primary text-cooper-sm">
                      <Search className="h-3.5 w-3.5 animate-pulse" />
                      Searching for relevant case law...
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground text-cooper-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t.report.interpretation.generating}
                  </div>
                </div>
              ) : interpretationReport ? (
                <div className="text-foreground w-full" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  <MarkdownRenderer content={interpretationReport} />
                </div>
              ) : (
                <p className="text-cooper-sm text-muted-foreground italic">
                  {t.report.interpretation.placeholder}
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
