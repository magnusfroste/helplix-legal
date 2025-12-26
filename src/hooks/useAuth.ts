import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { CountryCode } from '@/types/cooper';

interface AuthUser {
  id: string;
  email: string;
  country: CountryCode;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to extract user data from session
  const extractUserData = useCallback(async (supabaseUser: User): Promise<AuthUser | null> => {
    // Try to get country from profile first
    const { data: profile } = await supabase
      .from('profiles')
      .select('country')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    const country = (profile?.country || supabaseUser.user_metadata?.country || 'SE') as CountryCode;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      country,
    };
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      
      if (newSession?.user) {
        // Defer the async profile fetch
        setTimeout(async () => {
          const userData = await extractUserData(newSession.user);
          setUser(userData);
        }, 0);
      } else {
        setUser(null);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      
      if (existingSession?.user) {
        const userData = await extractUserData(existingSession.user);
        setUser(userData);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [extractUserData]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    country: CountryCode
  ): Promise<{ success: boolean; error?: string }> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          country,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    login,
    signUp,
    logout,
  };
}