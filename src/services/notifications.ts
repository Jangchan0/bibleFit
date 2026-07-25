import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function cancelReminder(identifier: string | null) {
  if (!identifier) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function scheduleDailyReminder(existingIdentifier: string | null, hour: number, minute: number) {
  await ensureNotificationChannel();

  const permission = await ensureNotificationPermission();

  if (!permission) {
    return {
      granted: false,
      identifier: null,
    };
  }

  await cancelReminder(existingIdentifier);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      body: '1분 묵상으로 오늘의 말씀을 붙잡아보세요.',
      data: { screen: 'Home' },
      title: '오늘의 말씀',
    },
    trigger: {
      hour,
      minute,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });

  return {
    granted: true,
    identifier,
  };
}

async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('daily-reminder', {
    importance: Notifications.AndroidImportance.DEFAULT,
    name: 'Daily BibleFit reminder',
  });
}
