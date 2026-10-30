import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          <Text style={styles.tagText}>RECURRING OUTFLOW</Text>
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
          <Ionicons
            name={isAuraSynced ? 'git-network' : 'git-network-outline'}
            size={12}
            color={isAuraSynced ? '#10B981' : '#FFFFFF'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.auditButtonText, isAuraSynced && styles.auditButtonTextSynced]}>
            {isAuditing
              ? 'AUDITING...'
              : isAuraSynced
              ? `NEO4J AURA (${auraLatency || 38}ms)`
              : 'SYNC NEO4J GRAPH'}
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
          ₹{stats.totalMonthlyBleed.toLocaleString('en-IN')}/mo across {stats.totalMandates} commitments
        </Text>
      </View>

      {/* Threat Badges Breakdown */}
      <View style={styles.badgesContainer}>
        {stats.threatsCount > 0 ? (
          <>
            <View style={[styles.badge, styles.badgeThreat]}>
              <Ionicons name="warning-outline" size={11} color="#EF4444" style={{ marginRight: 4 }} />
              <Text style={styles.badgeTextThreat}>{stats.threatsCount} Threats Flagged</Text>
            </View>
            {stats.priceCreepsCount > 0 && (
              <View style={[styles.badge, styles.badgeHike]}>
                <Ionicons name="trending-up-outline" size={11} color="#374151" style={{ marginRight: 4 }} />
                <Text style={styles.badgeTextMuted}>{stats.priceCreepsCount} Price Creep</Text>
              </View>
            )}
            {stats.trialTrapsCount > 0 && (
              <View style={[styles.badge, styles.badgeTrap]}>
                <Ionicons name="alert-circle-outline" size={11} color="#374151" style={{ marginRight: 4 }} />
                <Text style={styles.badgeTextMuted}>{stats.trialTrapsCount} Trial Trap</Text>
              </View>
            )}
            {stats.doubleSubscriptionsCount > 0 && (
              <View style={[styles.badge, styles.badgeDup]}>
                <Ionicons name="copy-outline" size={11} color="#374151" style={{ marginRight: 4 }} />
                <Text style={styles.badgeTextMuted}>{stats.doubleSubscriptionsCount} Duplicate</Text>
              </View>
            )}
            {stats.zombieChargesCount > 0 && (
              <View style={[styles.badge, styles.badgeZombie]}>
                <Ionicons name="time-outline" size={11} color="#374151" style={{ marginRight: 4 }} />
                <Text style={styles.badgeTextMuted}>{stats.zombieChargesCount} Inactive</Text>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.badge, styles.badgeClean]}>
            <Ionicons name="shield-checkmark-outline" size={11} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.badgeTextClean}>Zero Hidden Threats Detected</Text>
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
    padding: 14,
    marginBottom: 10,
    ...BRUTALIST.shadowDefault,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderWidth: 1,
    borderColor: COLORS.faintBorder,
  },
  tagText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9,
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  auditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.ink,
  },
  auditButtonSynced: {
    backgroundColor: '#FFFFFF',
    borderColor: '#10B981',
  },
  auditButtonDisabled: {
    opacity: 0.6,
  },
  auditButtonText: {
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9.5,
    letterSpacing: 0.3,
  },
  auditButtonTextSynced: {
    color: '#065F46',
  },
  titleLabel: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    color: COLORS.mutedText,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  currencySymbol: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.ink,
    marginRight: 2,
  },
  annualAmount: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: -0.5,
  },
  perYearText: {
    fontFamily: BRUTALIST.fontSans,
    fontSize: 13,
    color: COLORS.mutedText,
    marginLeft: 6,
  },
  monthlyRow: {
    marginBottom: 10,
  },
  monthlyText: {
    fontFamily: BRUTALIST.fontSans,
    fontSize: 12,
    color: '#4B5563',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.faintBorder,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeThreat: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  badgeHike: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  badgeTrap: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  badgeDup: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  badgeZombie: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  badgeClean: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  badgeTextThreat: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    color: '#DC2626',
  },
  badgeTextMuted: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    color: '#374151',
  },
  badgeTextClean: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    color: '#059669',
  },
});
