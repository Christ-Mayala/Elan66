import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';

export function Segmented({ value, options, onChange }) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange?.(o.value)} style={[styles.item, active ? styles.itemOn : null]}>
            <Text variant="mono" style={{ color: active ? theme.colors.black : theme.colors.textMuted }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(15,26,51,0.55)',
    borderRadius: 16,
    padding: 6,
  },
  item: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemOn: {
    backgroundColor: theme.colors.accent,
  },
});
