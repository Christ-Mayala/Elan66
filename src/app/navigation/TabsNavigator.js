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
  Diary: 'book',
  Notes: 'book',
  Stats: 'stats-chart',
  Settings: 'settings',
};

export function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', paddingBottom: 2 },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 66,
          paddingTop: 8,
          paddingBottom: 10,
          borderRadius: 22,
          borderTopWidth: 0,
          backgroundColor: 'rgba(11,18,32,0.92)',
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
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
