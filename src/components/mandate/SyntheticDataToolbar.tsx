import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      'Demo Dataset Loaded',
      'Injected 12 months of test statements containing 4 subscription traps: Netflix price hike, Canva trial trap, Hotstar duplicate, and Cult.fit zombie mandate.'
    );
  };

  const handleResetPress = () => {
    onReset();
    Alert.alert('Reset Complete', 'Restored default mandate data.');
  };

  return (
    <View style={styles.bar}>
      <View style={styles.leftInfo}>
        <Ionicons name="sparkles-outline" size={14} color={COLORS.ink} />
        <Text style={styles.barLabel}>DEMO DATASET</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.loadBtn, isGenerating && styles.btnDisabled]}
          onPress={handleGeneratePress}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          <Ionicons
            name="layers-outline"
            size={12}
            color="#FFFFFF"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.loadBtnText}>
            {isGenerating ? 'LOADING...' : 'LOAD 12-MO TRAPS'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleResetPress} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={12} color={COLORS.ink} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: BRUTALIST.borderWidthThin,
    borderColor: COLORS.ink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    ...BRUTALIST.shadowSm,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barLabel: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10.5,
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.ink,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loadBtnText: {
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
