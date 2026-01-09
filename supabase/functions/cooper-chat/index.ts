import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIEndpointConfig {
  url: string;
  apiKey: string;
  model: string;
}

// Fetch AI endpoint configuration from database
async function getAIEndpoint(): Promise<AIEndpointConfig> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  // Default to Lovable AI
  const defaultConfig: AIEndpointConfig = {
    url: "https://ai.gateway.lovable.dev/v1/chat/completions",
    apiKey: LOVABLE_API_KEY || "",
    model: "google/gemini-2.5-flash",
  };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('ai_config')
      .select('endpoint_url, api_key, model_name, is_active')
      .eq('config_key', 'primary')
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      console.log('No active AI config found, using Lovable AI');
      return defaultConfig;
    }
    
    // Validate that we have required fields
    if (!data.endpoint_url || !data.api_key) {
      console.log('AI config missing required fields, using Lovable AI');
      return defaultConfig;
    }
    
    console.log('Using custom AI endpoint:', data.endpoint_url, 'model:', data.model_name);
    return {
      url: data.endpoint_url,
      apiKey: data.api_key,
      model: data.model_name || 'gpt-4o',
    };
  } catch (error) {
    console.error('Error fetching AI config:', error);
    return defaultConfig;
  }
}

function getGapsInstruction(gaps?: InformationGaps, completeness?: number): string {
  if (!gaps || completeness === undefined) {
    return "";
  }

  let instruction = `\n## INFORMATION COMPLETENESS: ${completeness}%\n`;

  if (completeness < 30) {
    instruction += "**Status:** Early stage - focus on gathering basic information\n";
  } else if (completeness < 60) {
    instruction += "**Status:** Moderate progress - continue building the case\n";
  } else if (completeness < 90) {
    instruction += "**Status:** Good progress - focus on filling remaining gaps\n";
  } else {
    instruction += "**Status:** Nearly complete - verify and clarify details\n";
  }

  if (gaps.critical.length > 0) {
    instruction += `\n**CRITICAL MISSING INFORMATION (must address):**\n`;
    gaps.critical.forEach(gap => {
      instruction += `- ${gap}\n`;
    });
    instruction += "\n**Priority:** Ask about these critical gaps in your next questions.\n";
  }

  if (gaps.important.length > 0 && gaps.critical.length === 0) {
    instruction += `\n**IMPORTANT MISSING INFORMATION:**\n`;
    gaps.important.slice(0, 3).forEach(gap => {
      instruction += `- ${gap}\n`;
    });
    instruction += "\n**Note:** Consider addressing these gaps when appropriate.\n";
  }

  return instruction;
}

// Fallback phase instructions (used when database lookup fails)
const FALLBACK_PHASE_INSTRUCTIONS: Record<string, string> = {
  opening: `**Objective:** Let the user tell their story freely
**Focus on:**
- Ask open-ended questions like "Can you tell me what happened?"
- Let the user speak freely without interruption
- Listen for key themes and parties involved
- Build trust and rapport
- Get an overview of the situation`,
  timeline: `**Objective:** Build chronological understanding
**Focus on:**
- Ask "When did this start?" and "When did X happen?"
- Request specific dates, times, or timeframes
- Build a chronological sequence of events
- Identify any deadlines or time-sensitive issues
- Map the progression of the situation`,
  details: `**Objective:** Deep dive into specifics
**Focus on:**
- Ask "Who was involved?" and "Where did this happen?"
- Request specific names, titles, and roles
- Clarify locations and settings
- Understand the "how" of each event
- Explore motivations and context`,
  legal: `**Objective:** Identify legal issues and frameworks
**Focus on:**
- Ask about contracts, agreements, or written terms
- Identify legal relationships (employer-employee, landlord-tenant, etc.)
- Explore obligations and rights
- Look for potential violations or breaches
- Understand relevant laws and regulations`,
  evidence: `**Objective:** Gather documentation and witnesses
**Focus on:**
- Ask "Do you have any documents related to this?"
- Request emails, messages, contracts, receipts
- Identify potential witnesses
- Look for photos, videos, or recordings
- Find communication records`,
  impact: `**Objective:** Assess damages and effects
**Focus on:**
- Ask "How has this affected you financially?"
- Explore emotional and psychological impact
- Identify ongoing consequences
- Quantify losses where possible
- Understand future implications`,
  closing: `**Objective:** Fill gaps and summarize
**Focus on:**
- Review any gaps in the story
- Ask clarifying questions
- Confirm key facts
- Address any missing information
- Prepare user for report generation`,
};

// Fetch phase instruction from database
async function getPhaseInstructionFromDB(country: string, phase: string): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('phase_instructions')
      .select('instruction')
      .eq('country_code', country)
      .eq('phase', phase)
      .single();
    
    if (error) {
      console.log('Could not fetch phase instruction:', error.message);
      return null;
    }
    
    return data?.instruction || null;
  } catch (error) {
    console.error('Error fetching phase instruction:', error);
    return null;
  }
}

