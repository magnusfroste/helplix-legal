import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    if (!audioFile) {
      throw new Error("Audio file is required");
    }

    console.log("Transcribing audio file:", {
      size: audioFile.size,
      type: audioFile.type,
      name: audioFile.name,
    });

    // Read the audio file as array buffer
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    console.log("Audio bytes length:", audioBytes.length);

    // Validate that we have actual audio data
    if (audioBytes.length < 100) {
      throw new Error("Audio file too small - no speech detected");
    }

    // Determine the correct MIME type and filename
    let mimeType = audioFile.type || "audio/webm";
    let fileName = audioFile.name || "audio.webm";

    // ElevenLabs prefers specific formats
    if (mimeType.includes("webm")) {
      mimeType = "audio/webm";
      fileName = "audio.webm";
    } else if (mimeType.includes("mp4") || mimeType.includes("m4a")) {
      mimeType = "audio/mp4";
      fileName = "audio.mp4";
    }

    console.log("Sending to ElevenLabs with:", { mimeType, fileName });

    // Create a new blob with the correct MIME type
    const audioBlob = new Blob([audioBytes], { type: mimeType });

    const apiFormData = new FormData();
    apiFormData.append("file", audioBlob, fileName);
    apiFormData.append("model_id", "scribe_v1");

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs STT error:", response.status, errorText);
      throw new Error(`STT API error: ${response.status} - ${errorText}`);
    }

    const transcription = await response.json();
    console.log("Transcription success:", transcription.text?.substring(0, 100));

    return new Response(JSON.stringify({ text: transcription.text || "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("STT error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
