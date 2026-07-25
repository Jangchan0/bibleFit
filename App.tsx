import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { migrateDbIfNeeded } from './src/db/migrations';
import { HomeScreen } from './src/screens/HomeScreen';
import { SavedScreen } from './src/screens/SavedScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { configureNotificationHandler } from './src/services/notifications';
import { colors } from './src/theme/colors';

export type RootTabParamList = {
  Home: undefined;
  Saved: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.loadingText}>BibleFit 준비 중</Text>
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
      <Tab.Screen name="Saved" component={SavedScreen} options={{ tabBarLabel: '보관함' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: '설정' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    void configureNotificationHandler();
  }, []);

  return (
    <SafeAreaProvider>
      <Suspense fallback={<LoadingScreen />}>
        <SQLiteProvider databaseName="biblefit.db" onInit={migrateDbIfNeeded} useSuspense>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Tabs />
          </NavigationContainer>
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
