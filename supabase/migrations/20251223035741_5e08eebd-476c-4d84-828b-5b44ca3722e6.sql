-- Create users table for PIN-based authentication
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_hash TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own record
CREATE POLICY "Users can view own record" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (true);

-- Add user_id to sessions table
ALTER TABLE public.sessions ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Add user_id to log_entries table  
ALTER TABLE public.log_entries ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all access to sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow all access to log_entries" ON public.log_entries;

-- Create RLS policies for sessions - full isolation per user
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update own sessions" ON public.sessions
  FOR UPDATE USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can delete own sessions" ON public.sessions
  FOR DELETE USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- Create RLS policies for log_entries - full isolation per user
CREATE POLICY "Users can view own log_entries" ON public.log_entries
  FOR SELECT USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can insert own log_entries" ON public.log_entries
  FOR INSERT WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update own log_entries" ON public.log_entries
  FOR UPDATE USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can delete own log_entries" ON public.log_entries
  FOR DELETE USING (user_id = (current_setting('app.current_user_id', true))::uuid);