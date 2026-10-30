import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { MandateRadarStats } from '../../types/mandate';

interface AnnualBleedCardProps {
  stats: MandateRadarStats;
  onAuditPress: () => void;
  isAuditing: boolean;
  isAuraSynced?: boolean;
  auraLatency?: number;
}

export const AnnualBleedCard: React.FC<AnnualBleedCardProps> = ({
  stats,
  onAuditPress,
  isAuditing,
  isAuraSynced = false,
  auraLatency,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>SUBSCRIPTION INTELLIGENCE</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.auditButton,
            isAuraSynced && styles.auditButtonSynced,
            isAuditing && styles.auditButtonDisabled,
          ]}
          onPress={onAuditPress}
          disabled={isAuditing}
          activeOpacity={0.8}
        >
          <Text style={[styles.auditButtonText, isAuraSynced && styles.auditButtonTextSynced]}>
            {isAuditing
              ? 'AUDITING...'
              : isAuraSynced
              ? `🟢 NEO4J AURA (${auraLatency || 38}ms)`
              : '⚡ SYNC NEO4J GRAPH'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titleLabel}>TOTAL ANNUAL BLEED</Text>
      <View style={styles.amountRow}>
        <Text style={styles.currencySymbol}>₹</Text>
        <Text style={styles.annualAmount}>
          {stats.totalAnnualBleed.toLocaleString('en-IN')}
        </Text>
        <Text style={styles.perYearText}>/ year</Text>
      </View>

      <View style={styles.monthlyRow}>
        <Text style={styles.monthlyText}>
          Draining <Text style={styles.monthlyBold}>₹{stats.totalMonthlyBleed.toLocaleString('en-IN')}</Text> every month across <Text style={styles.monthlyBold}>{stats.totalMandates} commitments</Text>
        </Text>
      </View>

      {/* Threat Badges Breakdown */}
      <View style={styles.badgesContainer}>
        {stats.threatsCount > 0 ? (
          <>
            <View style={[styles.badge, styles.badgeThreat]}>
              <Text style={styles.badgeTextThreat}>🚨 {stats.threatsCount} Threats Flagged</Text>
            </View>
            {stats.priceCreepsCount > 0 && (
              <View style={[styles.badge, styles.badgeHike]}>
                <Text style={styles.badgeTextMuted}>📈 {stats.priceCreepsCount} Price Creep</Text>
              </View>
            )}
            {stats.trialTrapsCount > 0 && (
              <View style={[styles.badge, styles.badgeTrap]}>
                <Text style={styles.badgeTextMuted}>⚠️ {stats.trialTrapsCount} Trial Trap</Text>
              </View>
            )}
            {stats.doubleSubscriptionsCount > 0 && (
              <View style={[styles.badge, styles.badgeDup]}>
                <Text style={styles.badgeTextMuted}>🔄 {stats.doubleSubscriptionsCount} Duplicate</Text>
              </View>
            )}
            {stats.zombieChargesCount > 0 && (
              <View style={[styles.badge, styles.badgeZombie]}>
                <Text style={styles.badgeTextMuted}>🧟 {stats.zombieChargesCount} Zombie</Text>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.badge, styles.badgeClean]}>
            <Text style={styles.badgeTextClean}>✓ Zero Hidden Threats Detected</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    padding: 16,
    marginBottom: 16,
    ...BRUTALIST.shadowDefault,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.faintBorder,
  },
  tagText: {
    color: COLORS.ink,
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontSansBold,
    letterSpacing: 0.5,
  },
  auditButton: {
    backgroundColor: COLORS.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  auditButtonSynced: {
    backgroundColor: '#DCFCE7',
    borderColor: '#166534',
  },
  auditButtonDisabled: {
    opacity: 0.6,
  },
  auditButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: BRUTALIST.fontSansBold,
    letterSpacing: 0.3,
  },
  auditButtonTextSynced: {
    color: '#166534',
  },
  titleLabel: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.mutedText,
    letterSpacing: 0.8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  currencySymbol: {
    fontSize: 22,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '700',
    color: COLORS.ink,
    marginRight: 2,
  },
  annualAmount: {
    fontSize: 34,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: -1,
  },
  perYearText: {
    fontSize: 13,
    fontFamily: BRUTALIST.fontSansMedium,
    color: COLORS.mutedText,
    marginLeft: 6,
  },
  monthlyRow: {
    borderTopWidth: 1,
    borderColor: COLORS.faintBorder,
    paddingTop: 8,
    marginBottom: 12,
  },
  monthlyText: {
    fontSize: 12,
    fontFamily: BRUTALIST.fontSans,
    color: COLORS.ink,
    lineHeight: 16,
  },
  monthlyBold: {
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.ink,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
  },
  badgeThreat: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  badgeHike: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  badgeTrap: {
    backgroundColor: '#F5F3FF',
    borderColor: '#8B5CF6',
  },
  badgeDup: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  badgeZombie: {
    backgroundColor: '#F3F4F6',
    borderColor: '#4B5563',
  },
  badgeClean: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  badgeTextThreat: {
    color: '#DC2626',
    fontSize: 10,
    fontFamily: BRUTALIST.fontSansBold,
  },
  badgeTextMuted: {
    color: COLORS.ink,
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontSansMedium,
  },
  badgeTextClean: {
    color: '#15803D',
    fontSize: 10,
    fontFamily: BRUTALIST.fontSansBold,
  },
});
