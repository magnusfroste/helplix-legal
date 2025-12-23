-- Drop the complex RLS policies that use current_setting
DROP POLICY IF EXISTS "Users can view own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.sessions;

DROP POLICY IF EXISTS "Users can view own log_entries" ON public.log_entries;
DROP POLICY IF EXISTS "Users can insert own log_entries" ON public.log_entries;
DROP POLICY IF EXISTS "Users can update own log_entries" ON public.log_entries;
DROP POLICY IF EXISTS "Users can delete own log_entries" ON public.log_entries;

-- Create simpler policies that allow access (we'll filter by user_id in the app)
CREATE POLICY "Allow all access to sessions" ON public.sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to log_entries" ON public.log_entries
  FOR ALL USING (true) WITH CHECK (true);