import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LogEntry {
  type: "question" | "answer" | "system";
  content: string;
  timestamp: string;
}

interface ReportRequest {
  entries: LogEntry[];
  reportType: "timeline" | "legal" | "interpretation" | "both" | "all";
  language?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entries, reportType, language } = await req.json() as ReportRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!entries || entries.length === 0) {
      throw new Error("No log entries provided");
    }

    console.log("Generating report:", reportType, "entries:", entries.length);

    // Format the conversation for the AI
    const conversationText = entries.map(entry => {
      const prefix = entry.type === "question" ? "Cooper:" : entry.type === "answer" ? "User:" : "System:";
      return `${prefix} ${entry.content}`;
    }).join("\n\n");

    const languageInstruction = language 
      ? `Write the report in ${language}.`
      : "Write the report in the same language the user was communicating in.";

    let systemPrompt = "";
    
    if (reportType === "timeline" || reportType === "both" || reportType === "all") {
      systemPrompt += `
## Kronologisk Tidslinje

Create a clear, chronological timeline of events based on the conversation. 

Format:
- Use clear date headers (if dates were mentioned) or relative time markers
- List events in chronological order
- Include key facts: who, what, when, where
- Highlight important details that may be legally relevant
- Be concise but complete
- Start with the exact header: ## Kronologisk Tidslinje

`;
    }

    if (reportType === "legal" || reportType === "both" || reportType === "all") {
      systemPrompt += `
## Juridisk Översikt

Create a professional legal case summary based on the conversation.

Include:
1. **Sammanfattning**: Brief overview of the situation (2-3 sentences)
2. **Inblandade parter**: List all people/entities mentioned
3. **Viktiga fakta**: Bullet points of the most important facts
4. **Potentiella juridiska frågor**: Identify possible legal matters (contracts, damages, rights violations, etc.)
5. **Relevant lagstiftning**: Mention potentially applicable laws or legal principles (if identifiable)
6. **Rekommenderade nästa steg**: Suggest what the user should do next (consult a lawyer, gather documents, etc.)

Important: Start this section with the exact header: ## Juridisk Översikt
`;
    }

    if (reportType === "interpretation" || reportType === "all") {
      systemPrompt += `
## Juridisk Tolkning

⚠️ **DISCLAIMER**: Detta är en AI-genererad juridisk analys avsedd ENDAST för utbildnings- och orienteringssyfte. Innehållet utgör INTE juridisk rådgivning och kan innehålla felaktigheter eller föråldrad information. Rådgör alltid med en legitimerad jurist innan du fattar juridiska beslut.

Create a detailed legal interpretation and analysis based on the case facts. This should demonstrate how a lawyer might approach the case.

Include the following sections:

### Rättslig Bedömning
Provide a thorough legal analysis of the situation. Identify the core legal issues and analyze them against applicable Swedish law.

### Tillämplig Lagstiftning
List and explain the relevant Swedish laws and regulations that apply to this case:
- Reference specific law codes (e.g., Brottsbalken, Avtalslagen, Skadeståndslagen)
- Quote relevant paragraphs where applicable
- Explain how each law relates to the facts

### Relevanta Rättsfall och Prejudikat
Reference relevant Swedish case law that could apply:
- NJA (Nytt Juridiskt Arkiv) cases
- RH (Rättsfall från hovrätterna) cases
- AD (Arbetsdomstolen) if labor-related
- Explain the precedents and how they might apply

### Juridisk Argumentation
Present how a lawyer might argue this case:
- Strongest arguments for the client
- Potential counterarguments to prepare for
- Key evidence that would be important

### Möjliga Utgångar
Analyze possible outcomes:
- Best case scenario
- Worst case scenario
- Most likely outcome based on similar cases

### Processväg och Nästa Steg
Outline the procedural path:
- Which court/authority has jurisdiction
- Time limits (preskriptionstider) to be aware of
- Recommended immediate actions
- Estimated timeline

### Källor och Referenser
List all sources referenced in the analysis.

Important guidelines:
- Start with the exact header: ## Juridisk Tolkning
- The DISCLAIMER must appear at the very beginning
- Be thorough but focus on the most relevant legal aspects
- Use proper Swedish legal terminology
- When referencing case law, be as specific as possible
- If you cannot find specific cases, mention general legal principles instead
`;
    }

    const fullSystemPrompt = `You are a legal documentation specialist and legal analyst creating formal reports from interview transcripts.

${systemPrompt}

## Important Guidelines:
- ${languageInstruction}
- Be objective and factual - do not add assumptions
- Use professional, clear language suitable for legal documentation
- If information is incomplete, note what is missing
- For the Juridisk Tolkning section: provide educational analysis but emphasize it is NOT legal advice
- Format the output with clear Markdown headers and sections
- CRITICAL: Include all requested section headers in the exact format specified
- When generating "all" sections: include "## Kronologisk Tidslinje", "## Juridisk Översikt", AND "## Juridisk Tolkning" headers`;

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
          { role: "user", content: `Here is the conversation transcript to analyze:\n\n${conversationText}\n\nPlease generate the ${reportType === "both" ? "timeline and legal overview" : reportType} report.` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const report = data.choices?.[0]?.message?.content;

    if (!report) {
      throw new Error("No report generated");
    }

    console.log("Report generated, length:", report.length);

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Report generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
