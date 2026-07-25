import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import * as Sharing from 'expo-sharing';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { VerseCard } from '../components/VerseCard';
import { getTodayVerse, toggleSavedVerse } from '../db/repositories';
import { colors } from '../theme/colors';
import type { Verse } from '../types';
import { formatDateKey, formatKoreanDate } from '../utils/date';

export function HomeScreen() {
  const db = useSQLiteContext();
  const cardRef = useRef<View>(null);
  const today = new Date();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const loadHome = useCallback(async () => {
    setIsLoading(true);
    try {
      setVerse(await getTodayVerse(db, formatDateKey(new Date())));
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void loadHome();
    }, [loadHome]),
  );

  async function handleToggleSaved() {
    if (!verse) {
      return;
    }

    const isSaved = await toggleSavedVerse(db, verse.id);
    setVerse({ ...verse, is_saved: isSaved ? 1 : 0 });
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
  center: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
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
