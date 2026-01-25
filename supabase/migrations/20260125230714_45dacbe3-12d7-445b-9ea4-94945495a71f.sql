-- Ta bort den gamla users-tabellen med pin_hash
-- Denna tabell används inte längre - autentisering sker nu via Supabase Auth
-- och profiles-tabellen används för användarprofiler

DROP TABLE IF EXISTS public.users CASCADE;