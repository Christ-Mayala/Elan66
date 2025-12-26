import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';
import { DayState } from '../../../core/utils/constants';

const stateDotColor = (state) => {
  switch (state) {
    case DayState.success:
      return theme.colors.accent;
    case DayState.resisted:
      return theme.colors.warn;
    case DayState.fail:
      return theme.colors.danger;
    default:
      return 'transparent';
  }
};

export function DayPickerStrip({ durationDays, selectedDayIndex, logs, onSelect }) {
  const scrollRef = useRef(null);

  const map = useMemo(() => {
    const m = new Map();
    for (const l of logs || []) {
      if (l?.day_index != null) m.set(Number(l.day_index), l.state || null);
    }
    return m;
  }, [logs]);

  useEffect(() => {
    const i = Math.max(1, Number(selectedDayIndex) || 1);
    const x = Math.max(0, (i - 1) * 42 - 120);
    scrollRef.current?.scrollTo({ x, animated: true });
  }, [selectedDayIndex]);

  const days = Array.from({ length: Number(durationDays) || 66 }, (_, idx) => idx + 1);

  return (
    <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((d) => {
        const isSel = d === selectedDayIndex;
        const st = map.get(d);
        return (
          <Pressable
            key={String(d)}
            onPress={() => onSelect(d)}
            style={[styles.cell, isSel ? styles.cellSel : null]}
          >
            <Text variant="mono" style={{ color: isSel ? theme.colors.text : theme.colors.textMuted }}>
              {d}
            </Text>
            <View style={[styles.dot, { backgroundColor: stateDotColor(st), borderColor: st ? 'transparent' : theme.colors.border }]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 8 },
  cell: {
    width: 42,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
  },
  cellSel: {
    borderColor: 'rgba(255,255,255,0.30)',
    backgroundColor: theme.colors.surface,
  },
  dot: {
    marginTop: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
});
