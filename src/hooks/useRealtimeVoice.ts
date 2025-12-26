import { useState, useRef, useCallback, useEffect } from 'react';
import { useRealtimeScribe } from './useRealtimeScribe';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface UseRealtimeVoiceOptions {
  useRealtimeSTT?: boolean;
  useStreamingTTS?: boolean;
  onRealtimeTranscript?: (text: string) => void;
}

export function useRealtimeVoice(options: UseRealtimeVoiceOptions = {}) {
  const { useRealtimeSTT = false, useStreamingTTS = false, onRealtimeTranscript } = options;
  
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [realtimeTranscript, setRealtimeTranscript] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const preloadedStreamRef = useRef<MediaStream | null>(null);
  const preloadedAudioContextRef = useRef<AudioContext | null>(null);

  // Realtime scribe hook for WebSocket-based STT
  const realtimeScribe = useRealtimeScribe({
    onPartialTranscript: (text) => {
      setRealtimeTranscript(text);
      onRealtimeTranscript?.(text);
    },
    onFinalTranscript: (text) => {
      setRealtimeTranscript('');
      onRealtimeTranscript?.(text);
    },
    onError: (error) => {
      console.error('Realtime scribe error:', error);
    },
  });

  // Preload microphone access on first user interaction
  const preloadMicrophone = useCallback(async () => {
    if (isPreloaded || preloadedStreamRef.current) return;
    
    try {
      console.log('Preloading microphone...');
      
      // Pre-warm AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await audioContext.resume();
      preloadedAudioContextRef.current = audioContext;
      
      // Pre-request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        } 
      });
      
      preloadedStreamRef.current = stream;
      setIsPreloaded(true);
      console.log('Microphone preloaded successfully');
    } catch (error) {
      console.log('Microphone preload failed (will request on first recording):', error);
    }
  }, [isPreloaded]);

  // Preload on first user interaction (touch/click anywhere)
  useEffect(() => {
    const handleFirstInteraction = () => {
      preloadMicrophone();
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    document.addEventListener('click', handleFirstInteraction, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [preloadMicrophone]);

  // Cleanup preloaded resources on unmount
  useEffect(() => {
    return () => {
      if (preloadedStreamRef.current) {
        preloadedStreamRef.current.getTracks().forEach(track => track.stop());
        preloadedStreamRef.current = null;
      }
      if (preloadedAudioContextRef.current) {
        preloadedAudioContextRef.current.close();
        preloadedAudioContextRef.current = null;
      }
    };
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    // If using realtime STT, use WebSocket-based scribe
    if (useRealtimeSTT) {
      console.log('Starting realtime STT recording...');
      setIsRecording(true);
      await realtimeScribe.connect();
      return;
    }

    // Batch mode - original implementation
    try {
      console.log('Starting batch recording...');
      chunksRef.current = [];
      
      let stream: MediaStream;
      let audioContext: AudioContext;
      
      // Use preloaded stream if available, otherwise request new one
      if (preloadedStreamRef.current && preloadedStreamRef.current.active) {
        console.log('Using preloaded microphone stream');
        stream = preloadedStreamRef.current;
        preloadedStreamRef.current = null; // Clear so we request fresh next time
        
        // Use preloaded AudioContext or create new one
        if (preloadedAudioContextRef.current && preloadedAudioContextRef.current.state !== 'closed') {
          audioContext = preloadedAudioContextRef.current;
          preloadedAudioContextRef.current = null;
        } else {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          await audioContext.resume();
        }
      } else {
        console.log('Requesting new microphone stream');
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 16000,
          } 
        });
        
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        await audioContext.resume();
      }
      
      streamRef.current = stream;
      audioContextRef.current = audioContext;
      
      // Verify audio track is active
      const audioTrack = stream.getAudioTracks()[0];
      console.log('Audio track:', audioTrack.label, 'enabled:', audioTrack.enabled, 'muted:', audioTrack.muted);
      
      // Setup audio level monitoring
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Real-time audio level monitoring with animation frame
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioLevel = () => {
        if (analyserRef.current && streamRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const normalizedLevel = Math.min(100, (average / 128) * 100);
          setAudioLevel(normalizedLevel);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      
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
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = mediaRecorder;
      
      // Store cleanup function
      (mediaRecorder as any)._cleanup = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setAudioLevel(0);
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        analyserRef.current = null;
      };
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      // Start recording - collect all data on stop (no timeslice)
      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started');
      
      // Pre-request a new stream for next recording (in background)
      setTimeout(async () => {
        try {
          if (!preloadedStreamRef.current) {
            const nextStream = await navigator.mediaDevices.getUserMedia({ 
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                channelCount: 1,
                sampleRate: 16000,
              } 
            });
            preloadedStreamRef.current = nextStream;
            
            const nextContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            await nextContext.resume();
            preloadedAudioContextRef.current = nextContext;
            
            console.log('Next microphone stream preloaded');
          }
        } catch (e) {
          console.log('Failed to preload next stream:', e);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [useRealtimeSTT, realtimeScribe]);

  const stopRecording = useCallback(async (): Promise<string> => {
    // If using realtime STT, get transcript and disconnect
    if (useRealtimeSTT) {
      console.log('Stopping realtime STT recording...');
      realtimeScribe.commit(); // Commit any remaining audio
      
      // Give a small delay for final transcript
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const transcript = realtimeScribe.getTranscript();
      realtimeScribe.disconnect();
      setIsRecording(false);
      
      console.log('Realtime transcript:', transcript);
      return transcript;
    }

    // Batch mode - original implementation
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
          
          // Cleanup audio context
          if ((mediaRecorder as any)._cleanup) {
            (mediaRecorder as any)._cleanup();
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
  }, [useRealtimeSTT, realtimeScribe]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text) return;
    
    try {
      setIsSpeaking(true);
      
      // Stop any current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Choose TTS endpoint based on flag
      const endpoint = useStreamingTTS ? 'elevenlabs-tts-stream' : 'elevenlabs-tts';
      console.log(`Speaking (${useStreamingTTS ? 'streaming' : 'batch'}):`, text.substring(0, 50) + '...');
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/${endpoint}`,
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
        // Try to parse error, but response might be streaming
        let errorMessage = 'TTS failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `TTS failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Streaming mode: read chunks and start playback early
      if (useStreamingTTS) {
        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let totalSize = 0;
        let audioStarted = false;
        let audio: HTMLAudioElement | null = null;

        const startPlayback = async () => {
          if (audioStarted || chunks.length === 0) return;
          audioStarted = true;
          
          const combinedArray = new Uint8Array(totalSize);
          let offset = 0;
          for (const chunk of chunks) {
            combinedArray.set(chunk, offset);
            offset += chunk.length;
          }
          
          const audioBlob = new Blob([combinedArray], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          audio = new Audio(audioUrl);
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
          
          try {
            await audio.play();
            console.log('Audio playback started with', totalSize, 'bytes');
          } catch (playError) {
            console.error('Play error:', playError);
            setIsSpeaking(false);
          }
        };

        const MIN_BYTES_BEFORE_PLAY = 8192;
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Stream complete, total bytes:', totalSize);
            if (!audioStarted) {
              await startPlayback();
            }
            break;
          }
          
          if (value) {
            chunks.push(value);
            totalSize += value.length;
            
            if (!audioStarted && totalSize >= MIN_BYTES_BEFORE_PLAY) {
              console.log('Starting early playback at', totalSize, 'bytes');
              await startPlayback();
            }
          }
        }
      } else {
        // Batch mode: wait for full response
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
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
        console.log('Audio playback started (batch mode)');
      }
      
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      throw error;
    }
  }, [useStreamingTTS]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  // Combine audio level from either realtime or batch mode
  const effectiveAudioLevel = useRealtimeSTT && realtimeScribe.isConnected 
    ? realtimeScribe.audioLevel 
    : audioLevel;

  return {
    isRecording: useRealtimeSTT ? realtimeScribe.isConnected : isRecording,
    isTranscribing,
    isSpeaking,
    audioLevel: effectiveAudioLevel,
    isConnected: true,
    isPreloaded,
    partialTranscript: useRealtimeSTT ? realtimeScribe.partialTranscript : '',
    realtimeTranscript,
    preloadMicrophone,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
}
