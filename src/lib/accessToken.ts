import { supabase } from '@/integrations/supabase/client';

// Edge functions require the signed-in user's token, not the public key.
export async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
}
