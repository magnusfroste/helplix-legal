import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, questionIntensity, userLanguage, country } = await req.json() as ChatRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Cooper chat request - messages:", messages.length, "intensity:", questionIntensity, "country:", country);

    // Build the enhanced system prompt
    const intensityInstruction = questionIntensity >= 7 
      ? "Ask short, specific, focused questions. One question at a time. Be thorough and detailed in your inquiry."
      : questionIntensity >= 4
      ? "Ask balanced questions - not too long, not too short. Focus on gathering key information."
      : "Ask open-ended questions that allow the user to share more context in their own words.";

    const languageInstruction = userLanguage 
      ? `IMPORTANT: Always respond in ${userLanguage}. The user has chosen this language for communication.`
      : "Detect the user's preferred language from their responses and continue in that language.";

    const fullSystemPrompt = `${systemPrompt}

## Your Behavior Guidelines:
- ${intensityInstruction}
- ${languageInstruction}
- Always be empathetic and patient - remember the user may be elderly.
- Keep your responses concise but warm.
- After receiving information, acknowledge it briefly and then ask your next question.
- Focus on building a complete timeline of events.
- Identify key facts: dates, people involved, locations, documents.
- If something is unclear, ask for clarification before moving on.
- Never provide legal advice - only gather information for documentation.

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
