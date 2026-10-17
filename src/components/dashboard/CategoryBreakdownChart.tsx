import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { BrutalistCard } from '../brutalist/BrutalistCard';
import { ExpenseCategory } from '../../types/sms';
import { Ionicons } from '@expo/vector-icons';

interface CategoryBreakdownChartProps {
  categoryTotals: Record<ExpenseCategory, number>;
  totalDebit: number;
  currencySymbol?: string;
}

interface CategoryConfig {
  key: ExpenseCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const CATEGORIES_TO_DISPLAY: CategoryConfig[] = [
  { key: 'FOOD_DINING', label: 'FOOD & DINING', icon: 'restaurant-outline', color: COLORS.yellow },
  { key: 'SHOPPING', label: 'SHOPPING & RETAIL', icon: 'cart-outline', color: COLORS.cyan },
  { key: 'GROCERIES', label: 'GROCERIES', icon: 'basket-outline', color: COLORS.lime },
  { key: 'UTILITIES_BILLS', label: 'UTILITIES & BILLS', icon: 'flash-outline', color: COLORS.orange },
  { key: 'TRAVEL_TRANSPORT', label: 'TRAVEL & COMMUTE', icon: 'car-outline', color: COLORS.purple },
  { key: 'ENTERTAINMENT', label: 'ENTERTAINMENT', icon: 'film-outline', color: COLORS.pink },
  { key: 'OTHER', label: 'OTHER EXPENSES', icon: 'ellipsis-horizontal-outline', color: COLORS.paperDark },
];

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  categoryTotals,
  totalDebit,
  currencySymbol = '₹',
}) => {
  // Sort categories by highest spend
  const sorted = [...CATEGORIES_TO_DISPLAY].sort((a, b) => {
    return (categoryTotals[b.key] || 0) - (categoryTotals[a.key] || 0);
  });

  return (
    <BrutalistCard bgColor={COLORS.white} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="pie-chart" size={16} color={COLORS.ink} />
          <Text style={styles.title}>EXPENSE BY CATEGORY</Text>
        </View>
        <Text style={styles.subTitle}>AUTO-CLASSIFIED</Text>
      </View>

      <View style={styles.barsContainer}>
        {sorted.map((item) => {
          const amount = categoryTotals[item.key] || 0;
          const percentage = totalDebit > 0 ? Math.round((amount / totalDebit) * 100) : 0;

          if (amount <= 0 && totalDebit > 0) return null;

          return (
            <View key={item.key} style={styles.categoryRow}>
              <View style={styles.metaRow}>
                <View style={styles.labelCol}>
                  <Ionicons name={item.icon} size={14} color={COLORS.ink} style={styles.catIcon} />
                  <Text style={styles.categoryName}>{item.label}</Text>
                </View>

                <View style={styles.amountCol}>
                  <Text style={styles.amountText}>
                    {currencySymbol}{amount.toLocaleString()}
                  </Text>
                  <Text style={styles.pctText}>({percentage}%)</Text>
                </View>
              </View>

              {/* Brutalist Thick Segment Bar */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(percentage, 4)}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
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
    letterSpacing: 0.5,
    color: COLORS.ink,
  },
  subTitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.mutedText,
  },
  barsContainer: {
    gap: 12,
  },
  categoryRow: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catIcon: {
    marginRight: 2,
  },
  categoryName: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.ink,
  },
  amountCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  amountText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
  },
  pctText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedText,
  },
  barTrack: {
    height: 12,
    backgroundColor: COLORS.paperDark,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  barFill: {
    height: '100%',
    borderRightWidth: 1.5,
    borderColor: COLORS.ink,
  },
});
