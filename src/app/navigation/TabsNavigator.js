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
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          position: 'absolute',
          left: theme.spacing.l,
          right: theme.spacing.l,
          bottom: 14,
          height: 70,
          paddingTop: 10,
          paddingBottom: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...theme.shadow.floating,
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
