-- Create ai_config table for admin-configurable AI endpoints
CREATE TABLE public.ai_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  endpoint_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model_name TEXT NOT NULL DEFAULT 'gpt-4o',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can access
CREATE POLICY "Only admins can read ai_config"
ON public.ai_config
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert ai_config"
ON public.ai_config
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update ai_config"
ON public.ai_config
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete ai_config"
ON public.ai_config
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_ai_config_updated_at
BEFORE UPDATE ON public.ai_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default config (inactive)
INSERT INTO public.ai_config (config_key, endpoint_url, api_key, model_name, is_active)
VALUES ('primary', 'https://api.openai.com/v1/chat/completions', '', 'gpt-4o', false);