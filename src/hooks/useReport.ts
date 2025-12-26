import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { LogEntry, CountryCode } from '@/types/helplix';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface Report {
  id: string;
  session_id: string;
  user_id: string | null;
  timeline_report: string | null;
  legal_report: string | null;
  interpretation_report: string | null;
  entries_count: number;
  created_at: string;
  updated_at: string;
}

export type ReportType = 'timeline' | 'legal' | 'interpretation' | 'both' | 'all';

interface UseReportOptions {
  sessionId: string | null;
  userId?: string;
  entries: LogEntry[];
  country?: CountryCode;
  language?: string;
  caseSearchEnabled?: boolean;
}

interface GenerateReportResult {
  timeline: string | null;
  legal: string | null;
  interpretation: string | null;
  caseLawIncluded?: boolean;
}

export function useReport({ 
  sessionId, 
  userId, 
  entries,
  country,
  language,
  caseSearchEnabled = false,
}: UseReportOptions) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<ReportType | null>(null);
  const [isSearchingCaseLaw, setIsSearchingCaseLaw] = useState(false);
  
  // Local state for report content
  const [timelineReport, setTimelineReport] = useState<string | null>(null);
  const [legalReport, setLegalReport] = useState<string | null>(null);
  const [interpretationReport, setInterpretationReport] = useState<string | null>(null);

  const currentEntriesCount = entries.length;

  // Check if new entries have been added since report was generated
  const hasNewEntries = report ? currentEntriesCount > report.entries_count : false;

  // Load existing report for session
  const loadReport = useCallback(async () => {
    if (!sessionId) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setReport(data as Report);
        setTimelineReport(data.timeline_report);
        setLegalReport(data.legal_report);
        setInterpretationReport(data.interpretation_report);
      }
      return data as Report | null;
    } catch (error) {
      console.error('Failed to load report:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Save or update report
  const saveReport = useCallback(async (
    timeline: string | null,
    legal: string | null,
    interpretation?: string | null
  ) => {
    if (!sessionId) return null;

    setIsSaving(true);
    try {
      if (report?.id) {
        // Update existing report
        const updateData: Record<string, unknown> = {
          timeline_report: timeline,
          legal_report: legal,
          entries_count: currentEntriesCount,
        };
        if (interpretation !== undefined) {
          updateData.interpretation_report = interpretation;
        }
        
        const { data, error } = await supabase
          .from('reports')
          .update(updateData)
          .eq('id', report.id)
          .select()
          .single();

        if (error) throw error;
        setReport(data as Report);
        return data as Report;
      } else {
        // Create new report
        const { data, error } = await supabase
          .from('reports')
          .insert({
            session_id: sessionId,
            user_id: userId || null,
            timeline_report: timeline,
            legal_report: legal,
            interpretation_report: interpretation || null,
            entries_count: currentEntriesCount,
          })
          .select()
          .single();

        if (error) throw error;
        setReport(data as Report);
        return data as Report;
      }
    } catch (error) {
      console.error('Failed to save report:', error);
      toast.error('Could not save report');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, userId, currentEntriesCount, report?.id]);

  // Parse report response into sections
  const parseReportSections = useCallback((
    reportText: string,
    reportType: ReportType
  ): GenerateReportResult => {
    let timeline: string | null = null;
    let legal: string | null = null;
    let interpretation: string | null = null;

    if (reportType === 'all') {
      // Split into three sections - support multiple languages
      const timelinePatterns = [
        /## Linha do Tempo Cronológica[\s\S]*?(?=## Visão Geral Jurídica|## Resumen Legal|## Juridisk Översikt|## Legal Overview|## Juridisch Overzicht|$)/i,
        /## Línea de Tiempo Cronológica[\s\S]*?(?=## Visão Geral Jurídica|## Resumen Legal|## Juridisk Översikt|## Legal Overview|## Juridisch Overzicht|$)/i,
        /## Kronologisk Tidslinje[\s\S]*?(?=## Visão Geral Jurídica|## Resumen Legal|## Juridisk Översikt|## Legal Overview|## Juridisch Overzicht|$)/i,
        /## Chronological Timeline[\s\S]*?(?=## Visão Geral Jurídica|## Resumen Legal|## Juridisk Översikt|## Legal Overview|## Juridisch Overzicht|$)/i,
        /## Chronologische Tijdlijn[\s\S]*?(?=## Visão Geral Jurídica|## Resumen Legal|## Juridisk Översikt|## Legal Overview|## Juridisch Overzicht|$)/i,
      ];
      const legalPatterns = [
        /## Visão Geral Jurídica[\s\S]*?(?=## Interpretação Jurídica|## Interpretación Legal|## Juridisk Tolkning|## Legal Interpretation|## Juridische Interpretatie|$)/i,
        /## Resumen Legal[\s\S]*?(?=## Interpretação Jurídica|## Interpretación Legal|## Juridisk Tolkning|## Legal Interpretation|## Juridische Interpretatie|$)/i,
        /## Juridisk Översikt[\s\S]*?(?=## Interpretação Jurídica|## Interpretación Legal|## Juridisk Tolkning|## Legal Interpretation|## Juridische Interpretatie|$)/i,
        /## Legal Overview[\s\S]*?(?=## Interpretação Jurídica|## Interpretación Legal|## Juridisk Tolkning|## Legal Interpretation|## Juridische Interpretatie|$)/i,
        /## Juridisch Overzicht[\s\S]*?(?=## Interpretação Jurídica|## Interpretación Legal|## Juridisk Tolkning|## Legal Interpretation|## Juridische Interpretatie|$)/i,
      ];
      const interpretationPatterns = [
        /## Interpretação Jurídica[\s\S]*/i,
        /## Interpretación Legal[\s\S]*/i,
        /## Juridisk Tolkning[\s\S]*/i,
        /## Legal Interpretation[\s\S]*/i,
        /## Juridische Interpretatie[\s\S]*/i,
      ];
      
      let timelineMatch = null;
      let legalMatch = null;
      let interpretationMatch = null;
      
      for (const pattern of timelinePatterns) {
        timelineMatch = reportText.match(pattern);
        if (timelineMatch) break;
      }
      for (const pattern of legalPatterns) {
        legalMatch = reportText.match(pattern);
        if (legalMatch) break;
      }
      for (const pattern of interpretationPatterns) {
        interpretationMatch = reportText.match(pattern);
        if (interpretationMatch) break;
      }
      
      timeline = timelineMatch ? timelineMatch[0].trim() : null;
      legal = legalMatch ? legalMatch[0].trim() : null;
      interpretation = interpretationMatch ? interpretationMatch[0].trim() : null;
    } else if (reportType === 'both') {
      // Split using legal overview header in any language
      const splitPatterns = [
        /(##\s*Visão Geral Jurídica)/i,
        /(##\s*Resumen Legal)/i,
        /(##\s*Juridisk Översikt)/i,
        /(##\s*Legal Overview)/i,
        /(##\s*Juridisch Overzicht)/i,
      ];
      
      let parts: string[] = [];
      for (const pattern of splitPatterns) {
        parts = reportText.split(pattern);
        if (parts.length >= 2) break;
      }
      
      if (parts.length >= 2) {
        timeline = parts[0].trim();
        legal = parts.slice(1).join('').trim();
      } else {
        // Fallback: find any second ## header
        const headerMatches = [...reportText.matchAll(/^##\s+[^\n]+/gm)];
        if (headerMatches.length >= 2) {
          const secondHeaderIndex = headerMatches[1].index || 0;
          timeline = reportText.substring(0, secondHeaderIndex).trim();
          legal = reportText.substring(secondHeaderIndex).trim();
        } else {
          timeline = reportText;
          legal = null;
          console.warn('Could not split report into sections');
        }
      }
    } else if (reportType === 'timeline') {
      timeline = reportText;
    } else if (reportType === 'legal') {
      legal = reportText;
    } else if (reportType === 'interpretation') {
      interpretation = reportText;
    }

    return { timeline, legal, interpretation };
  }, []);

  // Generate report via edge function
  const generateReport = useCallback(async (reportType: ReportType): Promise<boolean> => {
    if (entries.length === 0) return false;

    setIsGenerating(true);
    setGeneratingType(reportType);
    
    const willSearchCases = caseSearchEnabled && (reportType === 'interpretation' || reportType === 'all');
    
    if (willSearchCases) {
      setIsSearchingCaseLaw(true);
    }

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
            country,
            language,
            enableCaseSearch: caseSearchEnabled,
          }),
        }
      );

      setIsSearchingCaseLaw(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data = await response.json();
      
      // Parse the report into sections
      const parsed = parseReportSections(data.report, reportType);
      
      // Update local state with new/existing values
      const newTimeline = parsed.timeline ?? timelineReport;
      const newLegal = parsed.legal ?? legalReport;
      const newInterpretation = parsed.interpretation ?? interpretationReport;
      
      if (parsed.timeline !== null) setTimelineReport(parsed.timeline);
      if (parsed.legal !== null) setLegalReport(parsed.legal);
      if (parsed.interpretation !== null) setInterpretationReport(parsed.interpretation);

      // Save to database
      await saveReport(newTimeline, newLegal, newInterpretation);
      
      return !!data.caseLawIncluded;
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate report');
      return false;
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
      setIsSearchingCaseLaw(false);
    }
  }, [entries, country, language, caseSearchEnabled, timelineReport, legalReport, interpretationReport, parseReportSections, saveReport]);

  // Get combined report text for sharing/playing
  const getFullReportText = useCallback((): string => {
    return [timelineReport, legalReport, interpretationReport].filter(Boolean).join('\n\n---\n\n');
  }, [timelineReport, legalReport, interpretationReport]);

  // Check if any report content exists
  const hasReport = !!(timelineReport || legalReport || interpretationReport);

  // Load report on mount or when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadReport();
    } else {
      setReport(null);
      setTimelineReport(null);
      setLegalReport(null);
      setInterpretationReport(null);
    }
  }, [sessionId]);

  return {
    // Persisted report data
    report,
    isLoading,
    isSaving,
    hasNewEntries,
    
    // Report content
    timelineReport,
    legalReport,
    interpretationReport,
    hasReport,
    
    // Generation state
    isGenerating,
    generatingType,
    isSearchingCaseLaw,
    
    // Actions
    loadReport,
    saveReport,
    generateReport,
    getFullReportText,
    setReport,
  };
}
