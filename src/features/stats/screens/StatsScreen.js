import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { theme } from '../../../core/theme/theme';
import { getGlobalStats } from '../data/statsRepo';

const pct = (n) => `${Math.round(n * 100)}%`;

export function StatsScreen() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const s = await getGlobalStats();
      setStats(s);
    })();
  }, []);

  const rate = useMemo(() => (stats ? stats.successRate : 0), [stats]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 110 }}>
        <Text variant="title">Statistiques</Text>

        <Card>
          <Text variant="subtitle">Taux de réussite</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            (✅ + ⚠️) / (✅ + ⚠️ + ❌) — hors habitudes archivées
          </Text>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 44, fontWeight: '800' }}>{pct(rate)}</Text>
            <View
              style={{
                marginTop: 10,
                height: 8,
                borderRadius: 99,
                backgroundColor: theme.colors.surface2,
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
            <Text>Jours validés : {stats?.totalValidated ?? '—'}</Text>
            <Text>✅ {stats?.success ?? '—'} · ⚠️ {stats?.resisted ?? '—'} · ❌ {stats?.fail ?? '—'}</Text>
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Vies sauvées</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Jours où le bouton SOS a été utilisé (1/jour/habitude).
          </Text>
          <Text style={{ marginTop: 12, fontSize: 44, fontWeight: '800' }}>{stats?.savedLives ?? 0}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}
