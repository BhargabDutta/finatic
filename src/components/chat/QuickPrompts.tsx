import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRUTALIST } from '../../theme/styles';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const SAMPLE_PROMPTS = [
  {
    icon: 'search-outline' as const,
    label: 'Audit Netflix Hike',
    prompt: 'Can you audit my Netflix subscription? It increased from 499 to 649.',
  },
  {
    icon: 'close-circle-outline' as const,
    label: 'Cancel Canva Trial',
    prompt: 'How do I cancel a Canva Pro trial before the 899 recurring mandate charges?',
  },
  {
    icon: 'shield-outline' as const,
    label: 'Dispute Zombie Mandate',
    prompt: 'Cult.fit is charging 1750 on NACH monthly but I have not used it in 7 months. How do I revoke it?',
  },
  {
    icon: 'barcode-outline' as const,
    label: 'Decode BILLDESK*NFLX',
    prompt: 'What does the transaction descriptor BILLDESK*NFLX_MUM_AUTOPAY mean?',
  },
  {
    icon: 'document-text-outline' as const,
    label: 'Section 25 Notice',
    prompt: 'Explain the Section 25 PSSA dispute notice for non-responsive merchants.',
  },
  {
    icon: 'card-outline' as const,
    label: 'UPI vs Card SI',
    prompt: 'What is the operational difference between UPI AutoPay and Card Standing Instructions?',
  },
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, disabled }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="flash-outline" size={12} color="#6B7280" />
        <Text style={styles.sectionTitle}>SUGGESTED AUDIT TOPICS</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SAMPLE_PROMPTS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.pillButton, disabled && styles.pillDisabled]}
            onPress={() => !disabled && onSelectPrompt(item.prompt)}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <Ionicons name={item.icon} size={12} color="#111827" style={{ marginRight: 5 }} />
            <Text style={styles.pillText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 6,
    gap: 4,
  },
  sectionTitle: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9.5,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    ...BRUTALIST.shadowSm,
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 11,
    color: '#111827',
  },
});
