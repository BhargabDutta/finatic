import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const SAMPLE_PROMPTS = [
  { label: '🔍 Audit Netflix (₹649)', prompt: 'Can you audit my Netflix subscription? It went up to ₹649 from ₹499.' },
  { label: '⚡ Cancel Canva Trial', prompt: 'How do I cancel a Canva Pro trial before the ₹899 recurring mandate bills?' },
  { label: '🛑 Dispute Zombie Cult.fit', prompt: 'Cult.fit is charging me ₹1,750 on NACH every month but I have not visited in 7 months. How do I kill it?' },
  { label: '🏷️ Decode BILLDESK*NFLX', prompt: 'What does the transaction descriptor BILLDESK*NFLX_MUM_AUTOPAY mean?' },
  { label: '📜 Section 25 Dispute Notice', prompt: 'Explain the RBI Section 25 PSSA dispute notice for merchant ghosting.' },
  { label: '💡 UPI AutoPay vs Card SI', prompt: 'What is the difference between UPI AutoPay and Card Standing Instructions?' },
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, disabled }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>⚡ QUICK AUDIT PROMPTS:</Text>
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
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.paper,
  },
  sectionTitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.mutedText,
    paddingHorizontal: 12,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  pillButton: {
    backgroundColor: COLORS.white,
    borderWidth: BRUTALIST.borderWidthThin,
    borderColor: COLORS.black,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...BRUTALIST.shadowSm,
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.black,
  },
});
