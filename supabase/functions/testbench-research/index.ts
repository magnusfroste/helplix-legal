import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResearchRequest {
  country_code: string;
  case_type: string;
  search_terms?: string;
}

interface SuggestedTestCase {
  title: string;
  country_code: string;
  case_type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: 'research';
  source_url?: string;
  scenario: {
    description: string;
    key_facts: string[];
  };
  simulated_answers: string[];
  expected_facts: Array<{ fact: string; weight: number }>;
  expected_legal_issues: Array<{ issue: string; weight: number }>;
  expected_timeline: Array<{ event: string; date: string }>;
}

const COUNTRY_SEARCH_CONTEXT: Record<string, { language: string; legalSystem: string; searchTerms: string }> = {
  'SE': {
    language: 'Swedish',
    legalSystem: 'Swedish law',
    searchTerms: 'svenska rättsfall konsumenträtt arbetsrätt hyresrätt'
  },
  'BR': {
    language: 'Portuguese',
    legalSystem: 'Brazilian law',
    searchTerms: 'casos jurídicos brasil direito consumidor trabalhista'
  },
  'MX': {
    language: 'Spanish',
    legalSystem: 'Mexican law',
    searchTerms: 'casos legales mexico derecho consumidor laboral'
  },
  'US': {
    language: 'English',
    legalSystem: 'US law',
    searchTerms: 'legal cases consumer rights employment law tenant rights'
  },
  'NL': {
    language: 'Dutch',
    legalSystem: 'Dutch law',
    searchTerms: 'rechtszaken nederland consumentenrecht arbeidsrecht'
  },
  'DO': {
    language: 'Spanish',
    legalSystem: 'Dominican Republic law',
    searchTerms: 'casos legales república dominicana derecho laboral consumidor'
  }
};

const CASE_TYPE_KEYWORDS: Record<string, string> = {
  'travel_damage': 'flight delay baggage lost luggage airline compensation',
  'consumer': 'defective product refund warranty consumer rights',
  'housing': 'tenant landlord eviction rent deposit lease',
  'employment': 'wrongful termination workplace harassment discrimination',
  'contract': 'breach of contract agreement dispute',
  'general': 'legal dispute civil case'
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Perplexity API key not configured' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Lovable API key not configured' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    const { country_code, case_type, search_terms } = await req.json() as ResearchRequest;

    if (!country_code || !case_type) {
      return new Response(
        JSON.stringify({ error: 'country_code and case_type are required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Researching cases for:', country_code, case_type);

    const countryContext = COUNTRY_SEARCH_CONTEXT[country_code] || COUNTRY_SEARCH_CONTEXT['US'];
    const caseKeywords = CASE_TYPE_KEYWORDS[case_type] || CASE_TYPE_KEYWORDS['general'];
    
    const searchQuery = search_terms || 
      `${countryContext.searchTerms} ${caseKeywords} real case example precedent`;

    // 1. Search for real cases via Perplexity
    console.log('Searching Perplexity for:', searchQuery);
    
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are a legal researcher. Find real legal cases from ${countryContext.legalSystem} related to ${case_type}. 
Focus on cases that would be useful for testing a legal AI assistant.
Provide factual details about real cases, including dates, parties involved, key facts, and outcomes.
If you can't find specific cases, describe typical scenarios based on the legal framework.`
          },
          {
            role: 'user',
            content: `Find 2-3 real or realistic legal cases about "${case_type}" in ${country_code}. 
Search terms: ${searchQuery}

For each case, provide:
1. A brief title
2. The key facts
3. The legal issues involved
4. The outcome or typical resolution
5. Any relevant laws or regulations`
          }
        ],
        search_recency_filter: 'year'
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity error:', errorText);
      throw new Error(`Perplexity search failed: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const researchContent = perplexityData.choices?.[0]?.message?.content || '';
    const citations = perplexityData.citations || [];

    console.log('Perplexity research complete. Citations:', citations.length);

    // 2. Use AI to structure the research into test cases
    const structureResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a test case designer for a legal AI assistant. 
Convert research about real legal cases into structured test cases.
Each test case should simulate a realistic conversation where a user describes their legal situation.
Create natural, conversational simulated answers that a real person might give.
Anonymize any real names but keep the legal facts accurate.`
          },
          {
            role: "user",
            content: `Based on this research about ${case_type} cases in ${country_code}, create 2 structured test cases.

RESEARCH:
${researchContent}

SOURCES:
${citations.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

For each test case, provide the complete structure needed for testing.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_test_cases",
            description: "Create structured test cases from the research",
            parameters: {
              type: "object",
              properties: {
                test_cases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                      source_url: { type: "string" },
                      scenario: {
                        type: "object",
                        properties: {
                          description: { type: "string" },
                          key_facts: { type: "array", items: { type: "string" } }
                        }
                      },
                      simulated_answers: {
                        type: "array",
                        items: { type: "string" },
                        description: "Natural conversational answers a user would give"
                      },
                      expected_facts: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            fact: { type: "string" },
                            weight: { type: "integer", minimum: 1, maximum: 20 }
                          }
                        }
                      },
                      expected_legal_issues: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            issue: { type: "string" },
                            weight: { type: "integer", minimum: 1, maximum: 25 }
                          }
                        }
                      },
                      expected_timeline: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            event: { type: "string" },
                            date: { type: "string" }
                          }
                        }
                      }
                    },
                    required: ["title", "difficulty", "scenario", "simulated_answers", "expected_facts", "expected_legal_issues"]
                  }
                }
              },
              required: ["test_cases"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_test_cases" } }
      }),
    });

    if (!structureResponse.ok) {
      const errorText = await structureResponse.text();
      console.error("AI structuring error:", structureResponse.status, errorText);
      throw new Error(`AI structuring failed: ${structureResponse.status}`);
    }

    const structureData = await structureResponse.json();
    const toolCall = structureData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No structured result from AI');
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Add country_code and case_type to each test case
    const suggestedTestCases: SuggestedTestCase[] = result.test_cases.map((tc: any) => ({
      ...tc,
      country_code,
      case_type,
      source: 'research' as const,
      scoring_rubric: {
        fact_coverage: 0.25,
        legal_accuracy: 0.30,
        timeline_accuracy: 0.15,
        question_quality: 0.15,
        language_quality: 0.10,
        professionalism: 0.05
      }
    }));

    console.log('Generated', suggestedTestCases.length, 'test case suggestions');

    return new Response(
      JSON.stringify({
        success: true,
        suggested_test_cases: suggestedTestCases,
        sources_cited: citations,
        raw_research: researchContent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Testbench research error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
