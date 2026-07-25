import Constants from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

export function areNotificationsUnavailableInExpoGo() {
  return Platform.OS === 'android' && Constants.appOwnership === 'expo';
}

export async function configureNotificationHandler() {
  if (areNotificationsUnavailableInExpoGo()) {
    return;
  }

  const Notifications = await loadNotificationsModule();

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
  if (!identifier || areNotificationsUnavailableInExpoGo()) {
    return;
  }

  const Notifications = await loadNotificationsModule();
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function scheduleDailyReminder(existingIdentifier: string | null, hour: number, minute: number) {
  if (areNotificationsUnavailableInExpoGo()) {
    return {
      granted: false,
      identifier: null,
      reason: 'expo-go-android' as const,
    };
  }

  const Notifications = await loadNotificationsModule();
  await ensureNotificationChannel(Notifications);

  const permission = await ensureNotificationPermission(Notifications);

  if (!permission) {
    return {
      granted: false,
      identifier: null,
      reason: 'permission-denied' as const,
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
    reason: 'scheduled' as const,
  };
}

async function loadNotificationsModule(): Promise<NotificationsModule> {
  return import('expo-notifications');
}

async function ensureNotificationPermission(Notifications: NotificationsModule) {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureNotificationChannel(Notifications: NotificationsModule) {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('daily-reminder', {
    importance: Notifications.AndroidImportance.DEFAULT,
    name: 'Daily BibleFit reminder',
  });
}
