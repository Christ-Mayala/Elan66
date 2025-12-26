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
  primary: { backgroundColor: theme.colors.accent },
  primaryText: { color: theme.colors.black },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghostText: { color: theme.colors.text },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.45 },
});
