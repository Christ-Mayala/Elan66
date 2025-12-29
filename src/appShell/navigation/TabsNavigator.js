import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../../features/habits/screens/HomeScreen';
import { NotesNavigator } from '../../features/notes/navigation/NotesNavigator';
import { StatsScreen } from '../../features/stats/screens/StatsScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { theme } from '../../core/theme/theme';

const Tab = createBottomTabNavigator();

const iconByRoute = {
  Home: 'leaf',
  Notes: 'book',
  Stats: 'stats-chart',
  Settings: 'settings',
};

export function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', paddingBottom: 2 },
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
        tabBarIcon: ({ color, size }) => {
          const name = iconByRoute[route.name] || 'ellipse';
          return <Ionicons name={name} size={Math.max(18, size)} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Habitudes' }} />
      <Tab.Screen name="Notes" component={NotesNavigator} options={{ title: 'Journal' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Réglages' }} />
    </Tab.Navigator>
  );
}
