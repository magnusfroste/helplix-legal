import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Jurisdiction-specific search terms for legal case finding
const JURISDICTION_SEARCH_TERMS: Record<string, { 
  courts: string[]; 
  databases: string[]; 
  searchSuffix: string;
  language: string;
}> = {
  'SE': {
    courts: ['Högsta domstolen', 'HD', 'Hovrätten', 'Tingsrätten', 'Arbetsdomstolen', 'Marknadsdomstolen'],
    databases: ['NJA', 'RH', 'AD', 'MD', 'RÅ', 'HFD', 'lagen.nu', 'InfoTorg Juridik'],
    searchSuffix: 'svensk rätt rättsfall dom prejudikat',
    language: 'Swedish'
  },
  'BR': {
    courts: ['STF', 'STJ', 'TST', 'TRF', 'TJSP', 'TJRJ'],
    databases: ['jurisprudência', 'súmula', 'acordão'],
    searchSuffix: 'jurisprudência brasileira decisão judicial',
    language: 'Portuguese'
  },
  'MX': {
    courts: ['SCJN', 'Suprema Corte', 'Tribunales Colegiados', 'TFJA'],
    databases: ['Semanario Judicial de la Federación', 'tesis', 'jurisprudencia'],
    searchSuffix: 'jurisprudencia mexicana sentencia',
    language: 'Spanish'
  },
  'DO': {
    courts: ['Suprema Corte de Justicia', 'Corte de Apelación', 'Tribunal Constitucional'],
    databases: ['jurisprudencia dominicana'],
    searchSuffix: 'jurisprudencia dominicana sentencia',
    language: 'Spanish'
  },
  'US': {
    courts: ['Supreme Court', 'Circuit Court', 'District Court', 'Court of Appeals'],
    databases: ['Westlaw', 'LexisNexis', 'case law', 'US Reports'],
    searchSuffix: 'case law precedent ruling',
    language: 'English'
  },
  'NL': {
    courts: ['Hoge Raad', 'Gerechtshof', 'Rechtbank', 'Raad van State'],
    databases: ['ECLI', 'rechtspraak.nl', 'Nederlandse jurisprudentie'],
    searchSuffix: 'Nederlandse rechtspraak uitspraak arrest',
    language: 'Dutch'
  }
};

interface SearchRequest {
  country: string;
  query: string;
  legalContext: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { country, query, legalContext } = await req.json() as SearchRequest;
    
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Perplexity connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jurisdiction = JURISDICTION_SEARCH_TERMS[country] || JURISDICTION_SEARCH_TERMS['US'];
    
    // Build search query with jurisdiction-specific terms
    const searchQuery = `${query} ${jurisdiction.courts.slice(0, 3).join(' ')} ${jurisdiction.searchSuffix}`;
    
    console.log('Searching for legal cases:', { country, searchQuery: searchQuery.slice(0, 100) });

    // Use Perplexity sonar model for search with real-time web access
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
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
            content: `You are a legal research assistant specializing in ${jurisdiction.language} law. 
            
Your task is to find and cite relevant case law and legal precedents from ${country} that relate to the user's legal situation.

IMPORTANT REQUIREMENTS:
1. Only cite REAL cases that you can verify exist
2. Include proper case citations with:
   - Case name
   - Court
   - Date
   - Case reference number (e.g., NJA 2020 s. 123, or ECLI numbers)
3. Explain briefly why each case is relevant
4. If you cannot find specific cases, mention general legal principles with references to relevant legislation
5. Respond in ${jurisdiction.language}
6. Focus on the most authoritative sources: ${jurisdiction.databases.join(', ')}
7. Include URLs to case sources when available`
          },
          {
            role: 'user',
            content: `Find relevant case law and legal precedents for the following situation:

Legal Context: ${legalContext}

Search terms: ${query}

Please provide:
1. 3-5 most relevant cases with full citations
2. Brief explanation of each case's relevance
3. Key legal principles established
4. Any relevant legislation`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Perplexity API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const caseLawContent = data.choices?.[0]?.message?.content;
    const citations = data.citations || [];

    console.log('Case law search successful, citations:', citations.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        caseLaw: caseLawContent,
        citations,
        jurisdiction: country,
        language: jurisdiction.language
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Legal search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
