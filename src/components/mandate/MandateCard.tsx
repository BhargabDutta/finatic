import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { Mandate } from '../../types/mandate';

interface MandateCardProps {
  mandate: Mandate;
  onCancelPress: (mandate: Mandate) => void;
  onAskAIPress?: (mandate: Mandate) => void;
}

export const MandateCard: React.FC<MandateCardProps> = ({ mandate, onCancelPress, onAskAIPress }) => {
  const getRailBadgeStyle = () => {
    switch (mandate.paymentRail) {
      case 'UPI_AUTOPAY':
        return { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' };
      case 'CARD_SI':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' };
      case 'NACH':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' };
      case 'APP_STORE':
        return { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9' };
      default:
        return { bg: '#F3F4F6', border: '#E5E7EB', text: '#374151' };
    }
  };

  const getThreatInfo = () => {
    switch (mandate.threatType) {
      case 'PRICE_CREEP':
        return {
          icon: 'trending-up-outline' as const,
          title: 'SILENT PRICE CREEP DETECTED',
          style: styles.threatHike,
          textStyle: styles.threatTextHike,
        };
      case 'TRIAL_TRAP':
        return {
          icon: 'alert-circle-outline' as const,
          title: 'FREE TRIAL AMBUSH CONVERTED',
          style: styles.threatTrap,
          textStyle: styles.threatTextTrap,
        };
      case 'DOUBLE_SUBSCRIPTION':
        return {
          icon: 'copy-outline' as const,
          title: 'CROSS-ACCOUNT DUPLICATE SUB',
          style: styles.threatDup,
          textStyle: styles.threatTextDup,
        };
      case 'ZOMBIE_CHARGE':
        return {
          icon: 'time-outline' as const,
          title: 'INACTIVE MANDATE DETECTED',
          style: styles.threatZombie,
          textStyle: styles.threatTextZombie,
        };
      default:
        return null;
    }
  };

  const railStyle = getRailBadgeStyle();
  const threatInfo = getThreatInfo();

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleArea}>
          <Text style={styles.merchantName}>{mandate.merchantName}</Text>
          <Text style={styles.categoryText}>{mandate.category}</Text>
        </View>

        <View style={[styles.railBadge, { backgroundColor: railStyle.bg, borderColor: railStyle.border }]}>
          <Text style={[styles.railText, { color: railStyle.text }]}>
            {mandate.paymentRail.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Raw Descriptor Box */}
      <View style={styles.descriptorBox}>
        <Text style={styles.descriptorText} numberOfLines={1}>
          {mandate.rawDescriptor}
        </Text>
        <Text style={styles.accountText}>via {mandate.account}</Text>
      </View>

      {/* Threat Banner (If Flagged) */}
      {threatInfo && (
        <View style={[styles.threatBanner, threatInfo.style]}>
          <View style={styles.threatTitleRow}>
            <Ionicons name={threatInfo.icon} size={13} color={threatInfo.textStyle.color} style={{ marginRight: 5 }} />
            <Text style={[styles.threatTitle, threatInfo.textStyle]}>{threatInfo.title}</Text>
          </View>
          {mandate.threatDescription && (
            <Text style={styles.threatDesc}>{mandate.threatDescription}</Text>
          )}
        </View>
      )}

      {/* Amounts and Actions Row */}
      <View style={styles.bottomRow}>
        <View style={styles.amountArea}>
          <View style={styles.priceRow}>
            <Text style={styles.monthlyAmount}>₹{mandate.monthlyEstimate}</Text>
            <Text style={styles.frequencyLabel}>/mo</Text>
          </View>
          <Text style={styles.annualImpact}>
            ₹{mandate.annualEstimate.toLocaleString('en-IN')}/year
          </Text>
        </View>

        <View style={styles.actionsGroup}>
          {onAskAIPress && (
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => onAskAIPress(mandate)}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles-outline" size={12} color="#111827" style={{ marginRight: 4 }} />
              <Text style={styles.aiButtonText}>AUDIT</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.killButton}
            onPress={() => onCancelPress(mandate)}
            activeOpacity={0.8}
          >
            <Ionicons name="power-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.killButtonText}>REVOKE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    padding: 13,
    marginBottom: 10,
    ...BRUTALIST.shadowDefault,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  merchantName: {
    fontSize: 15,
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.ink,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontSans,
    color: COLORS.mutedText,
    marginTop: 1,
  },
  railBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
  },
  railText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9.5,
    letterSpacing: 0.3,
  },
  descriptorBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptorText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10.5,
    color: '#374151',
    flex: 1,
    marginRight: 6,
  },
  accountText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    color: COLORS.mutedText,
  },
  threatBanner: {
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  threatHike: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  threatTrap: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  threatDup: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  threatZombie: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  threatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threatTitle: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  threatTextHike: { color: '#DC2626' },
  threatTextTrap: { color: '#DC2626' },
  threatTextDup: { color: '#1D4ED8' },
  threatTextZombie: { color: '#4B5563' },
  threatDesc: {
    fontFamily: BRUTALIST.fontSans,
    fontSize: 11,
    color: '#374151',
    marginTop: 3,
    lineHeight: 15,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.faintBorder,
  },
  amountArea: {
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  monthlyAmount: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
  },
  frequencyLabel: {
    fontFamily: BRUTALIST.fontSans,
    fontSize: 11,
    color: COLORS.mutedText,
    marginLeft: 2,
  },
  annualImpact: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    color: COLORS.mutedText,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  aiButtonText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    color: COLORS.ink,
  },
  killButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  killButtonText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    color: '#FFFFFF',
  },
});
