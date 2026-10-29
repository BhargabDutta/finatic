import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ChatMessage } from '../../types/chat';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface ChatBubbleProps {
  message: ChatMessage;
  onRetry?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onRetry }) => {
  const isUser = message.sender === 'user';

  const copyToClipboard = () => {
    Alert.alert('Copied', 'Message text copied to clipboard!');
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simple rich text formatter for bold **words**, `code`, and bullets
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return lines.map((line, lineIdx) => {
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
      const isNumbered = /^\d+\.\s/.test(line.trim());
      const isHeader = line.trim().startsWith('#') || (line.trim().startsWith('**') && line.trim().endsWith('**') && line.length < 50);

      // Split line by bold segments (**bold**) and code (`code`)
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

      return (
        <View key={lineIdx} style={[styles.textLine, (isBullet || isNumbered) && styles.bulletLine]}>
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.assistantMessageText,
              isHeader && styles.headerLineText,
            ]}
          >
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text key={partIdx} style={styles.boldText}>
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <Text key={partIdx} style={styles.codeSpan}>
                    {part.slice(1, -1)}
                  </Text>
                );
              }
              return part;
            })}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={[styles.bubbleContainer, isUser ? styles.userContainer : styles.assistantContainer]}>
      {/* Sender Identifier Badge */}
      <View style={styles.senderHeader}>
        <View style={[styles.senderBadge, isUser ? styles.userBadge : styles.assistantBadge]}>
          <Text style={styles.senderBadgeText}>
            {isUser ? '👤 YOU' : '🤖 SUBCLEAR AI'}
          </Text>
        </View>
        <Text style={styles.timestampText}>{formatTimestamp(message.timestamp)}</Text>
      </View>

      {/* Bubble Content Card */}
      <View
        style={[
          styles.bubbleCard,
          isUser ? styles.userCard : styles.assistantCard,
          message.isError && styles.errorCard,
        ]}
      >
        <View style={styles.textContainer}>
          {renderFormattedText(message.text)}
        </View>

        {/* Footer actions for assistant bubble */}
        {!isUser && !message.isError && (
          <View style={styles.bubbleFooter}>
            <TouchableOpacity style={styles.actionBtn} onPress={copyToClipboard} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>📋 COPY</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error retry option */}
        {message.isError && onRetry && (
          <View style={styles.errorFooter}>
            <Text style={styles.errorNotice}>Failed to fetch response from server.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>↻ RETRY</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  senderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: BRUTALIST.borderWidthThin,
    borderColor: COLORS.black,
  },
  userBadge: {
    backgroundColor: COLORS.yellow,
  },
  assistantBadge: {
    backgroundColor: COLORS.cyan,
  },
  senderBadgeText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  timestampText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    color: COLORS.mutedText,
    fontWeight: '700',
  },
  bubbleCard: {
    maxWidth: '92%',
    padding: 14,
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.black,
    ...BRUTALIST.shadowSm,
  },
  userCard: {
    backgroundColor: COLORS.yellow,
  },
  assistantCard: {
    backgroundColor: COLORS.white,
  },
  errorCard: {
    backgroundColor: '#FFEBEB',
    borderColor: COLORS.coral,
  },
  textContainer: {
    flexDirection: 'column',
  },
  textLine: {
    marginVertical: 1.5,
  },
  bulletLine: {
    paddingLeft: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.black,
  },
  userMessageText: {
    color: COLORS.black,
    fontWeight: '600',
  },
  assistantMessageText: {
    color: COLORS.ink,
  },
  headerLineText: {
    fontWeight: '900',
    fontSize: 15,
    marginVertical: 4,
  },
  boldText: {
    fontWeight: '900',
    color: COLORS.black,
  },
  codeSpan: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 12,
    backgroundColor: '#EBEBEB',
    paddingHorizontal: 4,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  actionBtnText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.black,
  },
  errorFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.coral,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorNotice: {
    fontSize: 12,
    color: COLORS.coral,
    fontWeight: '700',
  },
  retryBtn: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: COLORS.black,
  },
  retryBtnText: {
    color: COLORS.white,
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    fontWeight: '900',
  },
});
