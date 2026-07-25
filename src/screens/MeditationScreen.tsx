import { useFocusEffect } from '@react-navigation/native';
import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeditationTimer } from '../components/MeditationTimer';
import { completeMeditationSession, getStreakState, getTodayVerse } from '../db/repositories';
import { colors } from '../theme/colors';
import type { StreakState, Verse } from '../types';
import { formatDateKey, formatKoreanDate, formatLocalDate } from '../utils/date';

const AMBIENT_TRACK = require('../../assets/audio/meditation-ambient.wav') as number;
const DURATION_OPTIONS = [
  { label: '1분', seconds: 60 },
  { label: '3분', seconds: 180 },
  { label: '5분', seconds: 300 },
] as const;

function safelyPausePlayer(player: AudioPlayer) {
  try {
    player.pause();
  } catch (error) {
    console.warn('[BibleFit] Meditation audio pause skipped', error);
  }
}

function safelyPlayPlayer(player: AudioPlayer) {
  try {
    player.play();
  } catch (error) {
    console.warn('[BibleFit] Meditation audio play skipped', error);
  }
}

export function MeditationScreen() {
  const db = useSQLiteContext();
  const today = new Date();
  const player = useAudioPlayer(AMBIENT_TRACK, { updateInterval: 1000 });
  const [verse, setVerse] = useState<Verse | null>(null);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  const loadMeditation = useCallback(async () => {
    setIsLoading(true);
    try {
      const todayVerse = await getTodayVerse(db, formatDateKey(new Date()));
      const nextStreak = await getStreakState(db);
      setVerse(todayVerse);
      setStreak(nextStreak);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void loadMeditation();

      return () => {
        safelyPausePlayer(player);
        setIsRunning(false);
      };
    }, [loadMeditation, player]),
  );

  useEffect(() => {
    player.loop = true;
    player.volume = 0.22;

    void setAudioModeAsync({
      interruptionMode: 'mixWithOthers',
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    }).catch((error: unknown) => {
      console.warn('[BibleFit] Meditation audio mode skipped', error);
    });
  }, [player]);

  useEffect(() => {
    if (isRunning && isMusicEnabled) {
      safelyPlayPlayer(player);
      return;
    }

    safelyPausePlayer(player);
  }, [isMusicEnabled, isRunning, player]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || remainingSeconds !== 0 || !verse) {
      return;
    }

    setIsRunning(false);
    void completeMeditationSession(db, formatLocalDate(new Date()), verse.id, durationSeconds).then((result) => {
      setStreak(result.streak);
      setCompletionMessage(result.didIncrement ? '오늘의 묵상을 완료했습니다.' : '오늘 묵상은 이미 기록되어 있습니다.');
    });
  }, [db, durationSeconds, isRunning, remainingSeconds, verse]);

  function handleDurationChange(seconds: number) {
    if (isRunning) {
      return;
    }

    setDurationSeconds(seconds);
    setRemainingSeconds(seconds);
    setCompletionMessage(null);
  }

  function handleStart() {
    setCompletionMessage(null);
    setRemainingSeconds((current) => (current === 0 ? durationSeconds : current));
    setIsRunning(true);
  }

  function handlePause() {
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    setRemainingSeconds(durationSeconds);
    setCompletionMessage(null);
    void player.seekTo(0).catch(() => {});
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>MEDITATION</Text>
          <Text style={styles.title}>묵상</Text>
          <Text style={styles.subtitle}>{formatKoreanDate(today)}</Text>
        </View>

        {verse ? (
          <>
            <View style={styles.versePanel}>
              <Text style={styles.reference}>{verse.reference}</Text>
              <Text style={styles.verseText}>{verse.text}</Text>
            </View>

            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((option) => {
                const isSelected = option.seconds === durationSeconds;

                return (
                  <Pressable
                    disabled={isRunning}
                    key={option.seconds}
                    onPress={() => handleDurationChange(option.seconds)}
                    style={[styles.durationButton, isSelected && styles.durationButtonSelected]}
                  >
                    <Text style={[styles.durationText, isSelected && styles.durationTextSelected]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.musicRow}>
              <View>
                <Text style={styles.musicTitle}>배경음악</Text>
                <Text style={styles.musicSubtitle}>{isMusicEnabled ? '고요한 루프 재생' : '무음 묵상'}</Text>
              </View>
              <Pressable
                onPress={() => setIsMusicEnabled((current) => !current)}
                style={[styles.musicToggle, isMusicEnabled && styles.musicToggleOn]}
              >
                <Text style={[styles.musicToggleText, isMusicEnabled && styles.musicToggleTextOn]}>
                  {isMusicEnabled ? '켜짐' : '꺼짐'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.timerPanel}>
              <MeditationTimer
                isRunning={isRunning}
                onPause={handlePause}
                onReset={handleReset}
                onStart={handleStart}
                remainingSeconds={remainingSeconds}
                totalSeconds={durationSeconds}
              />
              {completionMessage ? <Text style={styles.completion}>{completionMessage}</Text> : null}
            </View>

            <View style={styles.streakPanel}>
              <View>
                <Text style={styles.streakLabel}>현재 스트릭</Text>
                <Text style={styles.streakValue}>{streak?.current_count ?? 0}일</Text>
              </View>
              <View style={styles.streakDivider} />
              <View>
                <Text style={styles.streakLabel}>최장 기록</Text>
                <Text style={styles.streakValue}>{streak?.longest_count ?? 0}일</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.timerPanel}>
            <Text style={styles.reference}>말씀 데이터를 찾지 못했습니다.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  completion: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 34,
  },
  durationButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  durationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '900',
  },
  durationTextSelected: {
    color: colors.textLight,
  },
  header: {
    gap: 5,
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  musicRow: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  musicSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  musicTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  musicToggle: {
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 64,
    paddingHorizontal: 12,
  },
  musicToggleOn: {
    backgroundColor: colors.primary,
  },
  musicToggleText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
  musicToggleTextOn: {
    color: colors.textLight,
  },
  reference: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  streakDivider: {
    backgroundColor: colors.border,
    height: 44,
    width: 1,
  },
  streakLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  streakPanel: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 18,
  },
  streakValue: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  timerPanel: {
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 18,
    padding: 18,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  versePanel: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  verseText: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 28,
  },
});
