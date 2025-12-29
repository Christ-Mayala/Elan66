import React, { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';
import { addDaysLocal, toLocalDateId } from '../../../core/utils/dateUtils';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const levelFor = (day) => {
  if (!day) return 0;
  const v = Number(day.total_validated || 0);
  if (v <= 0) return 0;
  if (v === 1) return 1;
  if (v === 2) return 2;
  return 3;
};

const colorFor = (lvl) => {
  switch (lvl) {
    case 1:
      return 'rgba(34,211,238,0.18)';
    case 2:
      return 'rgba(34,211,238,0.34)';
    case 3:
      return 'rgba(34,211,238,0.60)';
    default:
      return 'rgba(15,26,51,0.70)';
  }
};

export function Heatmap({ days = [], windowDays = 84 }) {
  const map = useMemo(() => {
    const m = new Map();
    for (const d of days || []) {
      if (d?.date) m.set(String(d.date), d);
    }
    return m;
  }, [days]);

  const grid = useMemo(() => {
    const today = new Date();
    const endId = toLocalDateId(today);

    const ids = [];
    for (let i = windowDays - 1; i >= 0; i--) {
      ids.push(addDaysLocal(endId, -i));
    }

    const cols = [];
    for (let i = 0; i < ids.length; i += 7) {
      cols.push(ids.slice(i, i + 7));
    }

    return cols;
  }, [windowDays]);

  const onPressDay = (dateId) => {
    const d = map.get(dateId);
    const v = Number(d?.total_validated || 0);
    const s = Number(d?.success || 0);
    const r = Number(d?.resisted || 0);
    const f = Number(d?.fail || 0);
    Alert.alert(dateId, v ? `Validés: ${v}\n✅ ${s} · ⚠️ ${r} · ❌ ${f}` : 'Aucune validation');
  };

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.legendRow}>
        <Text variant="muted">Moins</Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {[0, 1, 2, 3].map((lvl) => (
            <View key={lvl} style={[styles.cell, { backgroundColor: colorFor(lvl), borderColor: theme.colors.border }]} />
          ))}
        </View>
        <Text variant="muted">Plus</Text>
      </View>

      <View style={styles.grid}>
        {grid.map((col, ci) => (
          <View key={String(ci)} style={{ gap: 6 }}>
            {col.map((dateId) => {
              const d = map.get(dateId);
              const lvl = levelFor(d);
              return (
                <Pressable
                  key={dateId}
                  onPress={() => onPressDay(dateId)}
                  style={[styles.cell, { backgroundColor: colorFor(lvl), borderColor: theme.colors.border }]}
                />
              );
            })}
          </View>
        ))}
      </View>

      <Text variant="muted" style={{ marginTop: 2 }}>
        Fenêtre: {clamp(windowDays, 14, 365)} jours
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 6 },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
