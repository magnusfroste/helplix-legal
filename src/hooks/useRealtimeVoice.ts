import { useState, useRef, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useRealtimeVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      console.log('Starting recording...');
      chunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;
      
      // Try different mime types for better compatibility
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      if (!selectedMimeType) {
        throw new Error('No supported audio MIME type found');
      }
      
      console.log('Using MIME type:', selectedMimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: selectedMimeType,
      });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      // Use timeslice to collect data every 250ms during recording
      mediaRecorder.start(250);
      setIsRecording(true);
      console.log('Recording started with timeslice');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        console.log('No active recording');
        setIsRecording(false);
        resolve('');
        return;
      }
      
      console.log('Stopping recording, state:', mediaRecorder.state);
      setIsTranscribing(true);
      
      mediaRecorder.onstop = async () => {
        try {
          console.log('MediaRecorder stopped, chunks:', chunksRef.current.length);
          
          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          
          if (chunksRef.current.length === 0) {
            console.log('No audio chunks captured');
            setIsRecording(false);
            setIsTranscribing(false);
            resolve('');
            return;
          }
          
          const mimeType = mediaRecorder.mimeType;
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          console.log('Audio blob created:', audioBlob.size, 'bytes, type:', audioBlob.type);
          
          // Determine file extension
          const extension = mimeType.includes('webm') ? 'webm' : 
                           mimeType.includes('mp4') ? 'mp4' : 
                           mimeType.includes('ogg') ? 'ogg' : 'webm';
          
          // Send to STT
          const formData = new FormData();
          formData.append('audio', audioBlob, `recording.${extension}`);
          
          console.log('Sending to STT...');
          const response = await fetch(
            `${SUPABASE_URL}/functions/v1/elevenlabs-stt`,
            {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
              },
              body: formData,
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'STT failed');
          }
          
          const data = await response.json();
          console.log('STT result:', data.text);
          
          setIsRecording(false);
          setIsTranscribing(false);
          resolve(data.text || '');
        } catch (error) {
          console.error('Error processing audio:', error);
          setIsRecording(false);
          setIsTranscribing(false);
          reject(error);
        }
      };
      
      // Stop recording - this triggers ondataavailable with all data
      mediaRecorder.stop();
    });
  }, []);

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
    isConnected: true,
    partialTranscript: '',
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
}
