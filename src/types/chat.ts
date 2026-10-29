export type MessageSender = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  thinkingSteps?: string[];
  isError?: boolean;
}

export type ThinkingPhase =
  | 'ANALYZING_QUERY'
  | 'SCANNING_TAXONOMY'
  | 'EVALUATING_MANDATES'
  | 'SYNTHESIZING_RESPONSE'
  | 'WARMING_SERVER';

export interface ChatState {
  messages: ChatMessage[];
  isThinking: boolean;
  currentPhase: ThinkingPhase;
  thinkingElapsedSeconds: number;
  isServerWarmingUp: boolean;
  error: string | null;
}
