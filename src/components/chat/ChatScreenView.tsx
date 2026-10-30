import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ChatMessage, ThinkingPhase } from '../../types/chat';
import {
  getStoredChatMessages,
  saveChatMessages,
  resetChatMessages,
  sendQueryToChatbot,
} from '../../services/chatbotService';
import { ChatBubble } from './ChatBubble';
import { ThinkingIndicator } from './ThinkingIndicator';
import { QuickPrompts } from './QuickPrompts';
import { ChatInput } from './ChatInput';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface ChatScreenViewProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const ChatScreenView: React.FC<ChatScreenViewProps> = ({
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<ThinkingPhase>('ANALYZING_QUERY');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isServerWarmingUp, setIsServerWarmingUp] = useState(false);

  const scrollViewRef = useRef<any>(null);

  // Handle auto-scroll to bottom
  const scrollToBottom = useCallback((delay = 100) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, delay);
  }, []);

  // Load chat messages on mount
  useEffect(() => {
    let isMounted = true;
    getStoredChatMessages().then((stored) => {
      if (isMounted) {
        setMessages(stored);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isThinking) return;

      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => {
        const updated = [...prev, userMessage];
        saveChatMessages(updated);
        return updated;
      });

      setIsThinking(true);
      setCurrentPhase('ANALYZING_QUERY');
      setElapsedSeconds(0);
      setIsServerWarmingUp(false);
      scrollToBottom();

      try {
        const responseText = await sendQueryToChatbot(text.trim(), {
          onPhaseChange: (phase, elapsed) => {
            setCurrentPhase(phase);
            setElapsedSeconds(elapsed);
            scrollToBottom(50);
          },
          onServerWarming: (isWarming) => {
            setIsServerWarmingUp(isWarming);
          },
        });

        const assistantMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: responseText,
          timestamp: Date.now(),
        };

        setMessages((prev) => {
          const finalMessages = [...prev, assistantMessage];
          saveChatMessages(finalMessages);
          return finalMessages;
        });
      } catch (err: any) {
        console.error('Chat error:', err);
        const errorMessage: ChatMessage = {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `Unable to complete AI query: ${err.message || 'Network error'}\n\nTip: If the server container was asleep, tap RETRY to reconnect.`,
          timestamp: Date.now(),
          isError: true,
        };

        setMessages((prev) => {
          const finalMessages = [...prev, errorMessage];
          saveChatMessages(finalMessages);
          return finalMessages;
        });
      } finally {
        setIsThinking(false);
        setIsServerWarmingUp(false);
        scrollToBottom();
      }
    },
    [isThinking, scrollToBottom]
  );

  // If initialPrompt is passed from MandateCard ("Ask AI to audit"), trigger it asynchronously
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0 && !isThinking) {
      const promptToRun = initialPrompt.trim();
      onClearInitialPrompt?.();
      const timer = setTimeout(() => {
        handleSendMessage(promptToRun);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt, isThinking, handleSendMessage, onClearInitialPrompt]);

  const handleClearChat = () => {
    Alert.alert(
      'Reset Conversation',
      'Are you sure you want to clear your chat history with SubClear AI?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const reset = await resetChatMessages();
            setMessages(reset);
          },
        },
      ]
    );
  };

  const handleRetryLastMessage = () => {
    // Find last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Top Copilot Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.statusDot} />
          <View>
            <Text style={styles.topBarTitle}>SUBCLEAR AI // COPILOT</Text>
            <Text style={styles.topBarSubtitle}>
              {isThinking
                ? isServerWarmingUp
                  ? 'SERVER WARMING UP...'
                  : 'ANALYZING TAXONOMY...'
                : 'ONLINE // READY TO AUDIT'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearChat} activeOpacity={0.7}>
          <Text style={styles.clearButtonText}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((item) => (
          <ChatBubble
            key={item.id}
            message={item}
            onRetry={item.isError ? handleRetryLastMessage : undefined}
          />
        ))}

        {isThinking && (
          <ThinkingIndicator
            phase={currentPhase}
            elapsedSeconds={elapsedSeconds}
            isWarmingUp={isServerWarmingUp}
          />
        )}
      </ScrollView>

      {/* Quick Prompts Bar */}
      <QuickPrompts onSelectPrompt={handleSendMessage} disabled={isThinking} />

      {/* Input Field */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isThinking} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: BRUTALIST.borderWidth,
    borderBottomColor: COLORS.black,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.lime,
    borderWidth: 1.5,
    borderColor: COLORS.black,
  },
  topBarTitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  topBarSubtitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.mutedText,
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: COLORS.black,
    ...BRUTALIST.shadowSm,
  },
  clearButtonText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.black,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 12,
  },
});
