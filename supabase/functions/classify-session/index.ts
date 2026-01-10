import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClassifyRequest {
  sessionId: string;
  conversationHistory: Array<{
    type: 'question' | 'answer';
    content: string;
  }>;
  language?: string;
}

interface ClassificationResult {
  case_type: string;
  summary: string;
  title: string;
}

const CASE_TYPES = [
  'general',
  'travel_damage',
  'consumer',
  'insurance',
  'housing',
  'employment',
  'personal_injury',
] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, conversationHistory, language } = await req.json() as ClassifyRequest;
    
    if (!sessionId || !conversationHistory || conversationHistory.length < 4) {
      return new Response(
        JSON.stringify({ error: "Not enough conversation history to classify" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build conversation context
    const conversationText = conversationHistory
      .map(entry => `${entry.type === 'question' ? 'Assistant' : 'User'}: ${entry.content}`)
      .join('\n');

    const systemPrompt = `You are a case classification system. Analyze the conversation and extract:
1. The case type - one of: ${CASE_TYPES.join(', ')}
2. A brief summary (max 100 characters) of the issue
3. A short title (max 40 characters) for the case

Case type definitions:
- travel_damage: Issues with flights, luggage, travel cancellations, credit card travel insurance
- consumer: Product returns, warranty claims, defective products, online purchases
- insurance: Insurance claims, policy disputes, claim denials
- housing: Rent disputes, landlord issues, tenant rights, property damage
- employment: Workplace issues, termination, salary disputes, workplace rights
- personal_injury: Accidents, medical malpractice, bodily harm claims
- general: Anything that doesn't fit the above categories

Respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{"case_type": "travel_damage", "summary": "Brief description", "title": "Short title"}`;

    const userPrompt = `Analyze this conversation and classify the case:

${conversationText}

${language ? `Respond with title and summary in ${language}.` : ''}`;

    console.log("Classifying session:", sessionId, "with", conversationHistory.length, "entries");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("Classification response:", content);

    // Parse the JSON response
    let classification: ClassificationResult;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      classification = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse classification:", parseError, content);
      // Default fallback
      classification = {
        case_type: 'general',
        summary: 'Legal inquiry',
        title: 'New Case',
      };
    }

    // Validate case_type
    if (!CASE_TYPES.includes(classification.case_type as typeof CASE_TYPES[number])) {
      classification.case_type = 'general';
    }

    // Update the session in the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        case_type: classification.case_type,
        summary: classification.summary,
        title: classification.title,
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error("Failed to update session:", updateError);
      throw updateError;
    }

    console.log("Session classified successfully:", classification);

    return new Response(
      JSON.stringify({ 
        success: true, 
        classification 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Classification error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
