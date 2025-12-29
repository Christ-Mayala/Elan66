import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export function Fab({ onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.fab, style]}>
      <Ionicons name="add" size={26} color={theme.colors.black} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
});
