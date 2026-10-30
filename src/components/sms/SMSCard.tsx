import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { BrutalistCard } from '../brutalist/BrutalistCard';
import { BrutalistBadge } from '../brutalist/BrutalistBadge';
import { SMSMessage } from '../../types/sms';
import { Ionicons } from '@expo/vector-icons';

interface SMSCardProps {
  message: SMSMessage;
  onPress: (message: SMSMessage) => void;
}

export const SMSCard: React.FC<SMSCardProps> = ({ message, onPress }) => {
  const { parsed, date, body, address } = message;

  const formatTimeAgo = (ts: number) => {
    // eslint-disable-next-line react-hooks/purity
    const diffMs = Date.now() - ts;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'JUST NOW';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}M AGO`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}H AGO`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 7) return `${diffDays}D AGO`;
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const getAmountColor = () => {
    switch (parsed.type) {
      case 'UPI_AUTOPAY':
        return COLORS.cyan;
      case 'CARD_SI':
        return COLORS.coral;
      case 'NACH_ECS':
        return '#8A6D00';
      case 'PRE_DEBIT_ALERT':
        return COLORS.orange;
      case 'RECURRING_SUB':
        return COLORS.purple;
      default:
        return COLORS.ink;
    }
  };

  const getAmountPrefix = () => {
    if (parsed.type === 'PRE_DEBIT_ALERT') return '';
    return '-';
  };

  return (
    <Pressable onPress={() => onPress(message)}>
      <BrutalistCard bgColor={COLORS.white} style={styles.card}>
        {/* Top Header: Sender, Time, Badge */}
        <View style={styles.topRow}>
          <View style={styles.senderWrap}>
            <Text style={styles.senderText} numberOfLines={1}>
              {parsed.bankOrSender || address}
            </Text>
            {message.isSimulated && (
              <View style={styles.simBadge}>
                <Text style={styles.simText}>SIM</Text>
              </View>
            )}
          </View>

          <View style={styles.badgeWrap}>
            <Text style={styles.timeText}>{formatTimeAgo(date)}</Text>
            <BrutalistBadge label={parsed.type.replace('_', ' ')} type={parsed.type} size="sm" />
          </View>
        </View>

        {/* Amount & Merchant Block (if financial) */}
        {parsed.amount !== null ? (
          <View style={styles.financialSection}>
            <View style={styles.amountCol}>
              <Text style={[styles.amountText, { color: getAmountColor() }]}>
                {getAmountPrefix()}{parsed.currencySymbol}
                {parsed.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>

            {parsed.merchant && (
              <View style={styles.merchantBadge}>
                <Ionicons name="pricetag-outline" size={10} color={COLORS.ink} />
                <Text style={styles.merchantText} numberOfLines={1}>
                  {parsed.merchant.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Mandate Reference Badge if available */}
        {parsed.mandateReference && (
          <View style={styles.mandateBadgeBox}>
            <Text style={styles.mandateBadgeText}>MANDATE REF: {parsed.mandateReference}</Text>
          </View>
        )}

        {/* Message Snippet */}
        <Text style={styles.bodySnippet} numberOfLines={2}>
          {body}
        </Text>

        {/* Bottom Details Row */}
        <View style={styles.bottomRow}>
          {parsed.accountDigits ? (
            <View style={styles.metaChip}>
              <Ionicons name="card-outline" size={10} color={COLORS.mutedText} />
              <Text style={styles.metaChipText}>ACC: {parsed.accountDigits}</Text>
            </View>
          ) : (
            <View style={styles.metaChip}>
              <Ionicons name="phone-portrait-outline" size={10} color={COLORS.mutedText} />
              <Text style={styles.metaChipText}>{address}</Text>
            </View>
          )}

          {parsed.balanceRemaining !== null && (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>
                BAL: {parsed.currencySymbol}{parsed.balanceRemaining.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.viewDetailLink}>
            <Text style={styles.viewDetailText}>DETAILS</Text>
            <Ionicons name="chevron-forward" size={10} color={COLORS.ink} />
          </View>
        </View>
      </BrutalistCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  senderText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
  },
  simBadge: {
    backgroundColor: COLORS.cyan,
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  simText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.ink,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.mutedText,
  },
  financialSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  amountCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  merchantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
    maxWidth: '55%',
  },
  merchantText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  otpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  mandateBadgeBox: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#D4A000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  mandateBadgeText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9.5,
    fontWeight: '900',
    color: '#8A6D00',
    letterSpacing: 0.5,
  },
  bodySnippet: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    color: '#333333',
    lineHeight: 16,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: COLORS.faintBorder,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaChipText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.mutedText,
  },
  viewDetailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
});
