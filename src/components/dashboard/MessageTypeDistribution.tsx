import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { BrutalistCard } from '../brutalist/BrutalistCard';
import { TransactionType } from '../../types/sms';
import { Ionicons } from '@expo/vector-icons';

interface MessageTypeDistributionProps {
  distribution: Record<TransactionType, number>;
  totalCount: number;
}

interface TypeItem {
  type: TransactionType;
  label: string;
  color: string;
}

const TYPES_META: TypeItem[] = [
  { type: 'UPI_AUTOPAY', label: 'UPI AUTOPAY', color: COLORS.cyan },
  { type: 'CARD_SI', label: 'CARD SI', color: COLORS.coral },
  { type: 'NACH_ECS', label: 'NACH / ECS', color: COLORS.yellow },
  { type: 'PRE_DEBIT_ALERT', label: 'PRE-DEBITS', color: COLORS.orange },
  { type: 'RECURRING_SUB', label: 'SUBSCRIPTIONS', color: COLORS.purple },
];

export const MessageTypeDistribution: React.FC<MessageTypeDistributionProps> = ({
  distribution,
  totalCount,
}) => {
  if (totalCount === 0) return null;

  return (
    <BrutalistCard bgColor={COLORS.white} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="layers" size={16} color={COLORS.ink} />
          <Text style={styles.title}>AUTOPAY RAIL RADAR</Text>
        </View>
        <Text style={styles.subtitle}>{totalCount} AUTOPAY MANDATES SCANNED</Text>
      </View>

      {/* Segmented Distribution Bar */}
      <View style={styles.segmentedBar}>
        {TYPES_META.map((item) => {
          const count = distribution[item.type] || 0;
          if (count === 0) return null;
          const flexRatio = count / totalCount;
          return (
            <View
              key={item.type}
              style={[
                styles.segment,
                {
                  flex: flexRatio,
                  backgroundColor: item.color,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Grid of Types */}
      <View style={styles.typeGrid}>
        {TYPES_META.map((item) => {
          const count = distribution[item.type] || 0;
          const pct = Math.round((count / totalCount) * 100);

          return (
            <View key={item.type} style={styles.typeBlock}>
              <View style={[styles.colorChip, { backgroundColor: item.color }]} />
              <View style={styles.textWrap}>
                <Text style={styles.typeLabel}>{item.label}</Text>
                <Text style={styles.typeCount}>
                  {count} <Text style={styles.typePct}>({pct}%)</Text>
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </BrutalistCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: BRUTALIST.borderWidthThin,
    borderColor: COLORS.ink,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.mutedText,
  },
  segmentedBar: {
    flexDirection: 'row',
    height: 16,
    backgroundColor: COLORS.paperDark,
    borderWidth: 2,
    borderColor: COLORS.ink,
    overflow: 'hidden',
    marginBottom: 12,
  },
  segment: {
    height: '100%',
    borderRightWidth: 1,
    borderColor: COLORS.ink,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: COLORS.paper,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    padding: 6,
    gap: 6,
  },
  colorChip: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  textWrap: {
    flex: 1,
  },
  typeLabel: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  typeCount: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
  },
  typePct: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.mutedText,
  },
});
