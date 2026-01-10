-- Add new columns to sessions table for case management
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS case_type text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS summary text;

-- Create index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON public.sessions(user_id, status);