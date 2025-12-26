-- Insert streaming TTS feature flag
INSERT INTO public.feature_flags (feature_key, enabled, description, requires_connection)
VALUES ('streaming_tts', false, 'Använd streaming TTS för snabbare ljuduppspelning (startar spela upp innan hela filen är genererad)', 'ELEVENLABS_API_KEY')
ON CONFLICT (feature_key) DO NOTHING;