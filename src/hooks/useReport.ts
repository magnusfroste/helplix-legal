import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface UseReportOptions {
  sessionId: string | null;
  userId?: string;
  currentEntriesCount: number;
}

export function useReport({ sessionId, userId, currentEntriesCount }: UseReportOptions) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    timelineReport: string | null,
    legalReport: string | null,
    interpretationReport?: string | null
  ) => {
    if (!sessionId) return null;

    setIsSaving(true);
    try {
      if (report?.id) {
        // Update existing report
        const updateData: Record<string, unknown> = {
          timeline_report: timelineReport,
          legal_report: legalReport,
          entries_count: currentEntriesCount,
        };
        if (interpretationReport !== undefined) {
          updateData.interpretation_report = interpretationReport;
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
            timeline_report: timelineReport,
            legal_report: legalReport,
            interpretation_report: interpretationReport || null,
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

  // Load report on mount or when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadReport();
    } else {
      setReport(null);
    }
  }, [sessionId]);

  return {
    report,
    isLoading,
    isSaving,
    hasNewEntries,
    loadReport,
    saveReport,
    setReport,
  };
}
