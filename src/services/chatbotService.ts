import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, ThinkingPhase } from '../types/chat';

const STORAGE_KEY = '@finatic_subclear_chat_v1';
const PRIMARY_ENDPOINT = 'https://chatbot-finatiq.onrender.com/answer';
const FALLBACK_ENDPOINT = 'https://chatbot-finatiq.onrender.com';
const REQUEST_TIMEOUT_MS = 60000; // 60s to accommodate Render cold start

export const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg_welcome_v2',
  sender: 'assistant',
  text: `SubClear AI Copilot Ready

Fintech Intelligence Services:
- Decoding Cryptic Descriptors: Resolve bank transaction strings to real merchant entities
- Price Hike Detection: Identify silent subscription rate increases across billing cycles
- Cancellation Runbooks: Direct step-by-step procedures for UPI AutoPay, Card SI, and NACH
- Legal Revocation Notices: Generate Section 25 PSSA dispute templates for non-responsive merchants
- Annual Cost Audits: Real-time calculation of annualized recurring outflow

Select an audit prompt below or paste an SMS descriptor to begin.`,
  timestamp: Date.now(),
};

/**
 * Loads stored chat messages or initializes with the welcome message
 */
export async function getStoredChatMessages(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: ChatMessage[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m) =>
          m.id === 'msg_welcome' || m.id === 'msg_welcome_v2' ? INITIAL_WELCOME_MESSAGE : m
        );
      }
    }
  } catch (err) {
    console.warn('Failed to load chat history from storage:', err);
  }
  return [INITIAL_WELCOME_MESSAGE];
}

/**
 * Saves chat messages to persistent storage
 */
export async function saveChatMessages(messages: ChatMessage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (err) {
    console.warn('Failed to save chat history to storage:', err);
  }
}

/**
 * Clears chat history and resets to initial welcome message
 */
export async function resetChatMessages(): Promise<ChatMessage[]> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear chat storage:', err);
  }
  return [{ ...INITIAL_WELCOME_MESSAGE, timestamp: Date.now() }];
}

export interface SendMessageOptions {
  onPhaseChange?: (phase: ThinkingPhase, elapsedSeconds: number) => void;
  onServerWarming?: (isWarming: boolean) => void;
}

/**
 * Sends a message to the SubClear AI backend and tracks thinking phases
 */
export async function sendQueryToChatbot(
  query: string,
  options?: SendMessageOptions
): Promise<string> {
  const startTime = Date.now();
  let elapsedSeconds = 0;
  let serverWarmingFlag = false;

  // Interval timer to drive dynamic thinking phases while waiting
  const progressTimer = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    let phase: ThinkingPhase = 'ANALYZING_QUERY';
    if (elapsedSeconds >= 2 && elapsedSeconds < 5) {
      phase = 'SCANNING_TAXONOMY';
    } else if (elapsedSeconds >= 5 && elapsedSeconds < 8) {
      phase = 'EVALUATING_MANDATES';
    } else if (elapsedSeconds >= 8) {
      phase = 'SYNTHESIZING_RESPONSE';
    }

    if (elapsedSeconds >= 6 && !serverWarmingFlag) {
      serverWarmingFlag = true;
      options?.onServerWarming?.(true);
      phase = 'WARMING_SERVER';
    }

    options?.onPhaseChange?.(phase, elapsedSeconds);
  }, 1000);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    options?.onPhaseChange?.('ANALYZING_QUERY', 0);

    // Try primary endpoint (/answer) first
    let response: Response;
    try {
      response = await fetch(PRIMARY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ inp: query.trim() }),
        signal: controller.signal,
      });
    } catch (primaryErr: any) {
      // If primary failed or aborted due to timeout, rethrow or try fallback
      if (primaryErr.name === 'AbortError') {
        throw new Error('Connection timed out. The server on Render may be taking longer to wake up. Please try again.');
      }

      // Try fallback endpoint (/)
      response = await fetch(FALLBACK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ inp: query.trim() }),
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);
    clearInterval(progressTimer);
    options?.onServerWarming?.(false);

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Chatbot server error response:', response.status, errText);
      throw new Error(`Server returned error ${response.status}. Please try again.`);
    }

    const data = await response.json();

    // Expected response format: { "message": "string" }
    if (data && typeof data.message === 'string' && data.message.trim().length > 0) {
      return data.message.trim();
    }

    if (data && typeof data === 'string') {
      return data;
    }

    throw new Error('Unexpected response format received from AI server.');
  } catch (err: any) {
    clearTimeout(timeoutId);
    clearInterval(progressTimer);
    options?.onServerWarming?.(false);

    console.error('Error contacting SubClear AI chatbot:', err);
    throw err;
  }
}

/**
 * Formats a prompt to audit a specific mandate with the AI
 */
export function buildMandateAuditPrompt(params: {
  merchantName: string;
  rawDescriptor: string;
  monthlyAmount: number;
  paymentRail: string;
  threatType: string;
  status: string;
}): string {
  return `Please audit this recurring mandate detected on my account:
- Merchant: ${params.merchantName}
- Raw Bank Descriptor: ${params.rawDescriptor}
- Current Monthly Amount: ₹${params.monthlyAmount}
- Payment Rail: ${params.paymentRail}
- Threat Classification: ${params.threatType}
- Status: ${params.status}

Give me an audit breakdown, check for known pricing increases, and provide cancellation runbook instructions.`;
}
