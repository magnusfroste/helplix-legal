-- 1. Skapa profiles-tabell kopplad till auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Aktivera RLS på profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies för profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Trigger för att skapa profil vid signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, country)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'country', 'SE'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Uppdatera sessions RLS - fixa från "true" till auth.uid()
DROP POLICY IF EXISTS "Allow all access to sessions" ON public.sessions;

CREATE POLICY "Users can view own sessions"
ON public.sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
ON public.sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON public.sessions FOR DELETE
USING (auth.uid() = user_id);

-- 6. Uppdatera log_entries RLS
DROP POLICY IF EXISTS "Allow all access to log_entries" ON public.log_entries;

CREATE POLICY "Users can view own log entries"
ON public.log_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own log entries"
ON public.log_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own log entries"
ON public.log_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own log entries"
ON public.log_entries FOR DELETE
USING (auth.uid() = user_id);

-- 7. Uppdatera reports RLS
DROP POLICY IF EXISTS "Allow all access to reports" ON public.reports;

CREATE POLICY "Users can view own reports"
ON public.reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
ON public.reports FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
ON public.reports FOR DELETE
USING (auth.uid() = user_id);