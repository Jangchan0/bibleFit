import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme/colors';

type MeditationTimerProps = {
  isRunning: boolean;
  onPause: () => void;
  onReset: () => void;
  onStart: () => void;
  remainingSeconds: number;
  totalSeconds: number;
};

const SIZE = 238;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MeditationTimer({
  isRunning,
  onPause,
  onReset,
  onStart,
  remainingSeconds,
  totalSeconds,
}: MeditationTimerProps) {
  const progress = Math.min(1, Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds));
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const hasStarted = remainingSeconds < totalSeconds;
  const isComplete = remainingSeconds === 0;
  const actionLabel = isRunning ? '잠시 멈춤' : hasStarted && !isComplete ? '계속하기' : '묵상 시작';
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>{isRunning ? '호흡을 고르고 말씀에 머무는 중' : '조용히 시작할 준비가 되었습니다'}</Text>
      <View style={styles.ring}>
        <Svg height={SIZE} width={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            r={RADIUS}
            stroke={colors.cardAlt}
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
          <Text style={styles.timeText}>{formattedTime}</Text>
          <Text style={styles.unit}>남은 시간</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={isRunning ? onPause : onStart} style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
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
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 54,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '900',
  },
  caption: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  ring: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    height: SIZE,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    width: SIZE,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 20,
  },
  secondaryText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
  },
  time: {
    alignItems: 'center',
    position: 'absolute',
  },
  timeText: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '900',
  },
  unit: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  wrap: {
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
});
