-- Add realtime transcription as a global feature flag
INSERT INTO public.feature_flags (feature_key, enabled, description, requires_connection)
VALUES ('realtime_transcription', true, 'Visa tal som text i realtid under inspelning', 'ELEVENLABS_API_KEY')
ON CONFLICT (feature_key) DO NOTHING;