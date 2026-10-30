import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface BrutalistTickerProps {
  statusText?: string;
  bgColor?: string;
}

export const BrutalistTicker: React.FC<BrutalistTickerProps> = ({
  statusText = 'Zero-Knowledge AutoPay Protection Active • Local SMS Parser',
  bgColor = COLORS.ink,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.contentRow}>
        <View style={styles.indicatorDot} />
        <Text style={styles.statusText} numberOfLines={1}>
          {statusText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: BRUTALIST.borderWidth,
    borderTopWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.lime,
    marginRight: 8,
  },
  statusText: {
    flex: 1,
    fontFamily: BRUTALIST.fontSansMedium,
    fontSize: 11,
    letterSpacing: 0.2,
    color: '#F9FAFB',
  },
});

