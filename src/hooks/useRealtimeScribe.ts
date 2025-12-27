import { useState, useRef, useCallback, useEffect } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface UseRealtimeScribeOptions {
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

// Check if we're on iOS/Safari
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export function useRealtimeScribe(options: UseRealtimeScribeOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    console.log('Cleaning up realtime scribe...');
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Resample audio from source rate to target rate (16000)
  const resampleAudio = useCallback((inputData: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array => {
    if (inputSampleRate === outputSampleRate) {
      return inputData;
    }
    
    const ratio = inputSampleRate / outputSampleRate;
    const outputLength = Math.round(inputData.length / ratio);
    const output = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, inputData.length - 1);
      const t = srcIndex - srcIndexFloor;
      output[i] = inputData[srcIndexFloor] * (1 - t) + inputData[srcIndexCeil] * t;
    }
    
    return output;
  }, []);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) {
      console.log('Already connected or connecting');
      return;
    }

    setIsConnecting(true);
    setPartialTranscript('');
    setFinalTranscript('');

    try {
      console.log('Getting scribe token...');
      
      const tokenResponse = await fetch(
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

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || 'Failed to get token');
      }

      const { token } = await tokenResponse.json();
      
      if (!token) {
        throw new Error('No token received');
      }

      console.log('Token received, connecting to WebSocket...');

      // Connect to ElevenLabs Scribe WebSocket
      const ws = new WebSocket(
        `wss://api.elevenlabs.io/v1/realtime-scribe?model_id=scribe_v2_realtime&token=${token}`
      );
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('WebSocket connected, starting audio capture...');
        
        try {
          // Get microphone access - don't force sample rate on iOS
          const constraints: MediaStreamConstraints = {
            audio: {
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              // Only set sampleRate on non-iOS platforms
              ...((!isIOS() && !isSafari()) && { sampleRate: 16000 }),
            }
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;

          // Create audio context - let iOS choose its native sample rate
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContextClass();
          await audioContext.resume();
          audioContextRef.current = audioContext;
          
          const actualSampleRate = audioContext.sampleRate;
          console.log('Audio context sample rate:', actualSampleRate);

          // Create audio source
          const source = audioContext.createMediaStreamSource(stream);
          
          // Create analyser for audio level
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;
          source.connect(analyser);
          analyserRef.current = analyser;

          // Start audio level monitoring
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateLevel = () => {
            if (analyserRef.current && streamRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
              setAudioLevel(Math.min(100, (avg / 128) * 100));
              animationFrameRef.current = requestAnimationFrame(updateLevel);
            }
          };
          animationFrameRef.current = requestAnimationFrame(updateLevel);

          // Use ScriptProcessorNode (deprecated but more compatible with iOS)
          // Buffer size of 4096 works better on iOS
          const bufferSize = isIOS() || isSafari() ? 4096 : 2048;
          const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
          workletNodeRef.current = processor;
          
          processor.onaudioprocess = (event) => {
            if (ws.readyState === WebSocket.OPEN) {
              const inputData = event.inputBuffer.getChannelData(0);
              
              // Resample if needed (iOS often uses 48000 Hz)
              const resampledData = resampleAudio(inputData, actualSampleRate, 16000);
              
              // Convert Float32 to Int16 PCM
              const pcmData = new Int16Array(resampledData.length);
              for (let i = 0; i < resampledData.length; i++) {
                const s = Math.max(-1, Math.min(1, resampledData[i]));
                pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              
              // Convert to base64
              const uint8Array = new Uint8Array(pcmData.buffer);
              let binary = '';
              const chunkSize = 0x8000;
              for (let i = 0; i < uint8Array.length; i += chunkSize) {
                const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
                binary += String.fromCharCode.apply(null, Array.from(chunk));
              }
              const base64Audio = btoa(binary);
              
              // Send audio to ElevenLabs
              ws.send(JSON.stringify({
                audio: base64Audio,
              }));
            }
          };

          source.connect(processor);
          // On iOS/Safari, connect to destination to keep the audio pipeline alive
          processor.connect(audioContext.destination);

          setIsConnected(true);
          setIsConnecting(false);
          console.log('Realtime scribe fully connected and streaming');
          
        } catch (audioError) {
          console.error('Audio setup error:', audioError);
          cleanup();
          options.onError?.('Kunde inte starta mikrofon');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Scribe message:', data.type);
          
          if (data.type === 'partial_transcript') {
            const text = data.text || '';
            setPartialTranscript(text);
            options.onPartialTranscript?.(text);
          } else if (data.type === 'committed_transcript') {
            const text = data.text || '';
            setFinalTranscript(prev => prev + ' ' + text);
            setPartialTranscript('');
            options.onFinalTranscript?.(text);
          } else if (data.type === 'error') {
            console.error('Scribe error:', data);
            options.onError?.(data.message || 'Transkriptionsfel');
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        options.onError?.('WebSocket-anslutningsfel');
        cleanup();
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        cleanup();
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      options.onError?.(error instanceof Error ? error.message : 'Anslutningsfel');
      cleanup();
    }
  }, [isConnected, isConnecting, cleanup, options, resampleAudio]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting realtime scribe...');
    cleanup();
  }, [cleanup]);

  const commit = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'commit' }));
    }
  }, []);

  const getTranscript = useCallback(() => {
    return (finalTranscript + ' ' + partialTranscript).trim();
  }, [finalTranscript, partialTranscript]);

  return {
    isConnected,
    isConnecting,
    partialTranscript,
    finalTranscript,
    audioLevel,
    connect,
    disconnect,
    commit,
    getTranscript,
  };
}
