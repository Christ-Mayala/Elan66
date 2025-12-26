import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { Text } from './Text';

export function Button({ title, onPress, variant = 'primary', disabled }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'ghost' ? styles.ghost : styles.primary,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text variant="subtitle" style={variant === 'ghost' ? styles.ghostText : styles.primaryText}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.m,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  primaryText: { color: theme.colors.black },
  ghost: {
    backgroundColor: 'rgba(15,26,51,0.55)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghostText: { color: theme.colors.text },
  pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
});
