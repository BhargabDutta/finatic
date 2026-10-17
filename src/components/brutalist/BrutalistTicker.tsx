import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface BrutalistTickerProps {
  statusText?: string;
  bgColor?: string;
}

export const BrutalistTicker: React.FC<BrutalistTickerProps> = ({
  statusText = 'FINATIC INTELLIGENCE // 3-MIN INTERVAL SYNC ACTIVE // ON-DEVICE PARSER // ZERO CLOUD LEAK',
  bgColor = COLORS.yellow,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pulseDot} />
        <Text style={styles.tickerText}>
          {statusText} &nbsp;///&nbsp; {statusText}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: BRUTALIST.borderWidth,
    borderTopWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.coral,
    marginRight: 8,
  },
  tickerText: {
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.ink,
    textTransform: 'uppercase',
  },
});
