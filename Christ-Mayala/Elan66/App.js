import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from './src/app/providers/AppProviders';
import { configureNotifications, requestNotifPermissions } from './src/core/services/notifications';

export default function App() {
  useEffect(() => {
    (async () => {
      await configureNotifications();
      await requestNotifPermissions();
    })();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppProviders />
    </>
  );
}
