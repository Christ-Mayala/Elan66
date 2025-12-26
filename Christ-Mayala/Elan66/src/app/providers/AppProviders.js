import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { RootNavigator } from '../navigation/RootNavigator';
import { theme } from '../../core/theme/theme';
import { HabitsProvider } from '../../features/habits/context/HabitsContext';

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
    <HabitsProvider>
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </HabitsProvider>
  );
}
