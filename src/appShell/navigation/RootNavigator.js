import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabsNavigator } from './TabsNavigator';
import { CreateHabitScreen } from '../../features/habits/screens/CreateHabitScreen';
import { HabitDetailScreen } from '../../features/habits/screens/HabitDetailScreen';
import { theme } from '../../core/theme/theme';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ title: 'Nouvelle habitude' }} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Détail' }} />
    </Stack.Navigator>
  );
}
