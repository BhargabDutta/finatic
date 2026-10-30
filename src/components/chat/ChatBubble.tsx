import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../types/chat';
import { BRUTALIST } from '../../theme/styles';
import {
  sanitizeAndStructureAiOutput,
  CleanSection,
} from '../../utils/aiResponseSanitizer';

interface ChatBubbleProps {
  message: ChatMessage;
  onRetry?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onRetry }) => {
  const isUser = message.sender === 'user';

  const copyToClipboard = () => {
    Alert.alert('Copied', 'Message text copied to clipboard.');
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Parse structured sections for assistant output
  const structuredData = useMemo(() => {
    if (isUser || message.isError) return null;
    return sanitizeAndStructureAiOutput(message.text);
  }, [isUser, message.isError, message.text]);

  const renderSection = (section: CleanSection, idx: number) => {
    return (
      <View key={idx} style={styles.sectionBlock}>
        {/* Section Title */}
        {section.title && (
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}

        {/* Narrative / Summary */}
        {section.summary && (
          <Text style={styles.sectionSummaryText}>{section.summary}</Text>
        )}

        {/* Structured Key-Value Pairs */}
        {section.keyValues.length > 0 && (
          <View style={styles.keyValueGrid}>
            {section.keyValues.map((kv, kvIdx) => (
              <View key={kvIdx} style={styles.keyValueRow}>
                <Text style={styles.keyLabel}>{kv.label}</Text>
                <Text style={styles.keyValue}>{kv.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Numbered Steps */}
        {section.steps.length > 0 && (
          <View style={styles.stepsContainer}>
            {section.steps.map((step) => (
              <View key={step.number} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{step.number}</Text>
                </View>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bullet Points */}
        {section.bulletPoints.length > 0 && (
          <View style={styles.bulletList}>
            {section.bulletPoints.map((point, pIdx) => (
              <View key={pIdx} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{point}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.bubbleContainer, isUser ? styles.userContainer : styles.assistantContainer]}>
      {/* Sender Identifier Header */}
      <View style={styles.senderHeader}>
        <View style={[styles.senderBadge, isUser ? styles.userBadge : styles.assistantBadge]}>
          <Ionicons
            name={isUser ? 'person' : 'sparkles'}
            size={11}
            color={isUser ? '#FFFFFF' : '#111827'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.senderBadgeText, isUser && styles.userBadgeText]}>
            {isUser ? 'YOU' : 'SUBCLEAR AI'}
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
        {isUser ? (
          <Text style={styles.userMessageText}>{message.text}</Text>
        ) : structuredData && structuredData.sections.length > 0 ? (
          <View style={styles.structuredContainer}>
            {structuredData.headline && (
              <Text style={styles.headlineText}>{structuredData.headline}</Text>
            )}
            {structuredData.sections.map(renderSection)}
          </View>
        ) : (
          <Text style={styles.plainAssistantText}>{message.text}</Text>
        )}

        {/* Footer actions for assistant bubble */}
        {!isUser && !message.isError && (
          <View style={styles.bubbleFooter}>
            <TouchableOpacity style={styles.actionBtn} onPress={copyToClipboard} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={12} color="#111827" style={{ marginRight: 4 }} />
              <Text style={styles.actionBtnText}>COPY</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error retry option */}
        {message.isError && onRetry && (
          <View style={styles.errorFooter}>
            <Text style={styles.errorNotice}>Failed to fetch response from server.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.retryBtnText}>RETRY</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderWidth: 1.5,
    borderColor: '#111827',
  },
  userBadge: {
    backgroundColor: '#111827',
  },
  assistantBadge: {
    backgroundColor: '#F3F4F6',
  },
  senderBadgeText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9.5,
    color: '#111827',
    letterSpacing: 0.5,
  },
  userBadgeText: {
    color: '#FFFFFF',
  },
  timestampText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9.5,
    color: '#6B7280',
  },
  bubbleCard: {
    maxWidth: '94%',
    padding: 14,
    borderWidth: BRUTALIST.borderWidth,
    borderColor: '#111827',
    ...BRUTALIST.shadowSm,
  },
  userCard: {
    backgroundColor: '#111827',
  },
  assistantCard: {
    backgroundColor: '#FFFFFF',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  userMessageText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSans,
  },
  plainAssistantText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#111827',
    fontFamily: BRUTALIST.fontSans,
  },
  structuredContainer: {
    gap: 10,
  },
  headlineText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  sectionBlock: {
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionAccentBar: {
    width: 3,
    height: 12,
    backgroundColor: '#111827',
    marginRight: 6,
  },
  sectionTitle: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 11.5,
    color: '#111827',
    letterSpacing: 0.3,
  },
  sectionSummaryText: {
    fontFamily: BRUTALIST.fontSans,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 6,
  },
  keyValueGrid: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 4,
  },
  keyValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  keyLabel: {
    fontFamily: BRUTALIST.fontSans,
    fontSize: 11.5,
    color: '#6B7280',
  },
  keyValue: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 12,
    color: '#111827',
  },
  stepsContainer: {
    marginVertical: 4,
    gap: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stepBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
  },
  stepText: {
    flex: 1,
    fontFamily: BRUTALIST.fontSans,
    fontSize: 12.5,
    color: '#1F2937',
    lineHeight: 18,
  },
  bulletList: {
    marginVertical: 4,
    gap: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111827',
  },
  bulletText: {
    flex: 1,
    fontFamily: BRUTALIST.fontSans,
    fontSize: 12.5,
    color: '#374151',
    lineHeight: 17,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionBtnText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    color: '#111827',
  },
  errorFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FCA5A5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorNotice: {
    fontSize: 11.5,
    color: '#DC2626',
    fontFamily: BRUTALIST.fontSans,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#111827',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
  },
});
