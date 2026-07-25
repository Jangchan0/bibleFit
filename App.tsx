import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { openDatabaseAsync, SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureDbConnection, migrateDbIfNeeded } from './src/db/migrations';
import { HomeScreen } from './src/screens/HomeScreen';
import { MeditationScreen } from './src/screens/MeditationScreen';
import { SavedScreen } from './src/screens/SavedScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { configureNotificationHandler } from './src/services/notifications';
import { colors } from './src/theme/colors';

export type RootTabParamList = {
  Home: undefined;
  Meditation: undefined;
  Saved: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

type BootState =
  | {
      status: 'loading';
    }
  | {
      status: 'ready';
    }
  | {
      message: string;
      status: 'error';
    };

function LoadingScreen({ detail = 'BibleFit 준비 중' }: { detail?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.loadingText}>{detail}</Text>
    </View>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.error}>
      <Text style={styles.errorTitle}>앱 초기화에 실패했습니다.</Text>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>다시 시도</Text>
      </Pressable>
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '오늘' }} />
      <Tab.Screen name="Meditation" component={MeditationScreen} options={{ tabBarLabel: '묵상' }} />
      <Tab.Screen name="Saved" component={SavedScreen} options={{ tabBarLabel: '보관함' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: '설정' }} />
    </Tab.Navigator>
  );
}

function AppBootGate() {
  const [bootState, setBootState] = useState<BootState>({ status: 'loading' });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function boot() {
      console.info('[BibleFit] App boot started');
      let db: Awaited<ReturnType<typeof openDatabaseAsync>> | null = null;

      try {
        db = await openDatabaseAsync('biblefit.db');
        console.info('[BibleFit] SQLite database opened');

        await migrateDbIfNeeded(db);
        console.info('[BibleFit] App database ready');

        await configureNotificationHandler().catch((error: unknown) => {
          console.warn('[BibleFit] Notification handler skipped', error);
        });

        if (isMounted) {
          setBootState({ status: 'ready' });
        }
      } catch (error) {
        console.error('[BibleFit] App boot failed', error);

        if (isMounted) {
          setBootState({
            message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
            status: 'error',
          });
        }
      } finally {
        if (db) {
          await db.closeAsync().catch((error: unknown) => {
            console.warn('[BibleFit] SQLite close skipped', error);
          });
        }
      }
    }

    setBootState({ status: 'loading' });
    void boot();

    return () => {
      isMounted = false;
    };
  }, [retryKey]);

  if (bootState.status === 'loading') {
    return <LoadingScreen detail="로컬 DB 초기화 중" />;
  }

  if (bootState.status === 'error') {
    return <ErrorScreen message={bootState.message} onRetry={() => setRetryKey((current) => current + 1)} />;
  }

  return (
    <SQLiteProvider databaseName="biblefit.db" onInit={configureDbConnection}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tabs />
      </NavigationContainer>
    </SQLiteProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppBootGate />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  error: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 140,
    paddingHorizontal: 18,
  },
  retryText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '900',
  },
  tabBar: {
    borderTopColor: colors.border,
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
