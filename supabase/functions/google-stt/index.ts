import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    
    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Google API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the audio file from form data
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const languageCode = formData.get('language') as string || 'sv-SE';

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received audio file:', audioFile.name, 'size:', audioFile.size, 'type:', audioFile.type);

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);

    // Determine encoding based on file type
    let encoding = 'WEBM_OPUS';
    if (audioFile.type.includes('mp4') || audioFile.type.includes('m4a')) {
      encoding = 'MP3'; // Google accepts MP3 for mp4 audio
    } else if (audioFile.type.includes('ogg')) {
      encoding = 'OGG_OPUS';
    } else if (audioFile.type.includes('wav')) {
      encoding = 'LINEAR16';
    } else if (audioFile.type.includes('flac')) {
      encoding = 'FLAC';
    }

    console.log('Using encoding:', encoding, 'for type:', audioFile.type);

    // Call Google Cloud Speech-to-Text API
    const googleResponse = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: encoding,
            sampleRateHertz: 48000,
            languageCode: languageCode,
            enableAutomaticPunctuation: true,
            model: 'latest_long',
            useEnhanced: true,
            alternativeLanguageCodes: ['en-US', 'en-GB'], // Fallback languages
          },
          audio: {
            content: base64Audio,
          },
        }),
      }
    );

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      console.error('Google STT API error:', googleResponse.status, errorText);
      
      // Try with different sample rate if it fails
      if (errorText.includes('sample_rate') || errorText.includes('encoding')) {
        console.log('Retrying with different sample rate...');
        const retryResponse = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              config: {
                encoding: encoding,
                sampleRateHertz: 16000,
                languageCode: languageCode,
                enableAutomaticPunctuation: true,
              },
              audio: {
                content: base64Audio,
              },
            }),
          }
        );
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          const transcript = retryData.results
            ?.map((result: any) => result.alternatives?.[0]?.transcript)
            .filter(Boolean)
            .join(' ') || '';
          
          console.log('Retry successful, transcript:', transcript.substring(0, 100));
          
          return new Response(
            JSON.stringify({ text: transcript }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ error: 'Google Speech-to-Text failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await googleResponse.json();
    console.log('Google STT response:', JSON.stringify(data).substring(0, 500));

    // Extract transcript from response
    const transcript = data.results
      ?.map((result: any) => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join(' ') || '';

    console.log('Final transcript:', transcript.substring(0, 100));

    return new Response(
      JSON.stringify({ text: transcript }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Google STT error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
