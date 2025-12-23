import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getPhaseInstruction(phase: string): string {
  switch (phase) {
    case 'opening':
      return `## CURRENT INTERVIEW PHASE: OPENING
**Objective:** Let the user tell their story freely
**Focus on:**
- Ask open-ended questions like "Can you tell me what happened?"
- Let the user speak freely without interruption
- Listen for key themes and parties involved
- Build trust and rapport
- Get an overview of the situation`;

    case 'timeline':
      return `## CURRENT INTERVIEW PHASE: TIMELINE
**Objective:** Build chronological understanding
**Focus on:**
- Ask "When did this start?" and "When did X happen?"
- Request specific dates, times, or timeframes
- Build a chronological sequence of events
- Identify any deadlines or time-sensitive issues
- Map the progression of the situation`;

    case 'details':
      return `## CURRENT INTERVIEW PHASE: DETAILS
**Objective:** Deep dive into specifics
**Focus on:**
- Ask "Who was involved?" and "Where did this happen?"
- Request specific names, titles, and roles
- Clarify locations and settings
- Understand the "how" of each event
- Explore motivations and context`;

    case 'legal':
      return `## CURRENT INTERVIEW PHASE: LEGAL ASPECTS
**Objective:** Identify legal issues and frameworks
**Focus on:**
- Ask about contracts, agreements, or written terms
- Identify legal relationships (employer-employee, landlord-tenant, etc.)
- Explore obligations and rights
- Look for potential violations or breaches
- Understand relevant laws and regulations`;

    case 'evidence':
      return `## CURRENT INTERVIEW PHASE: EVIDENCE
**Objective:** Gather documentation and witnesses
**Focus on:**
- Ask "Do you have any documents related to this?"
- Request emails, messages, contracts, receipts
- Identify potential witnesses
- Look for photos, videos, or recordings
- Find communication records`;

    case 'impact':
      return `## CURRENT INTERVIEW PHASE: IMPACT & CONSEQUENCES
**Objective:** Assess damages and effects
**Focus on:**
- Ask "How has this affected you financially?"
- Explore emotional and psychological impact
- Identify ongoing consequences
- Quantify losses where possible
- Understand future implications`;

    case 'closing':
      return `## CURRENT INTERVIEW PHASE: CLOSING
**Objective:** Fill gaps and summarize
**Focus on:**
- Review any gaps in the story
- Ask clarifying questions
- Confirm key facts
- Address any missing information
- Prepare user for report generation`;

    default:
      return `## CURRENT INTERVIEW PHASE: OPENING
**Objective:** Gather initial information
**Focus on:** Understanding the user's situation`;
  }
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  systemPrompt: string;
  questionIntensity: number; // 1-10, higher = more detailed questions
  userLanguage?: string;
  country?: string; // Country code for legal context
  currentPhase?: string; // Current interview phase
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, questionIntensity, userLanguage, country, currentPhase } = await req.json() as ChatRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Cooper chat request - messages:", messages.length, "intensity:", questionIntensity, "country:", country, "phase:", currentPhase);

    // Build the enhanced system prompt
    const intensityInstruction = questionIntensity >= 7 
      ? "Ask short, specific, focused questions. One question at a time. Be thorough and detailed in your inquiry."
      : questionIntensity >= 4
      ? "Ask balanced questions - not too long, not too short. Focus on gathering key information."
      : "Ask open-ended questions that allow the user to share more context in their own words.";

    const languageInstruction = userLanguage 
      ? `IMPORTANT: Always respond in ${userLanguage}. The user has chosen this language for communication.`
      : "Detect the user's preferred language from their responses and continue in that language.";

    const phaseInstruction = getPhaseInstruction(currentPhase || 'opening');

    const fullSystemPrompt = `${systemPrompt}

## Your Behavior Guidelines:
- ${intensityInstruction}
- ${languageInstruction}
- Always be empathetic and patient - remember the user may be elderly.
- Keep your responses concise but warm.
- After receiving information, acknowledge it briefly and then ask your next question.
- Never provide legal advice - only gather information for documentation.

${phaseInstruction}

## Response Format:
- Respond with your next question directly.
- Don't add unnecessary preamble.
- If summarizing what you heard, keep it to one sentence before asking the next question.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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

    console.log("Cooper response:", assistantMessage.substring(0, 100) + "...");

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cooper chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
