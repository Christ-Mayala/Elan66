import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';
import { theme } from '../theme/theme';

export function Chip({ label, selected, onPress, right }) {
  return (
    <Pressable onPress={onPress} style={[styles.base, selected ? styles.on : null]}>
      <Text variant="mono" style={{ color: selected ? theme.colors.black : theme.colors.textMuted }}>
        {label}
      </Text>
      {right ? right : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(15,26,51,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  on: {
    backgroundColor: theme.colors.accent,
    borderColor: 'rgba(255,255,255,0.10)',
  },
});
