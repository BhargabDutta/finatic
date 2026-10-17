import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { BrutalistButton } from './BrutalistButton';

interface BrutalistHeaderProps {
  onOpenSimulator: () => void;
  onResetData: () => void;
}

export const BrutalistHeader: React.FC<BrutalistHeaderProps> = ({
  onOpenSimulator,
  onResetData,
}) => {
  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <View style={styles.brandTextCol}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>SYSTEM // RADAR</Text>
            </View>
            <Text style={styles.title}>FINATIC</Text>
            <Text style={styles.subtitle}>SMS FINANCIAL INTEL</Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <BrutalistButton
            title="+ TEST"
            onPress={onOpenSimulator}
            variant="yellow"
            size="sm"
            icon="flash"
            style={styles.actionBtn}
          />
        </View>
      </View>

      <View style={styles.dateBar}>
        <Text style={styles.dateText}>DATE: {todayStr}</Text>
        <Text style={styles.tagline}>ON-DEVICE AUTO-SCAN: 3M</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.paper,
    paddingTop: Platform.OS === 'android' ? 44 : 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    marginRight: 10,
    backgroundColor: COLORS.yellow,
  },
  brandTextCol: {
    flex: 1,
  },
  logoBadge: {
    backgroundColor: COLORS.ink,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  logoBadgeText: {
    color: COLORS.yellow,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    color: COLORS.ink,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedText,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  actionBtn: {
    marginTop: 4,
  },
  dateBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderColor: COLORS.ink,
  },
  dateText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.ink,
  },
  tagline: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.coral,
  },
});
