import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { RootNavigator } from '../navigation/RootNavigator';
import { theme } from '../../core/theme/theme';
import { HabitsProvider } from '../../features/habits/context/HabitsContext';

enableScreens(true);

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.bg,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.accent,
  },
};

export function AppProviders() {
  return (
    <SafeAreaProvider>
      <HabitsProvider>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </HabitsProvider>
    </SafeAreaProvider>
  );
}
