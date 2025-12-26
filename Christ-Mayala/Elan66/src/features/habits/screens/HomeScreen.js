import React, { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Button } from '../../../core/ui/Button';
import { Card } from '../../../core/ui/Card';
import { useHabits } from '../context/HabitsContext';
import { theme } from '../../../core/theme/theme';
import { toLocalDateId, dayIndexFromStart, clamp } from '../../../core/utils/dateUtils';

export function HomeScreen({ navigation }) {
  const { state, refreshHabits } = useHabits();

  const today = toLocalDateId(new Date());

  const items = useMemo(() => {
    return state.habits.map((h) => {
      const dayIndex = clamp(dayIndexFromStart(h.start_date, today), 1, Number(h.duration_days));
      const progress = dayIndex / Number(h.duration_days);
      return { ...h, dayIndex, progress };
    });
  }, [state.habits, today]);

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
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="mono">{item.dayIndex}/{item.duration_days}</Text>
                  <View
                    style={{
                      marginTop: 8,
                      height: 6,
                      width: 90,
                      borderRadius: 99,
                      backgroundColor: theme.colors.surface2,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${Math.round(item.progress * 100)}%`,
                        backgroundColor: theme.colors.accent,
                      }}
                    />
                  </View>
                </View>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}
