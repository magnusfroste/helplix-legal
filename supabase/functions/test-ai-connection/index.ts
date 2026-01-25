import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AIProvider = 'lovable' | 'openai' | 'google' | 'local';

// Determine which provider is being used based on endpoint URL
function detectProvider(endpointUrl: string): AIProvider {
  if (endpointUrl.includes('ai.gateway.lovable.dev')) return 'lovable';
  if (endpointUrl.includes('openai.com')) return 'openai';
  if (endpointUrl.includes('generativelanguage.googleapis')) return 'google';
  if (endpointUrl.includes('localhost') || endpointUrl.includes('127.0.0.1')) return 'local';
  return 'openai'; // Default to OpenAI-compatible for custom endpoints
}

// Get API key from secrets based on provider
function getApiKeyForProvider(provider: AIProvider): string {
  switch (provider) {
    case 'lovable':
      return Deno.env.get("LOVABLE_API_KEY") || "";
    case 'openai':
      return Deno.env.get("OPENAI_API_KEY") || "";
    case 'google':
      return Deno.env.get("GOOGLE_API_KEY") || "";
    case 'local':
      return ""; // Local usually doesn't need a key
    default:
      return Deno.env.get("OPENAI_API_KEY") || "";
  }
}

// Get human-readable provider name
function getProviderName(provider: AIProvider): string {
  switch (provider) {
    case 'lovable': return 'Lovable AI';
    case 'openai': return 'OpenAI';
    case 'google': return 'Google Gemini';
    case 'local': return 'Local';
    default: return 'Unknown';
  }
}

// Get secret name for provider
function getSecretName(provider: AIProvider): string {
  switch (provider) {
    case 'lovable': return 'LOVABLE_API_KEY';
    case 'openai': return 'OPENAI_API_KEY';
    case 'google': return 'GOOGLE_API_KEY';
    case 'local': return '';
    default: return 'OPENAI_API_KEY';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint_url, model_name } = await req.json();

    if (!endpoint_url || !model_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Saknar endpoint URL eller modellnamn' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect provider and get API key from secrets
    const provider = detectProvider(endpoint_url);
    const providerName = getProviderName(provider);
    const secretName = getSecretName(provider);
    const api_key = getApiKeyForProvider(provider);

    console.log(`Testing AI connection to ${providerName} (${endpoint_url}) with model ${model_name}`);

    // For non-local providers, require an API key
    if (provider !== 'local' && !api_key) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `API-nyckel saknas för ${providerName}. Lägg till ${secretName} i Secrets.`,
          missingSecret: secretName
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make a simple test request to the AI endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (api_key) {
      headers['Authorization'] = `Bearer ${api_key}`;
    }

    const response = await fetch(endpoint_url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model_name,
        messages: [
          { role: 'user', content: 'Respond with only the word "OK" to confirm the connection works.' }
        ],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      let errorMessage = `API-fel: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // Use raw error text if not JSON
        if (errorText.length < 200) {
          errorMessage = errorText;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          status: response.status,
          provider: providerName
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI API response:', JSON.stringify(data).substring(0, 200));

    // Check if we got a valid response
    const hasChoices = data.choices && data.choices.length > 0;
    const content = hasChoices ? data.choices[0].message?.content : null;

    if (!hasChoices) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Oväntat svarsformat från API:et',
          provider: providerName
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${providerName} anslutning fungerar!`,
        model: data.model || model_name,
        response: content,
        provider: providerName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error testing AI connection:', error);
    
    let errorMessage = 'Kunde inte ansluta till endpoint';
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Kunde inte nå endpoint URL - kontrollera adressen';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});