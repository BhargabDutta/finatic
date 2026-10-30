import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface SyntheticDataToolbarProps {
  onGenerate: () => void;
  onReset: () => void;
  isGenerating?: boolean;
}

export const SyntheticDataToolbar: React.FC<SyntheticDataToolbarProps> = ({
  onGenerate,
  onReset,
  isGenerating = false,
}) => {
  const handleGeneratePress = () => {
    onGenerate();
    Alert.alert(
      'Demo Dataset Generated',
      'Loaded 12 months of synthetic bank statements with 4 real-world subscription traps (Netflix price creep, Hotstar double billing, Canva trial ambush, Cult.fit NACH).',
      [{ text: 'OK' }]
    );
  };

  const handleResetPress = () => {
    onReset();
    Alert.alert('Reset', 'Mandates and statement cache have been reset.');
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TEST & DEMO TOOLKIT</Text>
        </View>
        <Text style={styles.statusText}>SYNTHETIC STATEMENTS</Text>
      </View>

      <Text style={styles.title}>1-Tap Synthetic Data Generator</Text>
      <Text style={styles.description}>
        No real bank SMS? Generate 12 months of synthetic statements to test stealth price creep, trial ambushes, and cross-card duplicate detection instantly.
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.primaryBtn, isGenerating && styles.btnDisabled]}
          onPress={handleGeneratePress}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>
            {isGenerating ? 'GENERATING...' : '⚡ GENERATE 12-MO DEMO DATA'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleResetPress} activeOpacity={0.8}>
          <Text style={styles.secondaryBtnText}>🔄 RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    padding: 14,
    marginBottom: 14,
    ...BRUTALIST.shadowSm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    backgroundColor: COLORS.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 8.5,
    letterSpacing: 0.5,
  },
  statusText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    color: COLORS.mutedText,
    fontWeight: '700',
  },
  title: {
    fontSize: 14,
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.ink,
    marginBottom: 3,
  },
  description: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontSans,
    color: COLORS.mutedText,
    lineHeight: 15,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: COLORS.ink,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    ...BRUTALIST.shadowSm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  secondaryBtnText: {
    color: COLORS.ink,
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
  },
});
