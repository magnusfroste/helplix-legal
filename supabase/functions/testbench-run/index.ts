import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestCase {
  id: string;
  country_code: string;
  case_type: string;
  title: string;
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
}

interface RunRequest {
  test_case_id: string;
  phases_to_run?: string[];
}

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  phase?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Check if user is admin
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

    const { test_case_id, phases_to_run } = await req.json() as RunRequest;

    if (!test_case_id) {
      return new Response(
        JSON.stringify({ error: 'test_case_id is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Starting test run for case:', test_case_id);

    // 1. Load test case from database
    const { data: testCase, error: testCaseError } = await supabase
      .from('test_cases')
      .select('*')
      .eq('id', test_case_id)
      .single();

    if (testCaseError || !testCase) {
      return new Response(
        JSON.stringify({ error: 'Test case not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tc = testCase as TestCase;
    console.log('Loaded test case:', tc.title, 'country:', tc.country_code);

    // 2. Get AI config snapshot
    const { data: aiConfig } = await supabase
      .from('ai_config')
      .select('endpoint_url, model_name')
      .eq('config_key', 'primary')
      .eq('is_active', true)
      .single();

    const aiConfigSnapshot = aiConfig || {
      endpoint_url: 'https://ai.gateway.lovable.dev/v1/chat/completions',
      model_name: 'google/gemini-2.5-flash'
    };

    // 3. Get jurisdiction prompt
    const { data: jurisdictionData } = await supabase
      .from('jurisdiction_prompts')
      .select('system_prompt, question_intensity')
      .eq('country_code', tc.country_code)
      .single();

    const systemPrompt = jurisdictionData?.system_prompt || 
      `You are a professional legal assistant helping gather information for a case.`;
    const questionIntensity = jurisdictionData?.question_intensity || 70;

    // 4. Create test run record
    const { data: testRun, error: runError } = await supabase
      .from('test_runs')
      .insert({
        test_case_id: tc.id,
        ai_config_snapshot: aiConfigSnapshot,
        conversation_log: [],
        generated_report: {},
        status: 'running',
        run_by: userId,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (runError) {
      console.error('Error creating test run:', runError);
      return new Response(
        JSON.stringify({ error: 'Failed to create test run' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Created test run:', testRun.id);

    // 5. Simulate conversation - feed each answer through cooper-chat
    const phases = phases_to_run || ['opening', 'timeline', 'details', 'legal', 'evidence', 'impact', 'closing'];
    const conversationLog: ConversationMessage[] = [];
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
    
    // Add initial context about the scenario
    const initialMessage = tc.scenario.description || tc.simulated_answers[0];
    
    let currentPhaseIndex = 0;
    
    for (let i = 0; i < tc.simulated_answers.length; i++) {
      const userAnswer = tc.simulated_answers[i];
      const currentPhase = phases[Math.min(currentPhaseIndex, phases.length - 1)];
      
      // Log user answer
      conversationLog.push({
        role: 'user',
        content: userAnswer,
        timestamp: new Date().toISOString(),
        phase: currentPhase
      });
      
      messages.push({ role: 'user', content: userAnswer });
      
      // Call cooper-chat to get AI response
      try {
        const chatResponse = await fetch(`${supabaseUrl}/functions/v1/cooper-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            messages,
            systemPrompt,
            questionIntensity,
            country: tc.country_code,
            currentPhase
          })
        });

        if (!chatResponse.ok) {
          const errorText = await chatResponse.text();
          console.error('Cooper chat error:', errorText);
          throw new Error(`Chat failed: ${chatResponse.status}`);
        }

        const chatData = await chatResponse.json();
        const aiMessage = chatData.message;

        // Log AI response
        conversationLog.push({
          role: 'assistant',
          content: aiMessage,
          timestamp: new Date().toISOString(),
          phase: currentPhase
        });

        messages.push({ role: 'assistant', content: aiMessage });
        
        // Progress to next phase every ~2 answers
        if ((i + 1) % 2 === 0 && currentPhaseIndex < phases.length - 1) {
          currentPhaseIndex++;
        }
        
      } catch (chatError) {
        console.error('Error during conversation simulation:', chatError);
        conversationLog.push({
          role: 'system',
          content: `Error: ${chatError instanceof Error ? chatError.message : 'Unknown error'}`,
          timestamp: new Date().toISOString(),
          phase: currentPhase
        });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Conversation completed. Total messages:', conversationLog.length);

    // 6. Generate reports via cooper-report
    const logEntries = conversationLog.map(msg => ({
      type: msg.role === 'assistant' ? 'question' : 'answer',
      content: msg.content,
      timestamp: msg.timestamp
    }));

    let generatedReport: Record<string, string> = {};

    try {
      // Generate all report types
      const reportResponse = await fetch(`${supabaseUrl}/functions/v1/cooper-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          entries: logEntries,
          reportType: 'all',
          country: tc.country_code,
          enableCaseSearch: false // Don't use external search for testing
        })
      });

      if (!reportResponse.ok) {
        const errorText = await reportResponse.text();
        console.error('Report generation error:', errorText);
        throw new Error(`Report failed: ${reportResponse.status}`);
      }

      const reportData = await reportResponse.json();
      generatedReport = {
        timeline: reportData.timeline || '',
        legal: reportData.legal || '',
        interpretation: reportData.interpretation || ''
      };
      
      console.log('Reports generated successfully');
      
    } catch (reportError) {
      console.error('Error generating reports:', reportError);
      generatedReport = {
        error: reportError instanceof Error ? reportError.message : 'Report generation failed'
      };
    }

    // 7. Update test run with results
    const { error: updateError } = await supabase
      .from('test_runs')
      .update({
        conversation_log: conversationLog,
        generated_report: generatedReport,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', testRun.id);

    if (updateError) {
      console.error('Error updating test run:', updateError);
    }

    console.log('Test run completed:', testRun.id);

    return new Response(
      JSON.stringify({
        success: true,
        test_run_id: testRun.id,
        conversation_log: conversationLog,
        generated_report: generatedReport,
        status: 'completed'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Testbench run error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
