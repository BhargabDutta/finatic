import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface BrutalistHeaderProps {
  onResetData?: () => void;
}

export const BrutalistHeader: React.FC<BrutalistHeaderProps> = () => {
  const todayStr = new Date()
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();

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

        {/* Clean Live Status Pill */}
        <View style={styles.liveShieldPill}>
          <View style={styles.liveShieldDot} />
          <Text style={styles.liveShieldText}>ACTIVE</Text>
        </View>
      </View>

      <View style={styles.dateBar}>
        <Text style={styles.dateText}>DATE: {todayStr}</Text>
        <View style={styles.privacyTag}>
          <Ionicons
            name="shield-checkmark-outline"
            size={12}
            color={COLORS.ink}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.tagline}>100% ON-DEVICE PRIVACY</Text>
        </View>
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
  liveShieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: '#F9FAFB',
    gap: 5,
  },
  liveShieldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveShieldText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9.5,
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  dateBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  privacyTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagline: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    color: COLORS.ink,
  },
});
