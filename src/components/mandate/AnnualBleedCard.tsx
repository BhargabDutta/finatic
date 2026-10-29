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
          <Text style={styles.tagText}>⚠️ MANDATE RADAR // DETECTIVE ENGINE</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.auditButton,
            isAuraSynced && styles.auditButtonSynced,
            isAuditing && styles.auditButtonDisabled,
          ]}
          onPress={onAuditPress}
          disabled={isAuditing}
        >
          <Text style={[styles.auditButtonText, isAuraSynced && styles.auditButtonTextSynced]}>
            {isAuditing
              ? 'AUDITING...'
              : isAuraSynced
              ? `🟢 AURA (${auraLatency || 38}ms)`
              : '⚡ RUN GRAPH AUDIT'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titleLabel}>SILENT ANNUAL BLEED</Text>
      <View style={styles.amountRow}>
        <Text style={styles.currencySymbol}>₹</Text>
        <Text style={styles.annualAmount}>
          {stats.totalAnnualBleed.toLocaleString('en-IN')}
        </Text>
        <Text style={styles.perYearText}>/ YEAR</Text>
      </View>

      <View style={styles.monthlyRow}>
        <Text style={styles.monthlyText}>
          DRAINING <Text style={styles.monthlyBold}>₹{stats.totalMonthlyBleed.toLocaleString('en-IN')}</Text> EVERY MONTH ACROSS <Text style={styles.monthlyBold}>{stats.totalMandates} COMMITMENTS</Text>
        </Text>
      </View>

      {/* Threat Badges Breakdown */}
      <View style={styles.badgesContainer}>
        {stats.threatsCount > 0 ? (
          <>
            <View style={[styles.badge, styles.badgeThreat]}>
              <Text style={styles.badgeText}>🚨 {stats.threatsCount} CRITICAL THREATS</Text>
            </View>
            {stats.priceCreepsCount > 0 && (
              <View style={[styles.badge, styles.badgeHike]}>
                <Text style={styles.badgeText}>📈 {stats.priceCreepsCount} PRICE CREEP</Text>
              </View>
            )}
            {stats.trialTrapsCount > 0 && (
              <View style={[styles.badge, styles.badgeTrap]}>
                <Text style={styles.badgeText}>⚠️ {stats.trialTrapsCount} TRIAL TRAP</Text>
              </View>
            )}
            {stats.doubleSubscriptionsCount > 0 && (
              <View style={[styles.badge, styles.badgeDup]}>
                <Text style={styles.badgeText}>🔄 {stats.doubleSubscriptionsCount} DUPLICATE</Text>
              </View>
            )}
            {stats.zombieChargesCount > 0 && (
              <View style={[styles.badge, styles.badgeZombie]}>
                <Text style={styles.badgeText}>🧟 {stats.zombieChargesCount} ZOMBIE</Text>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.badge, styles.badgeClean]}>
            <Text style={styles.badgeText}>✓ ZERO SNEAKY THREATS DETECTED</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.yellow,
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.black,
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
    backgroundColor: COLORS.black,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    color: COLORS.yellow,
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  auditButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: COLORS.black,
  },
  auditButtonSynced: {
    backgroundColor: '#00E575',
    borderColor: '#000',
  },
  auditButtonDisabled: {
    opacity: 0.6,
  },
  auditButtonText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
  },
  auditButtonTextSynced: {
    color: '#000',
  },
  titleLabel: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  currencySymbol: {
    fontSize: 24,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
    marginRight: 4,
  },
  annualAmount: {
    fontSize: 38,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: -1,
  },
  perYearText: {
    fontSize: 14,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
    marginLeft: 6,
  },
  monthlyRow: {
    borderTopWidth: 1.5,
    borderColor: COLORS.black,
    paddingTop: 8,
    marginBottom: 10,
  },
  monthlyText: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    color: '#111',
    letterSpacing: 0.3,
  },
  monthlyBold: {
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
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
    borderColor: COLORS.black,
  },
  badgeThreat: {
    backgroundColor: '#FF3366',
  },
  badgeHike: {
    backgroundColor: '#FF8800',
  },
  badgeTrap: {
    backgroundColor: '#9900EF',
  },
  badgeDup: {
    backgroundColor: '#00C8FF',
  },
  badgeZombie: {
    backgroundColor: '#333333',
  },
  badgeClean: {
    backgroundColor: '#00E575',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
  },
});
