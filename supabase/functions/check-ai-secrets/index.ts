import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecretStatus {
  name: string;
  provider: string;
  configured: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check each AI-related secret
    const secrets: SecretStatus[] = [
      {
        name: 'LOVABLE_API_KEY',
        provider: 'Lovable AI',
        configured: !!Deno.env.get("LOVABLE_API_KEY"),
      },
      {
        name: 'OPENAI_API_KEY',
        provider: 'OpenAI',
        configured: !!Deno.env.get("OPENAI_API_KEY"),
      },
      {
        name: 'GOOGLE_API_KEY',
        provider: 'Google Gemini',
        configured: !!Deno.env.get("GOOGLE_API_KEY"),
      },
      {
        name: 'LOCAL_LLM_API_KEY',
        provider: 'Local LLM',
        configured: !!Deno.env.get("LOCAL_LLM_API_KEY"),
      },
    ];

    console.log('Checking AI secrets status:', secrets.map(s => `${s.name}: ${s.configured}`).join(', '));

    return new Response(
      JSON.stringify({ secrets }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking secrets:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check secrets' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
