import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAppSettings, getStreakState, saveNotificationSettings } from '../db/repositories';
import { areNotificationsUnavailableInExpoGo, cancelReminder, scheduleDailyReminder } from '../services/notifications';
import { colors } from '../theme/colors';
import type { AppSettings, StreakState } from '../types';

export function SettingsScreen() {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [hourText, setHourText] = useState('08');
  const [minuteText, setMinuteText] = useState('00');
  const [isSaving, setIsSaving] = useState(false);
  const notificationsUnavailableInExpoGo = areNotificationsUnavailableInExpoGo();

  const loadSettings = useCallback(async () => {
    const nextSettings = await getAppSettings(db);
    const nextStreak = await getStreakState(db);
    setSettings(nextSettings);
    setStreak(nextStreak);
    setHourText(String(nextSettings.notificationHour).padStart(2, '0'));
    setMinuteText(String(nextSettings.notificationMinute).padStart(2, '0'));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void loadSettings();
    }, [loadSettings]),
  );

  async function handleSaveNotification() {
    const hour = Number(hourText);
    const minute = Number(minuteText);

    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
      Alert.alert('시간 확인 필요', '알림 시간은 00:00부터 23:59 사이로 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await scheduleDailyReminder(settings?.notificationIdentifier ?? null, hour, minute);
      await saveNotificationSettings(db, {
        notificationHour: hour,
        notificationIdentifier: result.identifier,
        notificationMinute: minute,
        notificationsEnabled: result.granted,
      });
      await loadSettings();
      Alert.alert(
        result.granted ? '알림 설정 완료' : '알림 사용 불가',
        result.reason === 'expo-go-android'
          ? 'Expo Go Android에서는 알림 모듈을 사용할 수 없습니다. npm run android:dev로 개발 빌드를 실행해주세요.'
          : result.granted
            ? '매일 알림을 예약했습니다.'
            : '기기 설정에서 알림 권한을 허용해주세요.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDisableNotification() {
    setIsSaving(true);
    try {
      await cancelReminder(settings?.notificationIdentifier ?? null);
      await saveNotificationSettings(db, {
        notificationHour: settings?.notificationHour ?? 8,
        notificationIdentifier: null,
        notificationMinute: settings?.notificationMinute ?? 0,
        notificationsEnabled: false,
      });
      await loadSettings();
      Alert.alert('알림 해제', '예약된 매일 알림을 해제했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>설정</Text>
          <Text style={styles.subtitle}>알림과 묵상 기록을 관리합니다.</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>매일 알림</Text>
          <View style={styles.timeRow}>
            <TextInput
              keyboardType="number-pad"
              maxLength={2}
              onChangeText={setHourText}
              style={styles.timeInput}
              value={hourText}
            />
            <Text style={styles.colon}>:</Text>
            <TextInput
              keyboardType="number-pad"
              maxLength={2}
              onChangeText={setMinuteText}
              style={styles.timeInput}
              value={minuteText}
            />
          </View>
          <Text style={styles.helper}>
            현재 상태: {notificationsUnavailableInExpoGo ? 'Expo Go Android 미지원' : settings?.notificationsEnabled ? '예약됨' : '꺼짐'}
          </Text>
          {notificationsUnavailableInExpoGo ? (
            <Text style={styles.warningText}>
              Android Expo Go에서는 알림 모듈이 빠져 있습니다. 앱 기능 확인은 가능하지만 알림 테스트는 개발 빌드에서 진행하세요.
            </Text>
          ) : null}
          <View style={styles.actionRow}>
            <Pressable disabled={isSaving} onPress={handleSaveNotification} style={styles.primaryButton}>
              <Text style={styles.primaryText}>{isSaving ? '저장 중' : '알림 저장'}</Text>
            </Pressable>
            <Pressable disabled={isSaving} onPress={handleDisableNotification} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>알림 끄기</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>스트릭</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{streak?.current_count ?? 0}</Text>
              <Text style={styles.statLabel}>현재</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{streak?.longest_count ?? 0}</Text>
              <Text style={styles.statLabel}>최장</Text>
            </View>
          </View>
          <Text style={styles.helper}>
            마지막 완료일: {streak?.last_completed_date ?? '기록 없음'}
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>앱 정보</Text>
          <Text style={styles.infoText}>BibleFit MVP는 Expo SDK 57, React Native, TypeScript, expo-sqlite로 구성된 local-first 앱입니다.</Text>
          <Text style={styles.infoText}>말씀과 묵상 기록은 기기에 저장되며 외부 생성형 API를 호출하지 않습니다.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colon: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 34,
  },
  header: {
    gap: 6,
  },
  helper: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  infoText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '900',
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
  },
  stat: {
    backgroundColor: colors.cardAlt,
    borderRadius: 8,
    flex: 1,
    padding: 16,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statValue: {
    color: colors.primaryDark,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  timeInput: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    height: 64,
    textAlign: 'center',
    width: 82,
  },
  timeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  warningText: {
    backgroundColor: '#FFF2DA',
    borderRadius: 8,
    color: colors.warning,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    padding: 12,
  },
});
