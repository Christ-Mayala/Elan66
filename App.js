import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from './src/appShell/providers/AppProviders';
import { configureNotifications, requestNotifPermissions, syncQuoteNotifications } from './src/core/services/notifications';
import { installDevBooleanPropsGuard } from './src/core/utils/devBooleanPropsGuard';
import { isExpoGo } from './src/core/utils/runtime';

installDevBooleanPropsGuard();

export default function App() {
  useEffect(() => {
    if (isExpoGo()) return;
    (async () => {
      try {
        await configureNotifications();
        const p = await requestNotifPermissions();
        const granted = Boolean(p?.granted || p?.ios?.status);
        if (granted) {
          await syncQuoteNotifications();
        }
      } catch {}
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppProviders />
    </GestureHandlerRootView>
  );
}
