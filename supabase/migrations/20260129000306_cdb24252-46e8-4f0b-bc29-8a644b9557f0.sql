-- =============================================
-- TESTBÄNK DATABAS-SCHEMA
-- =============================================

-- 1. test_cases - Testfall med förväntade resultat
CREATE TABLE public.test_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  case_type text NOT NULL,
  title text NOT NULL,
  source text NOT NULL DEFAULT 'synthetic' CHECK (source IN ('synthetic', 'real', 'research')),
  source_url text,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  scenario jsonb NOT NULL DEFAULT '{}',
  simulated_answers jsonb NOT NULL DEFAULT '[]',
  expected_facts jsonb NOT NULL DEFAULT '[]',
  expected_legal_issues jsonb NOT NULL DEFAULT '[]',
  expected_timeline jsonb NOT NULL DEFAULT '[]',
  scoring_rubric jsonb NOT NULL DEFAULT '{"fact_coverage": 0.25, "legal_accuracy": 0.30, "timeline_accuracy": 0.15, "question_quality": 0.15, "language_quality": 0.10, "professionalism": 0.05}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. test_runs - Testkörningar och resultat
CREATE TABLE public.test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id uuid NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
  ai_config_snapshot jsonb NOT NULL DEFAULT '{}',
  conversation_log jsonb NOT NULL DEFAULT '[]',
  generated_report jsonb NOT NULL DEFAULT '{}',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'evaluating')),
  run_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. test_scores - Detaljerade betyg per kategori
CREATE TABLE public.test_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id uuid NOT NULL REFERENCES public.test_runs(id) ON DELETE CASCADE,
  overall_score integer NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  fact_coverage integer NOT NULL DEFAULT 0 CHECK (fact_coverage >= 0 AND fact_coverage <= 100),
  legal_accuracy integer NOT NULL DEFAULT 0 CHECK (legal_accuracy >= 0 AND legal_accuracy <= 100),
  timeline_accuracy integer NOT NULL DEFAULT 0 CHECK (timeline_accuracy >= 0 AND timeline_accuracy <= 100),
  language_quality integer NOT NULL DEFAULT 0 CHECK (language_quality >= 0 AND language_quality <= 100),
  professionalism integer NOT NULL DEFAULT 0 CHECK (professionalism >= 0 AND professionalism <= 100),
  question_quality integer NOT NULL DEFAULT 0 CHECK (question_quality >= 0 AND question_quality <= 100),
  gap_detection integer NOT NULL DEFAULT 0 CHECK (gap_detection >= 0 AND gap_detection <= 100),
  evaluation_details jsonb NOT NULL DEFAULT '{}',
  evaluator_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. test_benchmarks - Jämförelsedata över tid
CREATE TABLE public.test_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_date date NOT NULL DEFAULT CURRENT_DATE,
  country_code text NOT NULL,
  case_type text NOT NULL,
  avg_overall_score decimal(5,2) NOT NULL DEFAULT 0,
  avg_fact_coverage decimal(5,2) NOT NULL DEFAULT 0,
  avg_legal_accuracy decimal(5,2) NOT NULL DEFAULT 0,
  tests_run integer NOT NULL DEFAULT 0,
  ai_config_snapshot jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_benchmarks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Admin only for write, read for admins
-- =============================================

-- test_cases policies
CREATE POLICY "Only admins can read test cases"
  ON public.test_cases FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert test cases"
  ON public.test_cases FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update test cases"
  ON public.test_cases FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete test cases"
  ON public.test_cases FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- test_runs policies
CREATE POLICY "Only admins can read test runs"
  ON public.test_runs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert test runs"
  ON public.test_runs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update test runs"
  ON public.test_runs FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete test runs"
  ON public.test_runs FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- test_scores policies
CREATE POLICY "Only admins can read test scores"
  ON public.test_scores FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert test scores"
  ON public.test_scores FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update test scores"
  ON public.test_scores FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete test scores"
  ON public.test_scores FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- test_benchmarks policies
CREATE POLICY "Only admins can read test benchmarks"
  ON public.test_benchmarks FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert test benchmarks"
  ON public.test_benchmarks FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update test benchmarks"
  ON public.test_benchmarks FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete test benchmarks"
  ON public.test_benchmarks FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_test_cases_country ON public.test_cases(country_code);
CREATE INDEX idx_test_cases_type ON public.test_cases(case_type);
CREATE INDEX idx_test_cases_active ON public.test_cases(is_active);
CREATE INDEX idx_test_runs_case ON public.test_runs(test_case_id);
CREATE INDEX idx_test_runs_status ON public.test_runs(status);
CREATE INDEX idx_test_scores_run ON public.test_scores(test_run_id);
CREATE INDEX idx_test_benchmarks_date ON public.test_benchmarks(benchmark_date);
CREATE INDEX idx_test_benchmarks_country ON public.test_benchmarks(country_code);

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_test_cases_updated_at
  BEFORE UPDATE ON public.test_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INSERT FEATURE FLAG
-- =============================================

INSERT INTO public.feature_flags (feature_key, enabled, description)
VALUES ('testbench_enabled', false, 'Aktiverar testbänken för AI-kvalitetskontroll')
ON CONFLICT (feature_key) DO NOTHING;