// Fetch behavior guidelines from database
async function getBehaviorGuidelines(country?: string): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get global guidelines (country_code is null)
    const { data: globalData, error: globalError } = await supabase
      .from('behavior_guidelines')
      .select('guideline_key, guideline_text')
      .is('country_code', null)
      .eq('is_enabled', true)
      .order('sort_order');
    
    if (globalError) {
      console.log('Could not fetch global guidelines:', globalError.message);
    }
    
    // Get country-specific guidelines if country is provided
    let countryData: any[] = [];
    if (country) {
      const { data, error } = await supabase
        .from('behavior_guidelines')
        .select('guideline_key, guideline_text')
        .eq('country_code', country)
        .eq('is_enabled', true)
        .order('sort_order');
      
      if (error) {
        console.log('Could not fetch country guidelines:', error.message);
      } else {
        countryData = data || [];
      }
    }
    
    // Merge guidelines - country-specific override global ones with same key
    const guidelinesMap = new Map<string, string>();
    
    // Add global guidelines first
    (globalData || []).forEach((g: any) => {
      guidelinesMap.set(g.guideline_key, g.guideline_text);
    });
    
    // Override with country-specific
    countryData.forEach((g: any) => {
      guidelinesMap.set(g.guideline_key, g.guideline_text);
    });
    
    // Convert to bullet points
    const guidelines = Array.from(guidelinesMap.values());
    if (guidelines.length === 0) {
      return '';
    }
    
    return guidelines.map(g => `- ${g}`).join('\n');
  } catch (error) {
    console.error('Error fetching behavior guidelines:', error);
    return '';
  }
}

// Get phase instruction with database lookup and fallback
async function getPhaseInstruction(phase: string, country?: string): Promise<string> {
  const phaseName = phase || 'opening';
  const phaseLabels: Record<string, string> = {
    opening: 'OPENING',
    timeline: 'TIMELINE',
    details: 'DETAILS',
    legal: 'LEGAL ASPECTS',
    evidence: 'EVIDENCE',
    impact: 'IMPACT & CONSEQUENCES',
    closing: 'CLOSING',
  };
  
  // Try to get from database if country is provided
  if (country) {
    const dbInstruction = await getPhaseInstructionFromDB(country, phaseName);
    if (dbInstruction) {
      return `## CURRENT INTERVIEW PHASE: ${phaseLabels[phaseName] || phaseName.toUpperCase()}\n${dbInstruction}`;
    }
  }
  
  // Fallback to hardcoded instructions
  const fallback = FALLBACK_PHASE_INSTRUCTIONS[phaseName] || FALLBACK_PHASE_INSTRUCTIONS.opening;
  return `## CURRENT INTERVIEW PHASE: ${phaseLabels[phaseName] || phaseName.toUpperCase()}\n${fallback}`;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface InformationGaps {
  critical: string[];
  important: string[];
  optional: string[];
}

interface ChatRequest {
  messages: Message[];
  systemPrompt: string;
  questionIntensity: number; // 1-10, higher = more detailed questions
  userLanguage?: string;
  country?: string; // Country code for legal context
  currentPhase?: string; // Current interview phase
  informationGaps?: InformationGaps; // Missing information
  completeness?: number; // 0-100 percentage
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, questionIntensity, userLanguage, country, currentPhase, informationGaps, completeness } = await req.json() as ChatRequest;
    
    // Get AI endpoint configuration (custom or Lovable AI)
    const aiConfig = await getAIEndpoint();

    if (!aiConfig.apiKey) {
      throw new Error("No AI API key configured");
    }

    console.log("Helplix chat request - messages:", messages.length, "intensity:", questionIntensity, "country:", country, "phase:", currentPhase, "completeness:", completeness);

    // Build the enhanced system prompt
    const intensityInstruction = questionIntensity >= 7 
      ? "Ask short, specific, focused questions. One question at a time. Be thorough and detailed in your inquiry."
      : questionIntensity >= 4
      ? "Ask balanced questions - not too long, not too short. Focus on gathering key information."
      : "Ask open-ended questions that allow the user to share more context in their own words.";

    const languageInstruction = userLanguage 
      ? `IMPORTANT: Always respond in ${userLanguage}. The user has chosen this language for communication.`
      : "Detect the user's preferred language from their responses and continue in that language.";

    // Fetch phase instruction and behavior guidelines from database
    const [phaseInstruction, behaviorGuidelines] = await Promise.all([
      getPhaseInstruction(currentPhase || 'opening', country),
      getBehaviorGuidelines(country)
    ]);
    
    const gapsInstruction = getGapsInstruction(informationGaps, completeness);

    // Build behavior guidelines section
    const guidelinesSection = behaviorGuidelines 
      ? `## Your Behavior Guidelines:\n- ${intensityInstruction}\n- ${languageInstruction}\n${behaviorGuidelines}`
      : `## Your Behavior Guidelines:
- ${intensityInstruction}
- ${languageInstruction}
- Always be empathetic and patient - remember the user may be elderly.
- Keep your responses concise but warm.
- After receiving information, acknowledge it briefly and then ask your next question.
- Never provide legal advice - only gather information for documentation.`;

    const fullSystemPrompt = `${systemPrompt}

${guidelinesSection}

${phaseInstruction}

${gapsInstruction}

## Response Format:
- Respond with your next question directly.
- Don't add unnecessary preamble.
- If summarizing what you heard, keep it to one sentence before asking the next question.`;

    const response = await fetch(aiConfig.url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${aiConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please check your workspace credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response from AI");
    }

    console.log("Helplix response:", assistantMessage.substring(0, 100) + "...");

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Helplix chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
