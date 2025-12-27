import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  country?: string;
  language?: string;
  enableCaseSearch?: boolean;
}

interface ReportTemplate {
  template_text: string;
  section_header: string;
}

// Check if Perplexity case search is enabled
async function isPerplexityCaseSearchEnabled(): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('feature_key', 'perplexity_case_search')
      .single();
    
    if (error) {
      console.log('Could not check feature flag:', error.message);
      return false;
    }
    
    return data?.enabled ?? false;
  } catch (error) {
    console.error('Error checking feature flag:', error);
    return false;
  }
}

// Fetch report template from database
async function getReportTemplate(country: string, reportType: string): Promise<ReportTemplate | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('report_templates')
      .select('template_text, section_header')
      .eq('country_code', country)
      .eq('report_type', reportType)
      .single();
    
    if (error) {
      console.log('Could not fetch report template:', error.message);
      return null;
    }
    
    return data as ReportTemplate;
  } catch (error) {
    console.error('Error fetching report template:', error);
    return null;
  }
}

// Search for case law using Perplexity
async function searchCaseLaw(country: string, legalContext: string): Promise<string | null> {
  try {
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      console.log('Perplexity API key not configured');
      return null;
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    
    console.log('Searching for case law via Perplexity for country:', country);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/perplexity-legal-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        country,
        query: legalContext.slice(0, 500),
        legalContext
      }),
    });

    if (!response.ok) {
      console.error('Perplexity search failed:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.success && data.caseLaw) {
      console.log('Case law found, citations:', data.citations?.length || 0);
      return data.caseLaw;
    }
    
    return null;
  } catch (error) {
    console.error('Case law search error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entries, reportType, country, language, enableCaseSearch } = await req.json() as ReportRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!entries || entries.length === 0) {
      throw new Error("No log entries provided");
    }

    console.log("Generating report:", reportType, "entries:", entries.length, "country:", country);

    // Format the conversation for the AI
    const conversationText = entries.map(entry => {
      const prefix = entry.type === "question" ? "Helplix:" : entry.type === "answer" ? "User:" : "System:";
      return `${prefix} ${entry.content}`;
    }).join("\n\n");

    // Map country codes to languages and legal systems
    const countryConfig: Record<string, { language: string; legalSystem: string }> = {
      'BR': { language: 'Portuguese (Brazilian)', legalSystem: 'Brazilian law (Código Civil Brasileiro, CLT, CDC, LGPD, etc.)' },
      'MX': { language: 'Spanish (Mexican)', legalSystem: 'Mexican law (Código Civil Federal, LFT, LFPC, etc.)' },
      'DO': { language: 'Spanish (Dominican)', legalSystem: 'Dominican Republic law (Código Civil Dominicano, Código de Trabajo, etc.)' },
      'SE': { language: 'Swedish', legalSystem: 'Swedish law (Brottsbalken, Konsumentköplagen, Arbetsmiljölagen, etc.)' },
      'US': { language: 'English (American)', legalSystem: 'United States law (Federal and State law, ADA, FLSA, Title VII, etc.)' },
      'NL': { language: 'Dutch', legalSystem: 'Dutch law (Burgerlijk Wetboek, Arbeidsrecht, AVG/GDPR, etc.)' },
    };

    const config = country ? countryConfig[country] : null;
    const reportLanguage = config?.language || language || 'the same language the user was communicating in';
    const legalSystem = config?.legalSystem || 'applicable law';
    
    const languageInstruction = `Write the ENTIRE report in ${reportLanguage}. ALL headers, ALL content, ALL sections must be in ${reportLanguage}.`;

    // Fetch templates from database if country is specified
    let timelineTemplate: ReportTemplate | null = null;
    let legalTemplate: ReportTemplate | null = null;
    let interpretationTemplate: ReportTemplate | null = null;
    
    if (country) {
      const templatePromises: Promise<ReportTemplate | null>[] = [];
      
      if (reportType === "timeline" || reportType === "both" || reportType === "all") {
        templatePromises.push(getReportTemplate(country, 'timeline'));
      } else {
        templatePromises.push(Promise.resolve(null));
      }
      
      if (reportType === "legal" || reportType === "both" || reportType === "all") {
        templatePromises.push(getReportTemplate(country, 'legal'));
      } else {
        templatePromises.push(Promise.resolve(null));
      }
      
      if (reportType === "interpretation" || reportType === "all") {
        templatePromises.push(getReportTemplate(country, 'interpretation'));
      } else {
        templatePromises.push(Promise.resolve(null));
      }
      
      [timelineTemplate, legalTemplate, interpretationTemplate] = await Promise.all(templatePromises);
      console.log('Templates loaded:', { 
        timeline: !!timelineTemplate, 
        legal: !!legalTemplate, 
        interpretation: !!interpretationTemplate 
      });
    }

    let systemPrompt = "";
    
    // Fallback section headers
    const defaultHeaders: Record<string, { timeline: string; legal: string; interpretation: string }> = {
      'Portuguese (Brazilian)': { timeline: 'Linha do Tempo Cronológica', legal: 'Visão Geral Jurídica', interpretation: 'Interpretação Jurídica' },
      'Spanish (Mexican)': { timeline: 'Línea de Tiempo Cronológica', legal: 'Resumen Legal', interpretation: 'Interpretación Legal' },
      'Spanish (Dominican)': { timeline: 'Línea de Tiempo Cronológica', legal: 'Resumen Legal', interpretation: 'Interpretación Legal' },
      'Swedish': { timeline: 'Kronologisk Tidslinje', legal: 'Juridisk Översikt', interpretation: 'Juridisk Tolkning' },
      'English (American)': { timeline: 'Chronological Timeline', legal: 'Legal Overview', interpretation: 'Legal Interpretation' },
      'Dutch': { timeline: 'Chronologische Tijdlijn', legal: 'Juridisch Overzicht', interpretation: 'Juridische Interpretatie' },
    };
    
    const fallbackHeaders = defaultHeaders[reportLanguage] || defaultHeaders['English (American)'];
    
    // Use database templates or fallback to hardcoded
    const sectionHeaders = {
      timeline: timelineTemplate?.section_header || fallbackHeaders.timeline,
      legal: legalTemplate?.section_header || fallbackHeaders.legal,
      interpretation: interpretationTemplate?.section_header || fallbackHeaders.interpretation,
    };
    
    if (reportType === "timeline" || reportType === "both" || reportType === "all") {
      const templateContent = timelineTemplate?.template_text || `Create a clear, chronological timeline of events based on the conversation. 

Format:
- Use clear date headers (if dates were mentioned) or relative time markers
- List events in chronological order
- Include key facts: who, what, when, where
- Highlight important details that may be legally relevant
- Be concise but complete`;

      systemPrompt += `
## ${sectionHeaders.timeline}

${templateContent}

- Start with the exact header: ## ${sectionHeaders.timeline}
- Write EVERYTHING in ${reportLanguage}

`;
    }

    if (reportType === "legal" || reportType === "both" || reportType === "all") {
      const templateContent = legalTemplate?.template_text || `Create a professional legal case summary based on the conversation.

Include:
1. **Summary**: Brief overview of the situation (2-3 sentences)
2. **Parties Involved**: List all people/entities mentioned
3. **Key Facts**: Bullet points of the most important facts
4. **Potential Legal Issues**: Identify possible legal matters (contracts, damages, rights violations, etc.)
5. **Relevant Legislation**: Mention potentially applicable laws
6. **Recommended Next Steps**: Suggest what the user should do next (consult a lawyer, gather documents, etc.)`;

      systemPrompt += `
## ${sectionHeaders.legal}

${templateContent}

CRITICAL: Apply ${legalSystem} - NOT Swedish law or any other jurisdiction.

Important: 
- Start this section with the exact header: ## ${sectionHeaders.legal}
- Write EVERYTHING in ${reportLanguage}
- Use ONLY ${legalSystem} - do not reference Swedish law
`;
    }

    if (reportType === "interpretation" || reportType === "all") {
      const disclaimerText: Record<string, string> = {
        'Portuguese (Brazilian)': '⚠️ **AVISO LEGAL**: Esta é uma análise jurídica gerada por IA destinada APENAS para fins educacionais e informativos. O conteúdo NÃO constitui aconselhamento jurídico e pode conter imprecisões ou informações desatualizadas. Sempre consulte um advogado licenciado antes de tomar decisões jurídicas.',
        'Spanish (Mexican)': '⚠️ **DESCARGO DE RESPONSABILIDAD**: Este es un análisis legal generado por IA destinado SOLO para fines educativos e informativos. El contenido NO constituye asesoramiento legal y puede contener inexactitudes o información desactualizada. Siempre consulte con un abogado licenciado antes de tomar decisiones legales.',
        'Spanish (Dominican)': '⚠️ **DESCARGO DE RESPONSABILIDAD**: Este es un análisis legal generado por IA destinado SOLO para fines educativos e informativos. El contenido NO constituye asesoramiento legal y puede contener inexactitudes o información desactualizada. Siempre consulte con un abogado licenciado antes de tomar decisiones legales.',
        'Swedish': '⚠️ **DISCLAIMER**: Detta är en AI-genererad juridisk analys avsedd ENDAST för utbildnings- och orienteringssyfte. Innehållet utgör INTE juridisk rådgivning och kan innehålla felaktigheter eller föråldrad information. Rådgör alltid med en legitimerad jurist innan du fattar juridiska beslut.',
        'English (American)': '⚠️ **DISCLAIMER**: This is an AI-generated legal analysis intended ONLY for educational and informational purposes. The content does NOT constitute legal advice and may contain inaccuracies or outdated information. Always consult with a licensed attorney before making legal decisions.',
        'Dutch': '⚠️ **DISCLAIMER**: Dit is een door AI gegenereerde juridische analyse die ALLEEN bedoeld is voor educatieve en informatieve doeleinden. De inhoud vormt GEEN juridisch advies en kan onjuistheden of verouderde informatie bevatten. Raadpleeg altijd een erkende advocaat voordat u juridische beslissingen neemt.',
      };
      
      const disclaimer = disclaimerText[reportLanguage] || disclaimerText['English (American)'];
      
      systemPrompt += `
## ${sectionHeaders.interpretation}

${disclaimer}

Create a detailed legal interpretation and analysis based on the case facts. This should demonstrate how a lawyer might approach the case.

CRITICAL REQUIREMENTS:
- Apply ONLY ${legalSystem}
- Write EVERYTHING in ${reportLanguage}
- Do NOT use Swedish law unless the country is Sweden
- Do NOT mix languages - use ${reportLanguage} for ALL content

Include the following sections:

### Legal Assessment
Provide a thorough legal analysis of the situation. Identify the core legal issues and analyze them against ${legalSystem}.

### Applicable Legislation
List and explain the relevant laws and regulations from ${legalSystem} that apply to this case:
- Reference specific law codes from ${legalSystem}
- Quote relevant paragraphs where applicable
- Explain how each law relates to the facts

### Relevant Case Law and Precedents
Reference relevant case law from the jurisdiction:
- Cite specific cases if known
- Explain the precedents and how they might apply
- If specific cases are not available, discuss general legal principles

### Legal Argumentation
Present how a lawyer might argue this case:
- Strongest arguments for the client
- Potential counterarguments to prepare for
- Key evidence that would be important

### Possible Outcomes
Analyze possible outcomes:
- Best case scenario
- Worst case scenario
- Most likely outcome based on similar cases

### Procedural Path and Next Steps
Outline the procedural path:
- Which court/authority has jurisdiction
- Time limits to be aware of
- Recommended immediate actions
- Estimated timeline

### Sources and References
List all sources referenced in the analysis.

Important guidelines:
- Start with the exact header: ## ${sectionHeaders.interpretation}
- The DISCLAIMER must appear at the very beginning
- Write EVERYTHING in ${reportLanguage}
- Use ONLY ${legalSystem}
- Be thorough but focus on the most relevant legal aspects
`;
    }

    // Check if we should search for case law
    let caseLawContext = '';
    const shouldSearchCaseLaw = (reportType === 'interpretation' || reportType === 'all') && country;
    
    if (shouldSearchCaseLaw) {
      // Check if feature is enabled
      const caseSearchEnabled = enableCaseSearch ?? await isPerplexityCaseSearchEnabled();
      
      if (caseSearchEnabled) {
        console.log('Case search enabled, searching for relevant case law...');
        const caseLaw = await searchCaseLaw(country, conversationText);
        
        if (caseLaw) {
          caseLawContext = `

## RELEVANT CASE LAW FOUND (from web search):
${caseLaw}

IMPORTANT: Incorporate the above case law into the "Relevant Case Law and Precedents" section of your analysis. 
Cite these cases with proper references and explain their relevance to the current situation.
`;
          console.log('Case law context added to prompt');
        }
      } else {
        console.log('Case search feature is disabled');
      }
    }

    const fullSystemPrompt = `You are a legal documentation specialist and legal analyst creating formal reports from interview transcripts.

${systemPrompt}

## Important Guidelines:
- ${languageInstruction}
- CRITICAL: Apply ${legalSystem} - do NOT use Swedish law unless country is Sweden
- CRITICAL: Write ALL content in ${reportLanguage} - do NOT mix languages
- Be objective and factual - do not add assumptions
- Use professional, clear language suitable for legal documentation
- If information is incomplete, note what is missing
- For the interpretation section: provide educational analysis but emphasize it is NOT legal advice
- Format the output with clear Markdown headers and sections
- CRITICAL: Include all requested section headers in the exact format specified
- When generating "all" sections: include "## ${sectionHeaders.timeline}", "## ${sectionHeaders.legal}", AND "## ${sectionHeaders.interpretation}" headers`;

    const userPrompt = `Here is the conversation transcript to analyze:

${conversationText}
${caseLawContext}

Please generate the ${reportType === "both" ? "timeline and legal overview" : reportType} report.`;

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
          { role: "user", content: userPrompt },
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
      JSON.stringify({ report, caseLawIncluded: !!caseLawContext }),
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
