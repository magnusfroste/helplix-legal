import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CountryCode } from '@/types/cooper';

interface User {
  id: string;
  country: CountryCode;
}

const USER_STORAGE_KEY = 'cooper-user-id';

// Simple hash function for PIN (for demo purposes - in production use bcrypt via edge function)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'cooper-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUserId = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUserId) {
          const { data, error } = await supabase
            .from('users')
            .select('id, country')
            .eq('id', storedUserId)
            .single();
          
          if (data && !error) {
            setUser({ id: data.id, country: data.country as CountryCode });
          } else {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Check if PIN exists for a country
  const checkPinExists = useCallback(async (pin: string): Promise<{ exists: boolean; userId?: string }> => {
    try {
      const pinHash = await hashPin(pin);
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('pin_hash', pinHash)
        .maybeSingle();
      
      if (error) throw error;
      
      return { exists: !!data, userId: data?.id };
    } catch (e) {
      console.error('Failed to check PIN:', e);
      return { exists: false };
    }
  }, []);

  // Login with PIN
  const login = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const pinHash = await hashPin(pin);
      const { data, error } = await supabase
        .from('users')
        .select('id, country')
        .eq('pin_hash', pinHash)
        .single();
      
      if (error || !data) {
        return { success: false, error: 'Felaktig PIN-kod' };
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.id);

      // Store user ID
      localStorage.setItem(USER_STORAGE_KEY, data.id);
      setUser({ id: data.id, country: data.country as CountryCode });
      
      return { success: true };
    } catch (e) {
      console.error('Login failed:', e);
      return { success: false, error: 'Ett fel uppstod vid inloggning' };
    }
  }, []);

  // Create new user with PIN
  const createUser = useCallback(async (pin: string, country: CountryCode): Promise<{ success: boolean; error?: string }> => {
    try {
      const pinHash = await hashPin(pin);
      
      // Check if PIN already exists
      const { exists } = await checkPinExists(pin);
      if (exists) {
        return { success: false, error: 'Denna PIN-kod används redan. Välj en annan.' };
      }

      const { data, error } = await supabase
        .from('users')
        .insert({ pin_hash: pinHash, country })
        .select('id, country')
        .single();
      
      if (error) {
        console.error('Create user error:', error);
        return { success: false, error: 'Kunde inte skapa användare' };
      }

      // Store user ID
      localStorage.setItem(USER_STORAGE_KEY, data.id);
      setUser({ id: data.id, country: data.country as CountryCode });
      
      return { success: true };
    } catch (e) {
      console.error('Create user failed:', e);
      return { success: false, error: 'Ett fel uppstod vid skapande av konto' };
    }
  }, [checkPinExists]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    login,
    createUser,
    logout,
    checkPinExists,
  };
}
