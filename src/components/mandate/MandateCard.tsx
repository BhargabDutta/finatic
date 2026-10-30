import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
        return { bg: '#F0FDF4', border: '#16A34A', text: '#15803D' };
      case 'CARD_SI':
        return { bg: '#FEF2F2', border: '#DC2626', text: '#B91C1C' };
      case 'NACH':
        return { bg: '#FFFBEB', border: '#D97706', text: '#B45309' };
      case 'APP_STORE':
        return { bg: '#F5F3FF', border: '#7C3AED', text: '#6D28D9' };
      default:
        return { bg: '#F3F4F6', border: '#4B5563', text: '#374151' };
    }
  };

  const railStyle = getRailBadgeStyle();

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
        <Text style={styles.descriptorLabel}>RAW DESCRIPTOR:</Text>
        <Text style={styles.descriptorText} numberOfLines={1}>
          {mandate.rawDescriptor}
        </Text>
        <Text style={styles.accountText}>via {mandate.account}</Text>
      </View>

      {/* Threat Banner (If Flagged) */}
      {mandate.threatType !== 'NONE' && (
        <View style={[
          styles.threatBanner,
          mandate.threatType === 'PRICE_CREEP' && styles.threatHike,
          mandate.threatType === 'TRIAL_TRAP' && styles.threatTrap,
          mandate.threatType === 'DOUBLE_SUBSCRIPTION' && styles.threatDup,
          mandate.threatType === 'ZOMBIE_CHARGE' && styles.threatZombie,
        ]}>
          <Text style={styles.threatTitle}>
            {mandate.threatType === 'PRICE_CREEP' && '🚨 SILENT PRICE CREEP DETECTED'}
            {mandate.threatType === 'TRIAL_TRAP' && '⚠️ FREE TRIAL AMBUSH CONVERTED'}
            {mandate.threatType === 'DOUBLE_SUBSCRIPTION' && '🔄 CROSS-ACCOUNT DUPLICATE SUB'}
            {mandate.threatType === 'ZOMBIE_CHARGE' && '🧟 ZOMBIE MANDATE DETECTED'}
          </Text>
          {mandate.threatDescription && (
            <Text style={styles.threatDesc}>{mandate.threatDescription}</Text>
          )}
        </View>
      )}

      {/* Amounts and Killswitch Row */}
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
              <Text style={styles.aiButtonText}>🤖 AI AUDIT</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.killButton}
            onPress={() => onCancelPress(mandate)}
            activeOpacity={0.8}
          >
            <Text style={styles.killButtonText}>⚡ KILLSWITCH</Text>
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
    borderColor: COLORS.black,
    padding: 14,
    marginBottom: 14,
    ...BRUTALIST.shadowDefault,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
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
    marginTop: 2,
  },
  railBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  railText: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontSansBold,
    letterSpacing: 0.3,
  },
  descriptorBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    marginBottom: 10,
  },
  descriptorLabel: {
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontSansBold,
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  descriptorText: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '700',
    color: COLORS.ink,
    marginVertical: 2,
  },
  accountText: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontSans,
    color: COLORS.mutedText,
  },
  threatBanner: {
    padding: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  threatHike: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderLeftWidth: 4,
  },
  threatTrap: {
    backgroundColor: '#FDF4FF',
    borderColor: '#C026D3',
    borderLeftWidth: 4,
  },
  threatDup: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderLeftWidth: 4,
  },
  threatZombie: {
    backgroundColor: '#F3F4F6',
    borderColor: '#6B7280',
    borderLeftWidth: 4,
  },
  threatTitle: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.ink,
    marginBottom: 2,
  },
  threatDesc: {
    fontSize: 10.5,
    fontFamily: BRUTALIST.fontSans,
    color: '#4B5563',
    lineHeight: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    paddingTop: 10,
  },
  amountArea: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  monthlyAmount: {
    fontSize: 18,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '800',
    color: COLORS.ink,
  },
  frequencyLabel: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontSans,
    color: COLORS.mutedText,
    marginLeft: 2,
  },
  annualImpact: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontSans,
    color: COLORS.mutedText,
    marginTop: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 7,
    ...BRUTALIST.shadowSm,
  },
  aiButtonText: {
    color: COLORS.ink,
    fontSize: 10,
    fontFamily: BRUTALIST.fontSansBold,
  },
  killButton: {
    backgroundColor: COLORS.ink,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    paddingHorizontal: 12,
    paddingVertical: 7,
    ...BRUTALIST.shadowSm,
  },
  killButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: BRUTALIST.fontSansBold,
    letterSpacing: 0.3,
  },
});
