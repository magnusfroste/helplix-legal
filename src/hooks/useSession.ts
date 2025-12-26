import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { LogEntry } from '@/types/helplix';

interface Session {
  id: string;
  title: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

interface UseSessionOptions {
  userId?: string;
  onError?: (error: string) => void;
}

export function useSession({ userId, onError }: UseSessionOptions = {}) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all sessions for the current user
  const loadSessions = useCallback(async () => {
    if (!userId) {
      setSessions([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      onError?.('Failed to load sessions');
    }
  }, [userId, onError]);

  // Create a new session
  const createSession = useCallback(async (title?: string): Promise<string> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ 
          title: title || 'New Session',
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(data.id);
      await loadSessions();
      return data.id;
    } catch (error) {
      console.error('Failed to create session:', error);
      onError?.('Failed to create session');
      throw error;
    }
  }, [userId, loadSessions, onError]);

  // Load log entries for a session
  const loadLogEntries = useCallback(async (sessionId: string): Promise<LogEntry[]> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('log_entries')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(entry => ({
        id: entry.id,
        type: entry.type as LogEntry['type'],
        content: entry.content,
        timestamp: new Date(entry.created_at),
        audioUrl: entry.audio_url || undefined,
      }));
    } catch (error) {
      console.error('Failed to load log entries:', error);
      onError?.('Failed to load conversation');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Add a log entry
  const addLogEntry = useCallback(async (
    sessionId: string,
    entry: Omit<LogEntry, 'id' | 'timestamp'>
  ): Promise<LogEntry | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('log_entries')
        .insert({
          session_id: sessionId,
          type: entry.type,
          content: entry.content,
          audio_url: entry.audioUrl,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Also update the session's updated_at
      await supabase
        .from('sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return {
        id: data.id,
        type: data.type as LogEntry['type'],
        content: data.content,
        timestamp: new Date(data.created_at),
        audioUrl: data.audio_url || undefined,
      };
    } catch (error) {
      console.error('Failed to add log entry:', error);
      onError?.('Failed to save entry');
      return null;
    }
  }, [userId, onError]);

  // Update session title/language
  const updateSession = useCallback(async (
    sessionId: string,
    updates: { title?: string; language?: string }
  ) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
      await loadSessions();
    } catch (error) {
      console.error('Failed to update session:', error);
      onError?.('Failed to update session');
    }
  }, [loadSessions, onError]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      await loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
      onError?.('Failed to delete session');
    }
  }, [currentSessionId, loadSessions, onError]);

  // Load sessions when userId changes
  useEffect(() => {
    if (userId) {
      loadSessions();
    } else {
      setSessions([]);
      setCurrentSessionId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    currentSessionId,
    setCurrentSessionId,
    sessions,
    isLoading,
    createSession,
    loadLogEntries,
    addLogEntry,
    updateSession,
    deleteSession,
    loadSessions,
  };
}
