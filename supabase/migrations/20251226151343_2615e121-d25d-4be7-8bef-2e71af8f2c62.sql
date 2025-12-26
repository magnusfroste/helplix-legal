-- Skapa enum för roller
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Skapa user_roles tabell
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Aktivera RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security Definer funktion för rollkontroll (undviker RLS-rekursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies för user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Skapa feature_flags tabell
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  requires_connection TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Aktivera RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS: Alla kan läsa, endast admins kan ändra
CREATE POLICY "Anyone can read feature flags"
  ON public.feature_flags FOR SELECT USING (true);

CREATE POLICY "Only admins can insert feature flags"
  ON public.feature_flags FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update feature flags"
  ON public.feature_flags FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete feature flags"
  ON public.feature_flags FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger för updated_at
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Default feature flags
INSERT INTO public.feature_flags (feature_key, enabled, description, requires_connection) VALUES
  ('perplexity_case_search', false, 'Webbsökning efter rättsfall via Perplexity', 'perplexity'),
  ('realtime_transcription', false, 'Real-time text via WebSocket (kräver framtida implementation)', null),
  ('voice_cloning', false, 'Avancerad röstkloning', 'elevenlabs');