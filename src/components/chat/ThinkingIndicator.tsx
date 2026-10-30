import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThinkingPhase } from '../../types/chat';
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

  const getPhaseInfo = (p: ThinkingPhase): { icon: 'search-outline' | 'git-network-outline' | 'calculator-outline' | 'sparkles-outline' | 'time-outline'; text: string } => {
    switch (p) {
      case 'ANALYZING_QUERY':
        return { icon: 'search-outline', text: 'Parsing query and extracting bank descriptors...' };
      case 'SCANNING_TAXONOMY':
        return { icon: 'git-network-outline', text: 'Consulting merchant graph taxonomy...' };
      case 'EVALUATING_MANDATES':
        return { icon: 'calculator-outline', text: 'Analyzing price trend and cancellation runbooks...' };
      case 'SYNTHESIZING_RESPONSE':
        return { icon: 'sparkles-outline', text: 'Formulating structured advisory summary...' };
      case 'WARMING_SERVER':
        return { icon: 'time-outline', text: 'AI cloud instance is waking from standby...' };
      default:
        return { icon: 'sparkles-outline', text: 'Processing intelligence...' };
    }
  };

  const phaseInfo = getPhaseInfo(phase);

  return (
    <View style={styles.container}>
      <View style={styles.thinkingCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.statusPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusPillText}>SUBCLEAR AI // ACTIVE</Text>
          </View>
          <Text style={styles.timerText}>{elapsedSeconds}s</Text>
        </View>

        {/* Dynamic Phase Description */}
        <View style={styles.phaseRow}>
          <Ionicons name={phaseInfo.icon} size={14} color="#111827" style={{ marginRight: 6 }} />
          <Text style={styles.phaseText}>{phaseInfo.text}</Text>
        </View>

        {/* Animated Three-Dot Wave */}
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: pulse1 }]} />
          <Animated.View style={[styles.dot, { opacity: pulse2 }]} />
          <Animated.View style={[styles.dot, { opacity: pulse3 }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  thinkingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#111827',
    padding: 12,
    maxWidth: '85%',
    ...BRUTALIST.shadowSm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusPillText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9,
    color: '#111827',
    letterSpacing: 0.5,
  },
  timerText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  phaseText: {
    flex: 1,
    fontFamily: BRUTALIST.fontSans,
    fontSize: 11.5,
    color: '#374151',
    lineHeight: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#111827',
  },
});
