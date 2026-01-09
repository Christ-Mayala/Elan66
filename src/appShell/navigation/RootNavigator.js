import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { TabsNavigator } from './TabsNavigator';
import { CreateHabitScreen } from '../../features/habits/screens/CreateHabitScreen';
import { HabitDetailScreen } from '../../features/habits/screens/HabitDetailScreen';
import { ArchivedHabitsScreen } from '../../features/habits/screens/ArchivedHabitsScreen';
import { StartScreen } from '../../features/onboarding/screens/StartScreen';
import { getSetting, setSetting, SettingsKeys } from '../../core/db/settingsRepo';
import { theme } from '../../core/theme/theme';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await getSetting(SettingsKeys.onboardingDone);
      setOnboarded(Boolean(v));
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
  }

  const onDone = async () => {
    await setSetting(SettingsKeys.onboardingDone, true);
    setOnboarded(true);
  };

  return (
    <Stack.Navigator
      initialRouteName={onboarded ? 'Tabs' : 'Start'}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="Start" options={{ headerShown: false }}>
        {(props) => <StartScreen {...props} onDone={onDone} />}
      </Stack.Screen>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ title: 'Nouvelle habitude' }} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Détail' }} />
      <Stack.Screen name="ArchivedHabits" component={ArchivedHabitsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
