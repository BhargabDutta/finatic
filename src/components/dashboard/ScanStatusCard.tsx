import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { BrutalistCard } from '../brutalist/BrutalistCard';
import { BrutalistButton } from '../brutalist/BrutalistButton';
import { Ionicons } from '@expo/vector-icons';

interface ScanStatusCardProps {
  secondsLeft: number;
  totalInterval: number;
  isScanning: boolean;
  lastScanTime: number;
  totalCount: number;
  onForceScan: () => void;
  isNativeAndroid: boolean;
  hasPermission: boolean;
  onRequestPermission: () => void;
}

export const ScanStatusCard: React.FC<ScanStatusCardProps> = ({
  secondsLeft,
  totalInterval,
  isScanning,
  lastScanTime,
  totalCount,
  onForceScan,
  isNativeAndroid,
  hasPermission,
  onRequestPermission,
}) => {
  // Format MM:SS
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const progressPct = Math.max(0, Math.min(100, ((totalInterval - secondsLeft) / totalInterval) * 100));

  const formatLastScan = () => {
    const diffSec = Math.floor((Date.now() - lastScanTime) / 1000);
    if (diffSec < 60) return 'JUST NOW';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}M AGO`;
    return `${Math.floor(diffMin / 60)}H AGO`;
  };

  return (
    <BrutalistCard bgColor={COLORS.white} style={styles.card}>
      <View style={styles.topStatusRow}>
        <View style={styles.liveIndicator}>
          <View style={[styles.pulseCircle, isScanning && styles.pulseActive]} />
          <Text style={styles.liveText}>
            {isScanning ? 'SCANNING SMS INBOX...' : '3-MIN PERIODIC SCANNER ACTIVE'}
          </Text>
        </View>

        <View style={styles.lastScanBadge}>
          <Text style={styles.lastScanText}>LAST: {formatLastScan()}</Text>
        </View>
      </View>

      <View style={styles.timerRow}>
        <View>
          <Text style={styles.timerLabel}>NEXT AUTO-SCAN IN</Text>
          <Text style={styles.timerDigits}>{timeFormatted}</Text>
        </View>

        <View style={styles.scanBtnContainer}>
          <BrutalistButton
            title={isScanning ? 'SCANNING...' : 'SCAN INBOX'}
            onPress={onForceScan}
            variant="lime"
            icon="sync"
            disabled={isScanning}
            size="md"
          />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
      </View>

      {/* Footer Info Row */}
      <View style={styles.footerRow}>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubbles-outline" size={12} color={COLORS.ink} />
          <Text style={styles.footerText}>
            MESSAGES SCANNED: <Text style={styles.footerBold}>{totalCount}</Text>
          </Text>
        </View>

        {isNativeAndroid && !hasPermission ? (
          <BrutalistButton
            title="GRANT SMS ACCESS"
            onPress={onRequestPermission}
            variant="coral"
            size="sm"
          />
        ) : (
          <View style={styles.syncModeTag}>
            <Text style={styles.syncModeText}>
              {isNativeAndroid && hasPermission ? 'PHONE INBOX SYNC' : 'LIVE DEMO & SIMULATOR'}
            </Text>
          </View>
        )}
      </View>
    </BrutalistCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  topStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.lime,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    marginRight: 6,
  },
  pulseActive: {
    backgroundColor: COLORS.coral,
  },
  liveText: {
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
    color: COLORS.ink,
  },
  lastScanBadge: {
    backgroundColor: COLORS.paperDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  lastScanText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  timerLabel: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.mutedText,
    letterSpacing: 0.5,
  },
  timerDigits: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    color: COLORS.ink,
    lineHeight: 38,
  },
  scanBtnContainer: {
    marginBottom: 2,
  },
  progressBarWrapper: {
    height: 10,
    backgroundColor: COLORS.paperDark,
    borderWidth: 2,
    borderColor: COLORS.ink,
    marginVertical: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.yellow,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderColor: COLORS.faintBorder,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    color: COLORS.mutedText,
    fontWeight: '700',
  },
  footerBold: {
    color: COLORS.ink,
    fontWeight: '900',
  },
  syncModeTag: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.ink,
  },
  syncModeText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
});
