import { useState, useRef, useCallback } from 'react';
import { useScribe, CommitStrategy } from '@elevenlabs/react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useRealtimeVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resolveTranscriptRef = useRef<((text: string) => void) | null>(null);

  const scribe = useScribe({
    modelId: 'scribe_v2_realtime',
    commitStrategy: CommitStrategy.MANUAL,
    onPartialTranscript: (data) => {
      console.log('Partial transcript:', data.text);
      setTranscriptResult(data.text);
    },
    onCommittedTranscript: (data) => {
      console.log('Committed transcript:', data.text);
      setTranscriptResult(data.text);
      if (resolveTranscriptRef.current) {
        resolveTranscriptRef.current(data.text);
        resolveTranscriptRef.current = null;
      }
    },
  });

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      console.log('Starting realtime recording...');
      setTranscriptResult('');
      
      // Get token from edge function
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/elevenlabs-scribe-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get scribe token');
      }

      const { token } = await response.json();
      console.log('Got scribe token, connecting...');

      await scribe.connect({
        token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [scribe]);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Stopping realtime recording...');
        setIsTranscribing(true);
        
        // Store the resolve function to be called when transcript is committed
        resolveTranscriptRef.current = (text: string) => {
          setIsRecording(false);
          setIsTranscribing(false);
          resolve(text);
        };

        // Commit the transcript
        scribe.commit();
        
        // Wait a moment for the commit to process
        setTimeout(async () => {
          // If no committed transcript received, use partial or empty
          if (resolveTranscriptRef.current) {
            const result = transcriptResult || '';
            console.log('Using partial/empty transcript:', result);
            resolveTranscriptRef.current = null;
            setIsRecording(false);
            setIsTranscribing(false);
            
            // Disconnect after getting result
            scribe.disconnect();
            resolve(result);
          }
        }, 1500);
        
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        setIsTranscribing(false);
        scribe.disconnect();
        reject(error);
      }
    });
  }, [scribe, transcriptResult]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text) return;
    
    try {
      setIsSpeaking(true);
      console.log('Speaking:', text.substring(0, 50) + '...');
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS failed');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      throw error;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  return {
    isRecording,
    isTranscribing,
    isSpeaking,
    isConnected: scribe.isConnected,
    partialTranscript: scribe.partialTranscript,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
}
