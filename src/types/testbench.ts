export interface TestCase {
  id: string;
  country_code: string;
  case_type: string;
  title: string;
  source: 'synthetic' | 'real' | 'research';
  source_url?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  scenario: {
    description: string;
    key_facts: string[];
  };
  simulated_answers: string[];
  expected_facts: Array<{ fact: string; weight: number }>;
  expected_legal_issues: Array<{ issue: string; weight: number }>;
  expected_timeline: Array<{ event: string; date: string }>;
  scoring_rubric: {
    fact_coverage: number;
    legal_accuracy: number;
    timeline_accuracy: number;
    question_quality: number;
    language_quality: number;
    professionalism: number;
  };
  created_by?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestRun {
  id: string;
  test_case_id: string;
  ai_config_snapshot: Record<string, unknown>;
  conversation_log: ConversationMessage[];
  generated_report: {
    timeline?: string;
    legal?: string;
    interpretation?: string;
    error?: string;
  };
  started_at: string;
  completed_at?: string | null;
  status: 'running' | 'completed' | 'failed' | 'evaluating';
  run_by?: string | null;
  created_at: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  phase?: string;
}

export interface TestScore {
  id: string;
  test_run_id: string;
  overall_score: number;
  fact_coverage: number;
  legal_accuracy: number;
  timeline_accuracy: number;
  language_quality: number;
  professionalism: number;
  question_quality: number;
  gap_detection: number;
  evaluation_details: {
    facts_found?: string[];
    facts_missing?: string[];
    legal_issues_identified?: string[];
    legal_issues_missed?: string[];
    timeline_events_captured?: string[];
    timeline_events_missed?: string[];
    strengths?: string[];
    weaknesses?: string[];
    improvement_suggestions?: string[];
  };
  evaluator_notes?: string | null;
  created_at: string;
}

export interface TestBenchmark {
  id: string;
  benchmark_date: string;
  country_code: string;
  case_type: string;
  avg_overall_score: number;
  avg_fact_coverage: number;
  avg_legal_accuracy: number;
  tests_run: number;
  ai_config_snapshot: Record<string, unknown>;
  created_at: string;
}

export interface TestCaseWithLatestRun extends TestCase {
  latest_run?: TestRun & { score?: TestScore };
}

export interface TestBenchStats {
  totalTests: number;
  avgOverallScore: number;
  avgLegalAccuracy: number;
  avgFactCoverage: number;
}

export const COUNTRY_FLAGS: Record<string, string> = {
  'SE': '🇸🇪',
  'BR': '🇧🇷',
  'MX': '🇲🇽',
  'US': '🇺🇸',
  'NL': '🇳🇱',
  'DO': '🇩🇴'
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  'easy': 'bg-green-500/20 text-green-500',
  'medium': 'bg-yellow-500/20 text-yellow-500',
  'hard': 'bg-red-500/20 text-red-500'
};
