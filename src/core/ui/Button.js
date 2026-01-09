import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { Text } from './Text';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
  textStyle,
  icon,
  iconSize,
  size = 'md',
  gradient,
  gradientColors,
}) {
  const isGhost = variant === 'ghost';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger' || variant === 'destructive';

  const colors = useMemo(() => {
    const bg = isDanger ? theme.colors.danger : theme.colors.accent;
    const fg = isDanger ? theme.colors.danger : theme.colors.text;
    return { bg, fg };
  }, [isDanger]);

  const useGradient = Boolean(gradient);
  const grad = useMemo(() => {
    const def = [theme.colors.accent, theme.colors.accent2];
    const c = Array.isArray(gradientColors) && gradientColors.length >= 2 ? gradientColors : def;
    return c;
  }, [gradientColors]);

  const textColor = disabled
    ? theme.colors.textMuted
    : isGhost || isOutline
      ? isDanger
        ? theme.colors.danger
        : theme.colors.text
      : theme.colors.white;

  const iconColor = textColor;

  const pad = size === 'large' ? styles.padLg : styles.padMd;
  const radius = size === 'large' ? styles.radiusLg : styles.radiusMd;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        pad,
        radius,
        isGhost || isOutline ? styles.outline : styles.primary,
        isDanger ? styles.danger : null,
        useGradient ? styles.gradientBase : null,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      {useGradient ? (
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View style={styles.content}>
        {icon ? <Ionicons name={icon} size={iconSize || (size === 'large' ? 20 : 18)} color={iconColor} /> : null}
        <Text
          variant="subtitle"
          style={[
            styles.text,
            {
              color: textColor,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  padMd: { paddingVertical: 13, paddingHorizontal: 16 },
  padLg: { minHeight: 54, paddingVertical: 14, paddingHorizontal: 18 },
  radiusMd: { borderRadius: theme.radius.l },
  radiusLg: { borderRadius: theme.radius.l },
  primary: {
    backgroundColor: theme.colors.accent,
    ...theme.shadow.card,
  },
  outline: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: theme.colors.danger,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  gradientBase: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.10)',
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  text: { textAlign: 'center' },
});
