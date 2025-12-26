import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../../core/theme/theme';
import { DayState } from '../../../core/utils/constants';

const stateColor = (state) => {
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

export function HabitTimeline({ durationDays = 66, logs = [] }) {
  const map = useMemo(() => {
    const m = new Map();
    for (const l of logs) {
      if (typeof l.day_index === 'number' || typeof l.day_index === 'string') {
        m.set(Number(l.day_index), l.state || null);
      }
    }
    return m;
  }, [logs]);

  const days = Array.from({ length: durationDays }, (_, i) => i + 1);

  return (
    <View style={styles.wrap}>
      {days.map((d) => {
        const state = map.get(d);
        const sep = d === 23 || d === 45;
        return (
          <View key={String(d)} style={[styles.cellOuter, sep ? styles.sep : null]}>
            <View style={[styles.cell, { backgroundColor: stateColor(state) }]} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cellOuter: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    overflow: 'hidden',
  },
  cell: {
    width: '100%',
    height: '100%',
  },
  sep: {
    borderColor: 'rgba(255,255,255,0.22)',
  },
});
