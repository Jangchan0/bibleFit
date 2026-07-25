import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getSavedVerses, toggleSavedVerse } from '../db/repositories';
import { colors } from '../theme/colors';
import type { Verse } from '../types';

export function SavedScreen() {
  const db = useSQLiteContext();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSaved = useCallback(async () => {
    setIsLoading(true);
    try {
      setVerses(await getSavedVerses(db));
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void loadSaved();
    }, [loadSaved]),
  );

  async function handleRemove(verseId: string) {
    await toggleSavedVerse(db, verseId);
    await loadSaved();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>보관함</Text>
          <Text style={styles.subtitle}>저장한 말씀을 다시 꺼내봅니다.</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <FlatList
            contentContainerStyle={verses.length ? styles.list : styles.emptyWrap}
            data={verses}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>아직 저장한 말씀이 없습니다.</Text>
                <Text style={styles.emptyText}>오늘 탭에서 마음에 남는 구절을 저장해보세요.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.itemBody}>
                  <Text style={styles.reference}>{item.reference}</Text>
                  <Text style={styles.text}>{item.text}</Text>
                  <Text style={styles.meta}>{item.date_key} · {item.translation}</Text>
                </View>
                <Pressable onPress={() => void handleRemove(item.id)} style={styles.removeButton}>
                  <Text style={styles.removeText}>삭제</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
    padding: 18,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    gap: 6,
  },
  item: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
    padding: 16,
  },
  itemBody: {
    gap: 8,
  },
  list: {
    paddingBottom: 34,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  reference: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
  removeButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F7E7E7',
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  removeText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '900',
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
});
