import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  TestCase, 
  TestRun, 
  TestScore, 
  TestCaseWithLatestRun,
  TestBenchStats 
} from '@/types/testbench';

interface UseTestBenchReturn {
  testCases: TestCaseWithLatestRun[];
  isLoading: boolean;
  error: string | null;
  stats: TestBenchStats;
  fetchTestCases: (filters?: TestCaseFilters) => Promise<void>;
  runTest: (testCaseId: string) => Promise<TestRun | null>;
  evaluateTest: (testRunId: string, depth?: 'quick' | 'thorough') => Promise<TestScore | null>;
  researchCases: (countryCode: string, caseType: string, searchTerms?: string) => Promise<TestCase[] | null>;
  createTestCase: (testCase: Partial<TestCase>) => Promise<TestCase | null>;
  updateTestCase: (id: string, updates: Partial<TestCase>) => Promise<boolean>;
  deleteTestCase: (id: string) => Promise<boolean>;
}

interface TestCaseFilters {
  countryCode?: string;
  caseType?: string;
  difficulty?: string;
  isActive?: boolean;
}

export function useTestBench(): UseTestBenchReturn {
  const [testCases, setTestCases] = useState<TestCaseWithLatestRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TestBenchStats>({
    totalTests: 0,
    avgOverallScore: 0,
    avgLegalAccuracy: 0,
    avgFactCoverage: 0
  });

  const fetchTestCases = useCallback(async (filters?: TestCaseFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query with filters
      let query = supabase
        .from('test_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.countryCode) {
        query = query.eq('country_code', filters.countryCode);
      }
      if (filters?.caseType) {
        query = query.eq('case_type', filters.caseType);
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data: cases, error: casesError } = await query;

      if (casesError) throw casesError;

      // Fetch latest runs for each test case
      const casesWithRuns: TestCaseWithLatestRun[] = await Promise.all(
        (cases || []).map(async (tc) => {
          const { data: runs } = await supabase
            .from('test_runs')
            .select('*')
            .eq('test_case_id', tc.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const latestRun = runs?.[0] as unknown as TestRun | undefined;
          let score: TestScore | undefined;

          if (latestRun) {
            const { data: scores } = await supabase
              .from('test_scores')
              .select('*')
              .eq('test_run_id', latestRun.id)
              .limit(1);
            
            score = scores?.[0] as unknown as TestScore | undefined;
          }

          return {
            ...tc,
            latest_run: latestRun ? { ...latestRun, score } : undefined
          } as TestCaseWithLatestRun;
        })
      );

      setTestCases(casesWithRuns);

      // Calculate stats
      const allScores = casesWithRuns
        .filter(tc => tc.latest_run?.score)
        .map(tc => tc.latest_run!.score!);

      if (allScores.length > 0) {
        setStats({
          totalTests: allScores.length,
          avgOverallScore: Math.round(allScores.reduce((sum, s) => sum + s.overall_score, 0) / allScores.length),
          avgLegalAccuracy: Math.round(allScores.reduce((sum, s) => sum + s.legal_accuracy, 0) / allScores.length),
          avgFactCoverage: Math.round(allScores.reduce((sum, s) => sum + s.fact_coverage, 0) / allScores.length)
        });
      }
    } catch (err) {
      console.error('Error fetching test cases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch test cases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runTest = useCallback(async (testCaseId: string): Promise<TestRun | null> => {
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error: fnError } = await supabase.functions.invoke('testbench-run', {
        body: { test_case_id: testCaseId }
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || 'Test run failed');

      return data as TestRun;
    } catch (err) {
      console.error('Error running test:', err);
      setError(err instanceof Error ? err.message : 'Failed to run test');
      return null;
    }
  }, []);

  const evaluateTest = useCallback(async (
    testRunId: string, 
    depth: 'quick' | 'thorough' = 'thorough'
  ): Promise<TestScore | null> => {
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error: fnError } = await supabase.functions.invoke('testbench-evaluate', {
        body: { test_run_id: testRunId, evaluation_depth: depth }
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || 'Evaluation failed');

      return data as TestScore;
    } catch (err) {
      console.error('Error evaluating test:', err);
      setError(err instanceof Error ? err.message : 'Failed to evaluate test');
      return null;
    }
  }, []);

  const researchCases = useCallback(async (
    countryCode: string,
    caseType: string,
    searchTerms?: string
  ): Promise<TestCase[] | null> => {
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error: fnError } = await supabase.functions.invoke('testbench-research', {
        body: { country_code: countryCode, case_type: caseType, search_terms: searchTerms }
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || 'Research failed');

      return data.suggested_test_cases as TestCase[];
    } catch (err) {
      console.error('Error researching cases:', err);
      setError(err instanceof Error ? err.message : 'Failed to research cases');
      return null;
    }
  }, []);

  const createTestCase = useCallback(async (testCase: Partial<TestCase>): Promise<TestCase | null> => {
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Prepare the insert object without created_by since schema might not have it
      const insertData = {
        title: testCase.title,
        country_code: testCase.country_code,
        case_type: testCase.case_type,
        difficulty: testCase.difficulty,
        source: testCase.source,
        source_url: testCase.source_url,
        scenario: testCase.scenario,
        simulated_answers: testCase.simulated_answers,
        expected_facts: testCase.expected_facts,
        expected_legal_issues: testCase.expected_legal_issues,
        expected_timeline: testCase.expected_timeline,
        scoring_rubric: testCase.scoring_rubric,
        is_active: testCase.is_active
      };

      const { data, error: insertError } = await supabase
        .from('test_cases')
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;
      return data as unknown as TestCase;
    } catch (err) {
      console.error('Error creating test case:', err);
      setError(err instanceof Error ? err.message : 'Failed to create test case');
      return null;
    }
  }, []);

  const updateTestCase = useCallback(async (id: string, updates: Partial<TestCase>): Promise<boolean> => {
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('test_cases')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error updating test case:', err);
      setError(err instanceof Error ? err.message : 'Failed to update test case');
      return false;
    }
  }, []);

  const deleteTestCase = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('test_cases')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error deleting test case:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete test case');
      return false;
    }
  }, []);

  return {
    testCases,
    isLoading,
    error,
    stats,
    fetchTestCases,
    runTest,
    evaluateTest,
    researchCases,
    createTestCase,
    updateTestCase,
    deleteTestCase
  };
}
