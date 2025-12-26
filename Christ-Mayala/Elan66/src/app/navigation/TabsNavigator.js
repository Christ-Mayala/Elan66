import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../../features/habits/screens/HomeScreen';
import { DiaryScreen } from '../../features/diary/screens/DiaryScreen';
import { StatsScreen } from '../../features/stats/screens/StatsScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { theme } from '../../core/theme/theme';

const Tab = createBottomTabNavigator();

export function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface2,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Habitudes' }} />
      <Tab.Screen name="Diary" component={DiaryScreen} options={{ title: 'Journal' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Réglages' }} />
    </Tab.Navigator>
  );
}
