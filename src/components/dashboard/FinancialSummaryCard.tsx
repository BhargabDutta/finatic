import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { BrutalistCard } from '../brutalist/BrutalistCard';
import { Ionicons } from '@expo/vector-icons';

interface FinancialSummaryCardProps {
  totalDebit: number;
  totalCredit: number;
  totalBillDue: number;
  currencySymbol?: string;
  financialCount: number;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  totalDebit,
  totalCredit,
  totalBillDue,
  currencySymbol = '₹',
  financialCount,
}) => {
  const netFlow = totalCredit - totalDebit;
  const isPositiveNet = netFlow >= 0;

  const formatAmount = (num: number) => {
    return num.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    });
  };

  return (
    <View style={styles.container}>
      {/* Primary Net Balance / Flow Card */}
      <BrutalistCard bgColor={COLORS.ink} style={styles.netCard}>
        <View style={styles.netHeader}>
          <Text style={styles.netLabel}>NET FINANCIAL FLOW (FROM SMS)</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{financialCount} FIN TXNS</Text>
          </View>
        </View>

        <View style={styles.netAmountRow}>
          <Text style={[styles.netAmount, { color: isPositiveNet ? COLORS.lime : COLORS.coral }]}>
            {isPositiveNet ? '+' : '-'}{currencySymbol}{formatAmount(Math.abs(netFlow))}
          </Text>
        </View>

        <Text style={styles.netSub}>
          {isPositiveNet ? 'SURPLUS / POSITIVE CASH FLOW' : 'DEFICIT / HIGH SPEND DETECTED'}
        </Text>
      </BrutalistCard>

      {/* Grid of Debit, Credit, and Bills Due */}
      <View style={styles.grid}>
        {/* Outflow / Debits */}
        <BrutalistCard bgColor={COLORS.coral} style={styles.gridCard}>
          <View style={styles.statTop}>
            <Text style={styles.statLabel}>TOTAL DEBITS</Text>
            <Ionicons name="arrow-down-circle" size={16} color={COLORS.ink} />
          </View>
          <Text style={styles.statValue}>
            {currencySymbol}{formatAmount(totalDebit)}
          </Text>
          <Text style={styles.statFoot}>TOTAL EXPENSES</Text>
        </BrutalistCard>

        {/* Inflow / Credits */}
        <BrutalistCard bgColor={COLORS.lime} style={styles.gridCard}>
          <View style={styles.statTop}>
            <Text style={styles.statLabel}>TOTAL CREDITS</Text>
            <Ionicons name="arrow-up-circle" size={16} color={COLORS.ink} />
          </View>
          <Text style={styles.statValue}>
            {currencySymbol}{formatAmount(totalCredit)}
          </Text>
          <Text style={styles.statFoot}>SALARY & INFLOW</Text>
        </BrutalistCard>
      </View>

      {/* Bills Due Banner */}
      {totalBillDue > 0 && (
        <BrutalistCard bgColor={COLORS.orange} style={styles.billDueCard}>
          <View style={styles.billRow}>
            <View style={styles.billIconCol}>
              <Ionicons name="warning" size={20} color={COLORS.white} />
            </View>
            <View style={styles.billTextCol}>
              <Text style={styles.billTitle}>UPCOMING BILLS DUE DETECTED</Text>
              <Text style={styles.billAmount}>
                {currencySymbol}{formatAmount(totalBillDue)}
              </Text>
            </View>
          </View>
        </BrutalistCard>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  netCard: {
    marginBottom: 10,
    padding: 16,
  },
  netHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  netLabel: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.8,
  },
  countBadge: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  countText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  netAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  netAmount: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  netSub: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '800',
    color: '#CCCCCC',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCard: {
    flex: 1,
    padding: 12,
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  statValue: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.ink,
  },
  statFoot: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.6)',
    marginTop: 2,
  },
  billDueCard: {
    marginTop: 10,
    padding: 12,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  billIconCol: {
    backgroundColor: COLORS.ink,
    padding: 6,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  billTextCol: {
    flex: 1,
  },
  billTitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.white,
  },
  billAmount: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
  },
});
