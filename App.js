import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from './src/appShell/providers/AppProviders';
import { configureNotifications, requestNotifPermissions } from './src/core/services/notifications';
import { installDevBooleanPropsGuard } from './src/core/utils/devBooleanPropsGuard';

installDevBooleanPropsGuard();

export default function App() {
  useEffect(() => {
    (async () => {
      await configureNotifications();
      await requestNotifPermissions();
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppProviders />
    </GestureHandlerRootView>
  );
}
