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
              <Text style={styles.logoBadgeText}>AUTOPAY INTELLIGENCE</Text>
            </View>
            <Text style={styles.title}>FINATIC</Text>
            <Text style={styles.subtitle}>Privacy Shield & Sub Detective</Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <BrutalistButton
            title="+ TEST DATA"
            onPress={onOpenSimulator}
            variant="ink"
            size="sm"
            icon="flash"
            style={styles.actionBtn}
          />
        </View>
      </View>

      <View style={styles.dateBar}>
        <Text style={styles.dateText}>DATE: {todayStr}</Text>
        <Text style={styles.tagline}>🛡️ 100% ON-DEVICE PRIVACY</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
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
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: COLORS.ink,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  brandTextCol: {
    flex: 1,
  },
  logoBadge: {
    backgroundColor: COLORS.ink,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 2,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 8.5,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontFamily: BRUTALIST.fontSansBold,
    letterSpacing: -0.5,
    color: COLORS.ink,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: BRUTALIST.fontSans,
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 1,
  },
  buttonGroup: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  actionBtn: {
    marginTop: 2,
  },
  dateBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: COLORS.faintBorder,
  },
  dateText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedText,
  },
  tagline: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    color: COLORS.ink,
  },
});
