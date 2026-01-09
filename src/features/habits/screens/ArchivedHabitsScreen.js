import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Enter } from '../../../core/ui/Enter';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { theme } from '../../../core/theme/theme';
import { HabitStatus } from '../../../core/utils/constants';
import { listHabitsWithSummary } from '../data/habitsRepo';
import { useHabits } from '../context/HabitsContext';

export function ArchivedHabitsScreen({ navigation }) {
  const { remove } = useHabits();
  const [items, setItems] = useState([]);

  const refresh = async () => {
    const rows = await listHabitsWithSummary({ includeArchived: true });
    setItems(rows || []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const archived = useMemo(() => items.filter((h) => h.status === HabitStatus.archived), [items]);

  return (
    <Screen>
      <Enter style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={10}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text variant="muted">Gestion</Text>
              <Text variant="display">Archives</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="archive" size={16} color={theme.colors.textMuted} />
              <Text variant="mono">{archived.length}</Text>
            </View>
          </View>

          <Card>
            <Text variant="subtitle">Habitudes archivées</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Elles ne comptent plus dans tes stats, mais restent consultables.
            </Text>
          </Card>

          {archived.length === 0 ? (
            <Card>
              <Text variant="subtitle">Aucune archive</Text>
              <Text variant="muted" style={{ marginTop: 6 }}>
                Archive une habitude depuis son écran « Détail ».
              </Text>
            </Card>
          ) : (
            <View style={{ gap: 10 }}>
              {archived.map((h) => (
                <Pressable key={h.id} onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })}>
                  <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <View style={styles.row}>
                      <View style={styles.rowIcon}>
                        <Ionicons name={h.important ? 'star' : 'archive-outline'} size={18} color={h.important ? '#F59E0B' : theme.colors.textMuted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="subtitle" numberOfLines={1}>
                          {h.name}
                        </Text>
                        <Text variant="muted" numberOfLines={1} style={{ marginTop: 4 }}>
                          {h.description || h.replacement || '—'}
                        </Text>
                        <Text variant="mono" style={{ marginTop: 8 }}>
                          Validés: {h.days_validated || 0} · SOS: {h.sos_total || 0}
                        </Text>
                      </View>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation?.();
                          Alert.alert('Supprimer', 'Supprimer définitivement cette habitude archivée ?', [
                            { text: 'Annuler', style: 'cancel' },
                            {
                              text: 'Supprimer',
                              style: 'destructive',
                              onPress: async () => {
                                await remove(h.id);
                                await refresh();
                              },
                            },
                          ]);
                        }}
                        hitSlop={12}
                        style={styles.trashBtn}
                      >
                        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                      </Pressable>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </Enter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pill: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  trashBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.22)',
    backgroundColor: 'rgba(239,68,68,0.10)',
  },
});
