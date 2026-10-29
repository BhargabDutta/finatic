import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { ThinkingPhase } from '../../types/chat';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface ThinkingIndicatorProps {
  phase: ThinkingPhase;
  elapsedSeconds: number;
  isWarmingUp: boolean;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  phase,
  elapsedSeconds,
  isWarmingUp,
}) => {
  // Stable Animated values using lazy state initialization
  const [pulse1] = useState(() => new Animated.Value(0.3));
  const [pulse2] = useState(() => new Animated.Value(0.3));
  const [pulse3] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const createPulseAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createPulseAnimation(pulse1, 0);
    const anim2 = createPulseAnimation(pulse2, 200);
    const anim3 = createPulseAnimation(pulse3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [pulse1, pulse2, pulse3]);

  const getPhaseDescription = (p: ThinkingPhase): string => {
    switch (p) {
      case 'ANALYZING_QUERY':
        return '🔍 Parsing query & extracting transaction descriptors...';
      case 'SCANNING_TAXONOMY':
        return '🕸️ Consulting merchant entity taxonomy & Neo4j graph...';
      case 'EVALUATING_MANDATES':
        return '⚡ Calculating price creep & cancellation runbooks...';
      case 'SYNTHESIZING_RESPONSE':
        return '🤖 Formulating actionable financial advisory...';
      case 'WARMING_SERVER':
        return '⏳ Render cloud instance is waking from standby (free tier)...';
      default:
        return '⚡ Processing financial intelligence...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.thinkingCard}>
        {/* Header with status pill and elapsed seconds */}
        <View style={styles.cardHeader}>
          <View style={styles.statusPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusPillText}>SUBCLEAR AI // THINKING</Text>
          </View>
          <Text style={styles.timerText}>{elapsedSeconds}s ELAPSED</Text>
        </View>

        {/* Dynamic Phase Description */}
        <View style={styles.phaseRow}>
          <Text style={styles.phaseText}>{getPhaseDescription(phase)}</Text>
        </View>

        {/* Animated Three-Dot Wave */}
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: pulse1 }]} />
          <Animated.View style={[styles.dot, { opacity: pulse2 }]} />
          <Animated.View style={[styles.dot, { opacity: pulse3 }]} />
        </View>

        {/* Server Cold-Start Notice */}
        {isWarmingUp && (
          <View style={styles.warmingBanner}>
            <Text style={styles.warmingIcon}>⚡</Text>
            <Text style={styles.warmingText}>
              Render free tier spins down on idle. Please hold on ~20-30s while the AI container boots up!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  thinkingCard: {
    backgroundColor: '#FFFDEB',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.black,
    padding: 14,
    maxWidth: '94%',
    ...BRUTALIST.shadowSm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.coral,
  },
  statusPillText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  timerText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.mutedText,
  },
  phaseRow: {
    marginVertical: 4,
  },
  phaseText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 18,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.black,
  },
  warmingBanner: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#FFF2D6',
    borderWidth: 1,
    borderColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warmingIcon: {
    fontSize: 14,
  },
  warmingText: {
    flex: 1,
    fontSize: 11,
    color: '#8A4B00',
    fontWeight: '700',
    lineHeight: 15,
  },
});
