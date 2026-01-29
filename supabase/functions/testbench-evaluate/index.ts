import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvaluateRequest {
  test_run_id: string;
  evaluation_depth?: 'quick' | 'thorough';
}

interface TestCase {
  id: string;
  title: string;
  country_code: string;
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
}

interface TestRun {
  id: string;
  test_case_id: string;
  conversation_log: Array<{
    role: string;
    content: string;
    timestamp: string;
    phase?: string;
  }>;
  generated_report: {
    timeline?: string;
    legal?: string;
    interpretation?: string;
  };
}

interface EvaluationScores {
  overall_score: number;
  fact_coverage: number;
  legal_accuracy: number;
  timeline_accuracy: number;
  language_quality: number;
  professionalism: number;
  question_quality: number;
  gap_detection: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Verify admin status
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { test_run_id, evaluation_depth = 'thorough' } = await req.json() as EvaluateRequest;

    if (!test_run_id) {
      return new Response(
        JSON.stringify({ error: 'test_run_id is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Evaluating test run:', test_run_id, 'depth:', evaluation_depth);

    // 1. Load test run
    const { data: testRun, error: runError } = await supabase
      .from('test_runs')
      .select('*')
      .eq('id', test_run_id)
      .single();

    if (runError || !testRun) {
      return new Response(
        JSON.stringify({ error: 'Test run not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to evaluating
    await supabase
      .from('test_runs')
      .update({ status: 'evaluating' })
      .eq('id', test_run_id);

    const run = testRun as TestRun;

    // 2. Load test case
    const { data: testCase, error: caseError } = await supabase
      .from('test_cases')
      .select('*')
      .eq('id', run.test_case_id)
      .single();

    if (caseError || !testCase) {
      return new Response(
        JSON.stringify({ error: 'Test case not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tc = testCase as TestCase;
    console.log('Evaluating against test case:', tc.title);

    // 3. Build evaluation prompt
    const evaluationPrompt = buildEvaluationPrompt(tc, run, evaluation_depth);

    // 4. Call AI for evaluation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: evaluationPrompt.system },
          { role: "user", content: evaluationPrompt.user }
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_evaluation",
            description: "Submit the evaluation scores and feedback",
            parameters: {
              type: "object",
              properties: {
                scores: {
                  type: "object",
                  properties: {
                    fact_coverage: { type: "integer", minimum: 0, maximum: 100 },
                    legal_accuracy: { type: "integer", minimum: 0, maximum: 100 },
                    timeline_accuracy: { type: "integer", minimum: 0, maximum: 100 },
                    language_quality: { type: "integer", minimum: 0, maximum: 100 },
                    professionalism: { type: "integer", minimum: 0, maximum: 100 },
                    question_quality: { type: "integer", minimum: 0, maximum: 100 },
                    gap_detection: { type: "integer", minimum: 0, maximum: 100 }
                  },
                  required: ["fact_coverage", "legal_accuracy", "timeline_accuracy", "language_quality", "professionalism", "question_quality", "gap_detection"]
                },
                evaluation_details: {
                  type: "object",
                  properties: {
                    facts_found: { type: "array", items: { type: "string" } },
                    facts_missing: { type: "array", items: { type: "string" } },
                    legal_issues_identified: { type: "array", items: { type: "string" } },
                    legal_issues_missed: { type: "array", items: { type: "string" } },
                    timeline_events_captured: { type: "array", items: { type: "string" } },
                    timeline_events_missed: { type: "array", items: { type: "string" } },
                    strengths: { type: "array", items: { type: "string" } },
                    weaknesses: { type: "array", items: { type: "string" } },
                    improvement_suggestions: { type: "array", items: { type: "string" } }
                  }
                },
                evaluator_notes: { type: "string" }
              },
              required: ["scores", "evaluation_details", "evaluator_notes"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "submit_evaluation" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI evaluation error:", response.status, errorText);
      throw new Error(`AI evaluation failed: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No evaluation result from AI');
    }

    const evaluationResult = JSON.parse(toolCall.function.arguments);
    const scores = evaluationResult.scores as EvaluationScores;
    
    // Calculate overall score using rubric weights
    const rubric = tc.scoring_rubric;
    const overallScore = Math.round(
      (scores.fact_coverage * rubric.fact_coverage) +
      (scores.legal_accuracy * rubric.legal_accuracy) +
      (scores.timeline_accuracy * rubric.timeline_accuracy) +
      (scores.question_quality * rubric.question_quality) +
      (scores.language_quality * rubric.language_quality) +
      (scores.professionalism * rubric.professionalism)
    );

    console.log('Evaluation complete. Overall score:', overallScore);

    // 5. Save scores to database
    const { data: scoreRecord, error: scoreError } = await supabase
      .from('test_scores')
      .insert({
        test_run_id: run.id,
        overall_score: overallScore,
        fact_coverage: scores.fact_coverage,
        legal_accuracy: scores.legal_accuracy,
        timeline_accuracy: scores.timeline_accuracy,
        language_quality: scores.language_quality,
        professionalism: scores.professionalism,
        question_quality: scores.question_quality,
        gap_detection: scores.gap_detection,
        evaluation_details: evaluationResult.evaluation_details,
        evaluator_notes: evaluationResult.evaluator_notes
      })
      .select()
      .single();

    if (scoreError) {
      console.error('Error saving scores:', scoreError);
      throw new Error('Failed to save evaluation scores');
    }

    // Update test run status
    await supabase
      .from('test_runs')
      .update({ status: 'completed' })
      .eq('id', test_run_id);

    return new Response(
      JSON.stringify({
        success: true,
        test_score_id: scoreRecord.id,
        overall_score: overallScore,
        scores,
        evaluation_details: evaluationResult.evaluation_details,
        evaluator_notes: evaluationResult.evaluator_notes
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Testbench evaluate error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildEvaluationPrompt(testCase: TestCase, testRun: TestRun, depth: 'quick' | 'thorough') {
  const conversationText = testRun.conversation_log
    .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');

  const reportsText = Object.entries(testRun.generated_report)
    .filter(([_, value]) => value && typeof value === 'string')
    .map(([type, content]) => `### ${type.toUpperCase()} REPORT:\n${content}`)
    .join('\n\n---\n\n');

  const hasReports = reportsText.trim().length > 0;

  const expectedFacts = testCase.expected_facts
    .map(f => `- ${f.fact} (weight: ${f.weight})`)
    .join('\n');

  const expectedLegalIssues = testCase.expected_legal_issues
    .map(i => `- ${i.issue} (weight: ${i.weight})`)
    .join('\n');

  const expectedTimeline = testCase.expected_timeline
    .map(t => `- ${t.event} (${t.date})`)
    .join('\n');

  const systemPrompt = `You are an expert legal AI evaluator. Your task is to assess the quality of an AI legal assistant's performance.

## CRITICAL: SEPARATE EVALUATION OF INTERVIEW vs REPORT

The AI's job is divided into TWO DISTINCT PHASES with different goals:

### PHASE 1: INTERVIEW (Conversation)
The AI's role during the interview is to be an EMPATHETIC FACT-GATHERER, NOT a legal advisor.
- The AI should gather facts through skilled questioning
- The AI should build rapport and trust
- The AI should identify information gaps and probe deeper
- The AI should NOT mention specific laws or give legal opinions during the interview
- The AI should maintain a supportive, non-judgmental tone

Evaluate the INTERVIEW on:
1. **FACT COVERAGE (0-100)**: Did the AI's questions successfully elicit all expected facts?
2. **QUESTION QUALITY (0-100)**: Were questions relevant, well-formed, progressive, and empathetic?
3. **GAP DETECTION (0-100)**: Did the AI identify missing information and ask follow-up questions?
4. **PROFESSIONALISM (0-100)**: Empathy, appropriate demeanor, supportive tone during interview.
5. **LANGUAGE QUALITY (0-100)**: Clarity, grammar, natural conversation flow.

### PHASE 2: REPORT (Generated after interview)
The AI's role in the report is to provide LEGAL ANALYSIS based on gathered facts.
- The report should identify applicable laws and regulations
- The report should provide a clear timeline of events
- The report should offer legal interpretation with proper disclaimers
- This is where legal precision matters

Evaluate the REPORT on:
6. **LEGAL ACCURACY (0-100)**: Did the reports correctly identify legal issues, applicable laws, and relevant case law? ${!hasReports ? '(Score 0 if no reports were generated)' : ''}
7. **TIMELINE ACCURACY (0-100)**: How accurately was the chronology captured in the timeline report? ${!hasReports ? '(Score 0 if no reports were generated)' : ''}

${depth === 'thorough' ? `
Be thorough in your analysis. Review each expected item and determine if it was covered.
Provide detailed feedback including:
- Specific facts that were captured vs missed (from INTERVIEW)
- Quality of questioning technique (from INTERVIEW)
- Legal issues correctly identified vs overlooked (from REPORT)
- Timeline events captured vs missed (from REPORT)
- Concrete strengths and weaknesses for each phase
- Actionable improvement suggestions
` : `
Provide a quick assessment focusing on the most important metrics.
`}

IMPORTANT GUIDELINES:
- Do NOT penalize the interview for lacking legal references - that's the REPORT's job
- Do NOT penalize the report for being too "clinical" - that's appropriate for legal analysis
- Score each phase based on its intended purpose
- Be objective and fair, score based on actual performance`;

  const userPrompt = `## TEST CASE: ${testCase.title}
Country: ${testCase.country_code}

## EXPECTED FACTS TO GATHER (evaluate if INTERVIEW elicited these):
${expectedFacts}

## EXPECTED LEGAL ISSUES TO IDENTIFY (evaluate if REPORT covers these):
${expectedLegalIssues}

## EXPECTED TIMELINE EVENTS (evaluate if REPORT captures these):
${expectedTimeline}

---

## INTERVIEW CONVERSATION (evaluate for fact-gathering, empathy, question quality):
${conversationText}

---

## GENERATED REPORTS (evaluate for legal accuracy and timeline precision):
${hasReports ? reportsText : '**NO REPORTS WERE GENERATED** - Score legal_accuracy and timeline_accuracy as 0'}

---

Please evaluate this test run. Remember:
- INTERVIEW metrics: fact_coverage, question_quality, gap_detection, professionalism, language_quality
- REPORT metrics: legal_accuracy, timeline_accuracy

The AI should NOT be penalized for not mentioning laws during the interview - that would be inappropriate during the empathetic fact-gathering phase.`;

  return {
    system: systemPrompt,
    user: userPrompt
  };
}
