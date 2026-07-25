import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme/colors';

type MeditationTimerProps = {
  isRunning: boolean;
  onReset: () => void;
  onStart: () => void;
  remainingSeconds: number;
  totalSeconds: number;
};

const SIZE = 164;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MeditationTimer({
  isRunning,
  onReset,
  onStart,
  remainingSeconds,
  totalSeconds,
}: MeditationTimerProps) {
  const progress = Math.min(1, Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds));
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        <Svg height={SIZE} width={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            r={RADIUS}
            stroke={colors.border}
            strokeWidth={STROKE}
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            r={RADIUS}
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
            stroke={colors.primary}
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth={STROKE}
          />
        </Svg>
        <View style={styles.time}>
          <Text style={styles.seconds}>{remainingSeconds}</Text>
          <Text style={styles.unit}>seconds</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable disabled={isRunning} onPress={onStart} style={[styles.button, isRunning && styles.buttonDisabled]}>
          <Text style={styles.buttonText}>{isRunning ? '묵상 중' : '묵상 시작'}</Text>
        </Pressable>
        <Pressable onPress={onReset} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>초기화</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    backgroundColor: colors.muted,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '800',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
  },
  secondaryText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  seconds: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900',
  },
  time: {
    alignItems: 'center',
    position: 'absolute',
  },
  unit: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  wrap: {
    alignItems: 'center',
    gap: 18,
  },
});
