import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { MeditationTimer } from '../components/MeditationTimer';
import { VerseCard } from '../components/VerseCard';
import {
  completeMeditationSession,
  getCachedAiInterpretation,
  getStreakState,
  getTodayVerse,
  saveAiInterpretation,
  toggleSavedVerse,
} from '../db/repositories';
import { AI_PROMPT_VERSION, fetchAiInterpretation } from '../services/ai';
import { colors } from '../theme/colors';
import type { AiInterpretation, StreakState, Verse } from '../types';
import { formatDateKey, formatKoreanDate, formatLocalDate } from '../utils/date';

const TOTAL_SECONDS = 60;

export function HomeScreen() {
  const db = useSQLiteContext();
  const cardRef = useRef<View>(null);
  const today = new Date();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<AiInterpretation | null>(null);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  const loadHome = useCallback(async () => {
    setIsLoading(true);
    try {
      const todayVerse = await getTodayVerse(db, formatDateKey(new Date()));
      const nextStreak = await getStreakState(db);
      setVerse(todayVerse);
      setStreak(nextStreak);
      setAiInterpretation(todayVerse ? await getCachedAiInterpretation(db, todayVerse.id) : null);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void loadHome();
    }, [loadHome]),
  );

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
    void completeMeditationSession(db, formatLocalDate(new Date()), verse.id, TOTAL_SECONDS).then((result) => {
      setStreak(result.streak);
      setCompletionMessage(result.didIncrement ? '오늘의 묵상을 완료했습니다.' : '오늘 묵상은 이미 기록되어 있습니다.');
    });
  }, [db, isRunning, remainingSeconds, verse]);

  async function handleToggleSaved() {
    if (!verse) {
      return;
    }

    const isSaved = await toggleSavedVerse(db, verse.id);
    setVerse({ ...verse, is_saved: isSaved ? 1 : 0 });
  }

  async function handleAiInterpretation() {
    if (!verse) {
      return;
    }

    const cached = await getCachedAiInterpretation(db, verse.id);

    if (cached) {
      setAiInterpretation(cached);
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await fetchAiInterpretation(verse);
      const input = {
        interpretation: result.interpretation,
        model: result.model,
        prompt_version: AI_PROMPT_VERSION,
        verse_id: verse.id,
      };
      await saveAiInterpretation(db, input);
      setAiInterpretation({ ...input, created_at: new Date().toISOString() });
    } catch (error) {
      Alert.alert('AI 해석을 불러오지 못했습니다', error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.');
    } finally {
      setIsAiLoading(false);
    }
  }

  async function handleShareCard() {
    if (!cardRef.current) {
      return;
    }

    setIsSharing(true);
    try {
      const available = await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert('공유 불가', '이 환경에서는 공유 기능을 사용할 수 없습니다.');
        return;
      }

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 0.95,
        result: 'tmpfile',
      });
      await Sharing.shareAsync(uri, {
        dialogTitle: '오늘의 말씀 공유',
        mimeType: 'image/png',
      });
    } catch (error) {
      Alert.alert('공유 실패', error instanceof Error ? error.message : '카드를 이미지로 만드는 중 문제가 생겼습니다.');
    } finally {
      setIsSharing(false);
    }
  }

  function handleStartTimer() {
    setCompletionMessage(null);
    setRemainingSeconds(TOTAL_SECONDS);
    setIsRunning(true);
  }

  function handleResetTimer() {
    setIsRunning(false);
    setRemainingSeconds(TOTAL_SECONDS);
    setCompletionMessage(null);
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
          <Text style={styles.kicker}>BibleFit</Text>
          <Text style={styles.title}>오늘의 말씀</Text>
          <Text style={styles.subtitle}>{formatKoreanDate(today)}</Text>
        </View>

        {verse ? (
          <>
            <VerseCard ref={cardRef} dateLabel={formatKoreanDate(today)} verse={verse} />

            <View style={styles.actionRow}>
              <Pressable
                onPress={handleToggleSaved}
                style={[styles.actionButton, Boolean(verse.is_saved) && styles.savedButton]}
              >
                <Text style={[styles.actionText, Boolean(verse.is_saved) && styles.savedText]}>
                  {verse.is_saved ? '저장됨' : '저장'}
                </Text>
              </Pressable>
              <Pressable disabled={isSharing} onPress={handleShareCard} style={styles.actionButton}>
                <Text style={styles.actionText}>{isSharing ? '공유 준비 중' : '카드 공유'}</Text>
              </Pressable>
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>AI 일상 해석</Text>
                <Pressable disabled={isAiLoading} onPress={handleAiInterpretation} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>{isAiLoading ? '불러오는 중' : '해석 보기'}</Text>
                </Pressable>
              </View>
              <Text style={styles.aiText}>
                {aiInterpretation?.interpretation ??
                  'Gemini API 키를 설정하면 오늘의 말씀을 일상 언어로 2~3문장 해석합니다.'}
              </Text>
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>1분 묵상</Text>
                <Text style={styles.streakText}>현재 {streak?.current_count ?? 0}일</Text>
              </View>
              <MeditationTimer
                isRunning={isRunning}
                onReset={handleResetTimer}
                onStart={handleStartTimer}
                remainingSeconds={remainingSeconds}
                totalSeconds={TOTAL_SECONDS}
              />
              {completionMessage ? <Text style={styles.completion}>{completionMessage}</Text> : null}
            </View>
          </>
        ) : (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>말씀 데이터를 찾지 못했습니다.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 8,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  aiText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
  },
  center: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  completion: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 34,
  },
  header: {
    gap: 5,
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  panel: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  panelTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  savedButton: {
    backgroundColor: colors.primary,
  },
  savedText: {
    color: colors.textLight,
  },
  smallButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  smallButtonText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '800',
  },
  streakText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
});
