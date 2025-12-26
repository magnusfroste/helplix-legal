-- Drop old foreign key pointing to users table
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Add new foreign key pointing to auth.users
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;