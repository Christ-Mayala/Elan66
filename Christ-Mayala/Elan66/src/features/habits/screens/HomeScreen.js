import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Button } from '../../../core/ui/Button';
import { Card } from '../../../core/ui/Card';
import { useHabits } from '../context/HabitsContext';
import { theme } from '../../../core/theme/theme';
import { clamp, dayIndexFromStart, phaseProgress, toLocalDateId } from '../../../core/utils/dateUtils';
import { SOSModal } from '../components/SOSModal';
import { RouteProgress } from '../components/RouteProgress';
import { domainErrorMessageFr } from '../../../core/utils/domainErrors';

export function HomeScreen({ navigation }) {
  const { state, refreshHabits, recordSosToday, getSosEligibility } = useHabits();

  const [sosVisible, setSosVisible] = useState(false);
  const [sosHabit, setSosHabit] = useState(null);
  const [sosAlready, setSosAlready] = useState(false);
  const [sosPhase, setSosPhase] = useState(1);

  const today = toLocalDateId(new Date());

  const items = useMemo(() => {
    return state.habits.map((h) => {
      const dayIndex = clamp(dayIndexFromStart(h.start_date, today), 1, Number(h.duration_days));
      const progress = dayIndex / Number(h.duration_days);
      const phase = phaseProgress(dayIndex).phase;
      return { ...h, dayIndex, progress, phase };
    });
  }, [state.habits, today]);

  const openSos = async (habit) => {
    try {
      const res = await getSosEligibility({ habitId: habit.id, dateId: today });
      setSosHabit(habit);
      setSosAlready(Boolean(res.already));
      const d = clamp(dayIndexFromStart(habit.start_date, today), 1, Number(habit.duration_days));
      setSosPhase(phaseProgress(d).phase);
      setSosVisible(true);
    } catch (e) {
      Alert.alert('Impossible', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const onSosCount = async () => {
    if (!sosHabit) return;
    try {
      const res = await recordSosToday({ habitId: sosHabit.id, dateId: today });
      if (res.didCount) setSosAlready(true);
    } catch (e) {
      Alert.alert('Impossible', domainErrorMessageFr(String(e.message || e)));
    }
  };

  return (
    <Screen>
      <View style={{ gap: 12, marginBottom: 12 }}>
        <Text variant="title">Habitudes</Text>
        <Text variant="muted">Hors-ligne. Privé. 66 jours, découpés en 3 phases.</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Button title="Créer" onPress={() => navigation.navigate('CreateHabit')} />
          </View>
          <View style={{ width: 120 }}>
            <Button title="Rafraîchir" variant="ghost" onPress={refreshHabits} />
          </View>
        </View>

        {items.length === 1 ? (
          <Button title="SOS rapide" variant="ghost" onPress={() => openSos(items[0])} />
        ) : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        ListEmptyComponent={
          <Card>
            <Text variant="subtitle">Aucune habitude</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Crée ta première habitude. Aucun compte. Tes données restent sur ton téléphone.
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">{item.name}</Text>
                  <Text variant="muted" numberOfLines={2} style={{ marginTop: 4 }}>
                    {item.description || item.replacement || '—'}
                  </Text>

                  <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        openSos(item);
                      }}
                      style={styles.sosPill}
                    >
                      <Text style={{ fontWeight: '800' }}>SOS</Text>
                      <Text variant="muted">3 min</Text>
                    </Pressable>
                    <Text variant="mono">Phase {item.phase}</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end', width: 130 }}>
                  <Text variant="mono">
                    {item.dayIndex}/{item.duration_days}
                  </Text>
                  <View style={{ width: '100%', marginTop: 8 }}>
                    <RouteProgress dayIndex={item.dayIndex} durationDays={Number(item.duration_days)} />
                  </View>
                </View>
              </View>
            </Card>
          </Pressable>
        )}
      />

      <SOSModal
        visible={sosVisible}
        habit={sosHabit}
        phase={sosPhase}
        alreadyCounted={sosAlready}
        onCount={onSosCount}
        onClose={() => setSosVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressOuter: {
    marginTop: 8,
    height: 6,
    width: 90,
    borderRadius: 99,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  sosPill: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
  },
});
