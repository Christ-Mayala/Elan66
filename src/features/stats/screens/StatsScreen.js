import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { theme } from '../../../core/theme/theme';
import { getGlobalStats } from '../data/statsRepo';
import { GiantTree } from '../components/GiantTree';
import { useHabits } from '../../habits/context/HabitsContext';
import { clamp, dayIndexFromStart, phaseProgress, toLocalDateId } from '../../../core/utils/dateUtils';
import { PlantProgress } from '../../habits/components/PlantProgress';

const pct = (n) => `${Math.round(n * 100)}%`;
const clamp01 = (n) => Math.max(0, Math.min(1, n));

export function StatsScreen() {
  const { state } = useHabits();
  const isFocused = useIsFocused();

  const [stats, setStats] = useState(null);

  const refresh = async () => {
    const s = await getGlobalStats();
    setStats(s);
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

  const habits = useMemo(() => {
    return (state.habits || []).map((h) => {
      const dayIndex = clamp(dayIndexFromStart(h.start_date, today), 1, Number(h.duration_days));
      const phase = phaseProgress(dayIndex).phase;
      return { ...h, dayIndex, phase };
    });
  }, [state.habits, today]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 110 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text variant="title">Statistiques</Text>
          <Text variant="mono">Croissance: {pct(growth)}</Text>
        </View>

        <Card>
          <Text variant="subtitle">Ton arbre</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Plus tu valides de jours, plus l’arbre prend forme. À 100%, il devient un arbre géant.
          </Text>
          <View style={{ marginTop: 12 }}>
            <GiantTree progress={growth} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Taux de réussite</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            (✅ + ⚠️) / (✅ + ⚠️ + ❌) — hors habitudes archivées
          </Text>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 44, fontWeight: '800', color: theme.colors.text }}>{pct(rate)}</Text>
            <View
              style={{
                marginTop: 10,
                height: 10,
                borderRadius: 99,
                backgroundColor: 'rgba(15,26,51,0.70)',
                borderWidth: 1,
                borderColor: theme.colors.border,
                overflow: 'hidden',
              }}
            >
              <View style={{ height: '100%', width: pct(rate), backgroundColor: theme.colors.accent }} />
            </View>
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Résumé</Text>
          <View style={{ marginTop: 10, gap: 6 }}>
            <Text>Habitudes actives/terminées : {stats?.habitsActive ?? '—'}</Text>
            <Text>Habitudes archivées : {stats?.habitsArchived ?? '—'}</Text>
            <Text>Jours validés : {stats?.totalValidated ?? '—'} / {stats?.totalDaysPlanned ?? '—'}</Text>
            <Text>✅ {stats?.success ?? '—'} · ⚠️ {stats?.resisted ?? '—'} · ❌ {stats?.fail ?? '—'}</Text>
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
                <View key={h.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="subtitle" numberOfLines={1}>{h.name}</Text>
                    <Text variant="muted" style={{ marginTop: 2 }}>Phase {h.phase} · Jour {h.dayIndex}/{h.duration_days}</Text>
                  </View>
                  <View style={{ width: 160 }}>
                    <PlantProgress dayIndex={h.dayIndex} durationDays={Number(h.duration_days)} size="m" />
                  </View>
                </View>
              ))
            )}
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Vies sauvées</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Jours où le bouton SOS a été utilisé (1/jour/habitude).
          </Text>
          <Text style={{ marginTop: 12, fontSize: 44, fontWeight: '800', color: theme.colors.text }}>{stats?.savedLives ?? 0}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}
