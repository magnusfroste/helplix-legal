import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ReportType = 'timeline' | 'legal' | 'interpretation';

export interface ReportTemplate {
  id: string;
  country_code: string;
  report_type: ReportType;
  template_text: string;
  section_header: string;
  created_at: string;
  updated_at: string;
}

export const REPORT_TYPES: { key: ReportType; label: string; labelSv: string }[] = [
  { key: 'timeline', label: 'Timeline', labelSv: 'Tidslinje' },
  { key: 'legal', label: 'Legal Overview', labelSv: 'Juridisk Översikt' },
  { key: 'interpretation', label: 'Interpretation', labelSv: 'Juridisk Tolkning' },
];

interface UseReportTemplatesReturn {
  templates: ReportTemplate[];
  isLoading: boolean;
  error: string | null;
  getTemplate: (countryCode: string, reportType: ReportType) => ReportTemplate | undefined;
  updateTemplate: (countryCode: string, reportType: ReportType, updates: { template_text?: string; section_header?: string }) => Promise<boolean>;
  refreshTemplates: () => Promise<void>;
}

export function useReportTemplates(): UseReportTemplatesReturn {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('report_templates')
        .select('*')
        .order('country_code')
        .order('report_type');

      if (fetchError) {
        console.error('Error fetching report templates:', fetchError);
        setError(fetchError.message);
      } else {
        setTemplates((data || []) as ReportTemplate[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching report templates:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTemplate = useCallback((countryCode: string, reportType: ReportType): ReportTemplate | undefined => {
    return templates.find(
      t => t.country_code === countryCode && t.report_type === reportType
    );
  }, [templates]);

  const updateTemplate = useCallback(async (
    countryCode: string, 
    reportType: ReportType, 
    updates: { template_text?: string; section_header?: string }
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('report_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('country_code', countryCode)
        .eq('report_type', reportType);

      if (updateError) {
        console.error('Error updating report template:', updateError);
        setError(updateError.message);
        return false;
      }

      // Update local state
      setTemplates(prev => prev.map(t =>
        t.country_code === countryCode && t.report_type === reportType
          ? { ...t, ...updates, updated_at: new Date().toISOString() }
          : t
      ));

      return true;
    } catch (err) {
      console.error('Unexpected error updating report template:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  useEffect(() => {
    refreshTemplates();
  }, [refreshTemplates]);

  return { templates, isLoading, error, getTemplate, updateTemplate, refreshTemplates };
}
