-- Add OpenAI Speech-to-Text as an admin-toggleable STT provider.
-- Cheaper per-minute alternative to ElevenLabs Scribe; requires the
-- OPENAI_API_KEY secret to be configured in the project.
INSERT INTO public.feature_flags (feature_key, enabled, description, requires_connection)
VALUES ('openai_stt', false, 'OpenAI STT (Whisper/GPT-4o) – billigare alternativ till ElevenLabs', 'OPENAI_API_KEY')
ON CONFLICT (feature_key) DO NOTHING;
