import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { BrutalistCard } from '../brutalist/BrutalistCard';
import { SMSMessage } from '../../types/sms';
import { Ionicons } from '@expo/vector-icons';

interface UrgentAlertsCardProps {
  messages: SMSMessage[];
  onSelectMessage: (msg: SMSMessage) => void;
}

export const UrgentAlertsCard: React.FC<UrgentAlertsCardProps> = ({
  messages,
  onSelectMessage,
}) => {
  // Find pre-debit notifications (upcoming auto-debits)
  const billDues = messages.filter((m) => m.parsed.type === 'PRE_DEBIT_ALERT');

  // Find high recurring auto-debits (>= ₹1,500)
  const highExpenses = messages.filter(
    (m) => m.parsed.type !== 'PRE_DEBIT_ALERT' && (m.parsed.amount || 0) >= 1500
  );

  if (billDues.length === 0 && highExpenses.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {billDues.slice(0, 1).map((msg) => (
        <BrutalistCard
          key={`bill-${msg.id}`}
          bgColor={COLORS.orange}
          style={styles.alertCard}
        >
          <View style={styles.topRow}>
            <View style={styles.tagWrap}>
              <Ionicons name="alert-circle" size={14} color={COLORS.white} />
              <Text style={styles.tagText}>PAYMENT DUE ALERT</Text>
            </View>
            {msg.parsed.dueDate && (
              <View style={styles.dueBadge}>
                <Text style={styles.dueText}>DUE: {msg.parsed.dueDate}</Text>
              </View>
            )}
          </View>

          <Text style={styles.alertBody} numberOfLines={2}>
            {msg.body}
          </Text>

          <View style={styles.footerRow}>
            <Text style={styles.amountText}>
              {msg.parsed.currencySymbol}{msg.parsed.amount?.toLocaleString()}
            </Text>
            <Text style={styles.sourceText}>{msg.parsed.bankOrSender}</Text>
          </View>
        </BrutalistCard>
      ))}

      {highExpenses.slice(0, 1).map((msg) => (
        <BrutalistCard
          key={`high-${msg.id}`}
          bgColor={COLORS.yellow}
          style={styles.alertCard}
        >
          <View style={styles.topRow}>
            <View style={[styles.tagWrap, { backgroundColor: COLORS.ink }]}>
              <Ionicons name="flash" size={14} color={COLORS.yellow} />
              <Text style={[styles.tagText, { color: COLORS.yellow }]}>HIGH OUTFLOW TRANSACTION</Text>
            </View>
          </View>

          <Text style={[styles.alertBody, { color: COLORS.ink }]} numberOfLines={2}>
            {msg.body}
          </Text>

          <View style={styles.footerRow}>
            <Text style={[styles.amountText, { color: COLORS.coral }]}>
              -{msg.parsed.currencySymbol}{msg.parsed.amount?.toLocaleString()}
            </Text>
            <Text style={[styles.sourceText, { color: COLORS.ink }]}>
              {msg.parsed.merchant || msg.parsed.bankOrSender}
            </Text>
          </View>
        </BrutalistCard>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    gap: 8,
  },
  alertCard: {
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  dueBadge: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dueText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  alertBody: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    color: COLORS.white,
    lineHeight: 16,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingTop: 6,
  },
  amountText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
  },
  sourceText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
});
