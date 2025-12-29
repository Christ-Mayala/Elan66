import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { theme } from '../../../core/theme/theme';
import { getDailyActivity, getGlobalStats } from '../data/statsRepo';
import { GiantTree } from '../components/GiantTree';
import { Heatmap } from '../components/Heatmap';
import { useHabits } from '../../habits/context/HabitsContext';
import { addDaysLocal, clamp, dayIndexFromStart, diffDaysLocal, phaseProgress, toLocalDateId } from '../../../core/utils/dateUtils';
import { PlantProgress } from '../../habits/components/PlantProgress';

const pct = (n) => `${Math.round(n * 100)}%`;
const clamp01 = (n) => Math.max(0, Math.min(1, n));

export function StatsScreen() {
  const { state } = useHabits();
  const isFocused = useIsFocused();

  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);

  const windowDays = 84;

  const refresh = async () => {
    const s = await getGlobalStats();
    setStats(s);

    const since = addDaysLocal(toLocalDateId(new Date()), -(windowDays - 1));
    const rows = await getDailyActivity({ sinceDateId: since });
    setDaily(rows);
  };

  useEffect(() => {
    if (!isFocused) return;
    refresh();
  }, [isFocused]);

  const rate = useMemo(() => (stats ? stats.successRate : 0), [stats]);
  const growth = useMemo(() => {
    const total = Number(stats?.totalDaysPlanned || 0);
    const validated = Number(stats?.totalValidated || 0);
    if (!total) return 0;
    return clamp01(validated / total);
  }, [stats]);

  const today = toLocalDateId(new Date());

  const streaks = useMemo(() => {
    const set = new Set();
    const ids = [];
    for (const d of daily || []) {
      const v = Number(d?.total_validated || 0);
      if (v > 0 && d?.date) {
        const id = String(d.date);
        set.add(id);
        ids.push(id);
      }
    }

    let current = 0;
    for (let i = 0; i < 500; i++) {
      const id = addDaysLocal(today, -i);
      if (!set.has(id)) break;
      current += 1;
    }

    ids.sort();
    let best = 0;
    let run = 0;
    let prev = null;
    for (const id of ids) {
      if (!prev) {
        run = 1;
        best = Math.max(best, run);
        prev = id;
        continue;
      }
      const gap = diffDaysLocal(prev, id);
      if (gap === 1) {
        run += 1;
      } else {
        run = 1;
      }
      best = Math.max(best, run);
      prev = id;
    }

    return { current, best };
  }, [daily, today]);

  const habits = useMemo(() => {
    return (state.habits || []).map((h) => {
      const dayIndex = clamp(dayIndexFromStart(h.start_date, today), 1, Number(h.duration_days));
      const phase = phaseProgress(dayIndex).phase;
      return { ...h, dayIndex, phase };
    });
  }, [state.habits, today]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text variant="muted">Progression</Text>
            <Text variant="display">Statistiques</Text>
          </View>
          <Pressable onPress={refresh} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name="refresh" size={18} color={theme.colors.text} />
          </Pressable>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroInner}>
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">Arbre d’évolution</Text>
              <Text variant="muted" style={{ marginTop: 6 }}>
                À mesure que tu valides, l’arbre grandit et se densifie.
              </Text>

              <View style={{ marginTop: 14, flexDirection: 'row', gap: 10 }}>
                <View style={styles.badge}>
                  <Text variant="mono">Croissance {pct(growth)}</Text>
                </View>
                <View style={styles.badge}>
                  <Text variant="mono">Taux {pct(rate)}</Text>
                </View>
              </View>
            </View>

            <View style={{ width: 160, alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={styles.bigNumber}>{streaks.current}</Text>
              <Text variant="muted">streak actuel</Text>
            </View>
          </View>

          <View style={{ marginTop: 14 }}>
            <GiantTree progress={growth} />
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card style={{ flex: 1, padding: 0 }}>
            <View style={styles.statCard}>
              <View style={styles.statTop}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(34,211,238,0.14)' }]}>
                  <Ionicons name="flame" size={18} color={theme.colors.accent2} />
                </View>
                <Text variant="muted">Streak actuel</Text>
              </View>
              <Text style={styles.statValue}>{streaks.current}</Text>
              <Text variant="muted">jours</Text>
            </View>
          </Card>

          <Card style={{ flex: 1, padding: 0 }}>
            <View style={styles.statCard}>
              <View style={styles.statTop}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(139,92,246,0.14)' }]}>
                  <Ionicons name="trophy" size={18} color={theme.colors.accent} />
                </View>
                <Text variant="muted">Meilleur streak</Text>
              </View>
              <Text style={styles.statValue}>{streaks.best}</Text>
              <Text variant="muted">jours</Text>
            </View>
          </Card>
        </View>

        <Card>
          <View style={styles.sectionRow}>
            <Text variant="subtitle">Activité</Text>
            <Text variant="mono">{windowDays} jours</Text>
          </View>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Validations par jour (toutes habitudes). Appuie sur un jour.
          </Text>
          <View style={{ marginTop: 12 }}>
            <Heatmap days={daily} windowDays={windowDays} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Résumé</Text>
          <View style={{ marginTop: 12, gap: 8 }}>
            <View style={styles.rowItem}>
              <Text variant="muted">Habitudes actives / terminées</Text>
              <Text>{stats?.habitsActive ?? '—'}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text variant="muted">Habitudes archivées</Text>
              <Text>{stats?.habitsArchived ?? '—'}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text variant="muted">Jours validés</Text>
              <Text>
                {stats?.totalValidated ?? '—'} / {stats?.totalDaysPlanned ?? '—'}
              </Text>
            </View>
            <View style={styles.rowItem}>
              <Text variant="muted">Détail</Text>
              <Text>
                ✅ {stats?.success ?? '—'} · ⚠️ {stats?.resisted ?? '—'} · ❌ {stats?.fail ?? '—'}
              </Text>
            </View>
            <View style={styles.rowItem}>
              <Text variant="muted">SOS (vies sauvées)</Text>
              <Text>{stats?.savedLives ?? 0}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Par habitude</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Progression actuelle (jour du défi).
          </Text>
          <View style={{ marginTop: 12, gap: 12 }}>
            {habits.length === 0 ? (
              <Text variant="muted">—</Text>
            ) : (
              habits.map((h) => (
                <View key={h.id} style={styles.habitRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="subtitle" numberOfLines={1}>
                      {h.name}
                    </Text>
                    <Text variant="muted" style={{ marginTop: 2 }}>
                      Phase {h.phase} · Jour {h.dayIndex}/{h.duration_days}
                    </Text>
                  </View>
                  <View style={{ width: 160 }}>
                    <PlantProgress dayIndex={h.dayIndex} durationDays={Number(h.duration_days)} size="m" />
                  </View>
                </View>
              ))
            )}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroCard: { padding: 0, overflow: 'hidden' },
  heroInner: {
    padding: theme.spacing.m,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  bigNumber: { fontSize: 44, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.6 },
  statCard: { padding: theme.spacing.m },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: { marginTop: 10, fontSize: 44, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.6 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    padding: 14,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
  },
});
