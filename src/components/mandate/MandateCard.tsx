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
        return { bg: '#E6F4FE', border: '#0070F3', text: '#0070F3' };
      case 'CARD_SI':
        return { bg: '#FFF0F3', border: '#FF3366', text: '#FF3366' };
      case 'NACH':
        return { bg: '#FFFDE6', border: '#D4A000', text: '#806000' };
      case 'APP_STORE':
        return { bg: '#E6FFFA', border: '#00B894', text: '#00B894' };
      default:
        return { bg: '#EEE', border: '#333', text: '#333' };
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
    fontSize: 16,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
    textTransform: 'uppercase',
  },
  categoryText: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    color: '#555',
    marginTop: 1,
  },
  railBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
  },
  railText: {
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  descriptorBox: {
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 8,
    marginBottom: 10,
  },
  descriptorLabel: {
    fontSize: 8,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#888',
    letterSpacing: 0.5,
  },
  descriptorText: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '700',
    color: '#111',
    marginVertical: 2,
  },
  accountText: {
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    color: '#666',
  },
  threatBanner: {
    padding: 10,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    marginBottom: 12,
  },
  threatHike: {
    backgroundColor: '#FFF2E6',
    borderLeftWidth: 5,
    borderLeftColor: '#FF6600',
  },
  threatTrap: {
    backgroundColor: '#F8EEFF',
    borderLeftWidth: 5,
    borderLeftColor: '#9900EF',
  },
  threatDup: {
    backgroundColor: '#EBF9FF',
    borderLeftWidth: 5,
    borderLeftColor: '#0099FF',
  },
  threatZombie: {
    backgroundColor: '#EEEEEE',
    borderLeftWidth: 5,
    borderLeftColor: '#333333',
  },
  threatTitle: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 3,
  },
  threatDesc: {
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    color: '#333',
    lineHeight: 13,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderColor: '#EFEFEF',
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
    fontSize: 20,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
  },
  frequencyLabel: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#666',
    marginLeft: 2,
  },
  annualImpact: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#777',
    marginTop: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiButton: {
    backgroundColor: COLORS.cyan,
    borderWidth: 2,
    borderColor: COLORS.black,
    paddingHorizontal: 10,
    paddingVertical: 8,
    ...BRUTALIST.shadowSm,
  },
  aiButtonText: {
    color: COLORS.black,
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  killButton: {
    backgroundColor: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...BRUTALIST.shadowSm,
  },
  killButtonText: {
    color: COLORS.yellow,
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
