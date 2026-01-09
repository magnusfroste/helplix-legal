import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint_url, api_key, model_name } = await req.json();

    if (!endpoint_url || !api_key || !model_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Saknar endpoint URL, API-nyckel eller modellnamn' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Testing AI connection to ${endpoint_url} with model ${model_name}`);

    // Make a simple test request to the AI endpoint
    const response = await fetch(endpoint_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      },
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
          status: response.status
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
          error: 'Oväntat svarsformat från API:et' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Anslutningen fungerar!',
        model: data.model || model_name,
        response: content
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
