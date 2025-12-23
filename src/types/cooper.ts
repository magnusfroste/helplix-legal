// Cooper App Types

export type ConversationStatus = 
  | 'idle'           // Waiting for user to start
  | 'listening'      // Recording user's voice
  | 'processing'     // Transcribing audio
  | 'thinking'       // AI generating response
  | 'speaking';      // Playing AI response

export type LogEntryType = 'question' | 'answer' | 'system';

export interface LogEntry {
  id: string;
  type: LogEntryType;
  content: string;
  timestamp: Date;
  audioUrl?: string;
  language?: string;
}

export interface ConversationState {
  status: ConversationStatus;
  currentQuestion: string;
  language: string | null;
  questionCount: number;
  isFirstInteraction: boolean;
}

export interface CooperSettings {
  systemPrompt: string;
  questionIntensity: number; // 0-100, higher = more questions
  textSize: 'small' | 'medium' | 'large';
  buttonSize: 'small' | 'large';
  autoplaySpeech: boolean;
}

export const DEFAULT_SYSTEM_PROMPT = `You are Cooper, a legal assistant specializing in Brazilian law. Your role is to help document legal cases by asking structured questions.

IMPORTANT RULES:
1. Start by asking what language the user prefers to communicate in.
2. After language is established, ask general opening questions about the case.
3. Progressively ask more specific questions based on answers.
4. Keep questions short and focused - one topic at a time.
5. Be patient and understanding - the user may be elderly.
6. Build a complete timeline of events through your questions.
7. Identify potential legal issues relevant to Brazilian law.
8. Never give legal advice - only document and clarify facts.

Your goal is to help prepare the user for potential legal proceedings by thoroughly documenting their case.`;

export const DEFAULT_SETTINGS: CooperSettings = {
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  questionIntensity: 70, // Default to more questions
  textSize: 'medium',
  buttonSize: 'large',
  autoplaySpeech: true,
};
