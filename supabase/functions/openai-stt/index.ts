import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Model can be overridden via the OPENAI_STT_MODEL secret.
// gpt-4o-mini-transcribe is the cheapest option; whisper-1 and
// gpt-4o-transcribe are also valid values.
const DEFAULT_MODEL = "gpt-4o-mini-transcribe";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const model = Deno.env.get("OPENAI_STT_MODEL") || DEFAULT_MODEL;

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    // Client sends locale-style codes such as "sv-SE"; OpenAI expects
    // an ISO-639-1 code ("sv"). Normalize and pass it as a hint.
    const rawLanguage = (formData.get("language") as string) || "";
    const language = rawLanguage.split("-")[0]?.toLowerCase() || "";

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "No audio file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("OpenAI STT request:", {
      size: audioFile.size,
      type: audioFile.type,
      name: audioFile.name,
      model,
      language: language || "(auto)",
    });

    if (audioFile.size < 100) {
      return new Response(
        JSON.stringify({ error: "Audio file too small - no speech detected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Preserve the incoming MIME type / extension so OpenAI can decode it.
    const mimeType = audioFile.type || "audio/webm";
    const fileName = audioFile.name || "audio.webm";
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: mimeType });

    const openaiForm = new FormData();
    openaiForm.append("file", audioBlob, fileName);
    openaiForm.append("model", model);
    openaiForm.append("response_format", "json");
    if (language) {
      openaiForm.append("language", language);
    }

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: openaiForm,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI STT error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI STT failed: ${response.status}`, details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const text = data.text || "";
    console.log("OpenAI STT success:", text.substring(0, 100));

    return new Response(
      JSON.stringify({ text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("OpenAI STT error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
