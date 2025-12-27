-- First, drop the existing foreign key constraints
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE public.log_entries DROP CONSTRAINT IF EXISTS log_entries_user_id_fkey;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_user_id_fkey;

-- Delete orphaned records that reference non-existent auth.users
DELETE FROM public.log_entries WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.reports WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.sessions WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Now add the correct foreign key constraints to auth.users
ALTER TABLE public.sessions 
ADD CONSTRAINT sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.log_entries 
ADD CONSTRAINT log_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.reports 
ADD CONSTRAINT reports_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;