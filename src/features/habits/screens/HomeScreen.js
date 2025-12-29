import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Button } from '../../../core/ui/Button';
import { Card } from '../../../core/ui/Card';
import { BUILD_ID } from '../../../core/utils/buildInfo';
import { useHabits } from '../context/HabitsContext';
import { theme } from '../../../core/theme/theme';
import { clamp, dayIndexFromStart, phaseProgress, toLocalDateId } from '../../../core/utils/dateUtils';
import { SOSModal } from '../components/SOSModal';
import { PlantProgress } from '../components/PlantProgress';
import { domainErrorMessageFr } from '../../../core/utils/domainErrors';
import { listNotes } from '../../notes/data/notesRepo';

const iconWrap = (bg) => [styles.iconWrap, { backgroundColor: bg }];

export function HomeScreen({ navigation }) {
  const { state, refreshHabits, recordSosToday, getSosEligibility } = useHabits();

  const [sosVisible, setSosVisible] = useState(false);
  const [sosHabit, setSosHabit] = useState(null);
  const [sosAlready, setSosAlready] = useState(false);
  const [sosPhase, setSosPhase] = useState(1);

  const [notesMeta, setNotesMeta] = useState({ count: 0, lastTitle: '' });

  const today = toLocalDateId(new Date());

  const items = useMemo(() => {
    return state.habits.map((h) => {
      const dayIndex = clamp(dayIndexFromStart(h.start_date, today), 1, Number(h.duration_days));
      const progress = dayIndex / Number(h.duration_days);
      const phase = phaseProgress(dayIndex).phase;
      return { ...h, dayIndex, progress, phase };
    });
  }, [state.habits, today]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await listNotes();
        const count = Array.isArray(rows) ? rows.length : 0;
        const last = rows?.[0]?.title ? String(rows[0].title) : '';
        setNotesMeta({ count, lastTitle: last });
      } catch {
        setNotesMeta({ count: 0, lastTitle: '' });
      }
    })();
  }, []);

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

  const featured = useMemo(() => {
    const base = items.slice().sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
    return base.slice(0, 6);
  }, [items]);

  const header = (
    <View style={{ gap: 14 }}>
      <View style={styles.topBar}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text variant="muted">Aujourd'hui</Text>
          <Text variant="display">Discover</Text>
        </View>

        <Pressable onPress={() => navigation.navigate('Notes')} style={styles.iconBtn} hitSlop={10}>
          <Ionicons name="search" size={18} color={theme.colors.text} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Settings')} style={styles.iconBtn} hitSlop={10}>
          <Ionicons name="person-circle" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.sectionRow}>
        <Text variant="subtitle">À la une</Text>
        <Pressable onPress={() => navigation.navigate('Notes')} hitSlop={10}>
          <Text variant="mono" style={{ color: theme.colors.accent2 }}>
            Voir tout
          </Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        <Pressable onPress={() => navigation.navigate('CreateHabit')} style={[styles.featureCard, styles.featureCardWide]}>
          <View style={iconWrap('rgba(139,92,246,0.18)')}>
            <Ionicons name="add" size={18} color={theme.colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle">Nouvelle habitude</Text>
            <Text variant="muted" numberOfLines={2}>
              Démarre un cycle de 66 jours.
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Notes')} style={[styles.featureCard, styles.featureCardWide]}>
          <View style={iconWrap('rgba(34,211,238,0.16)')}>
            <Ionicons name="book" size={18} color={theme.colors.accent2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle">Journal</Text>
            <Text variant="muted" numberOfLines={2}>
              {notesMeta.count ? `${notesMeta.count} notes · ${notesMeta.lastTitle || 'Dernière note'}` : 'Écris une note rapide.'}
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={refreshHabits} style={[styles.featureCard, styles.featureCardWide]}>
          <View style={iconWrap('rgba(241,245,249,0.10)')}>
            <Ionicons name="refresh" size={18} color={theme.colors.textMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle">Sync locale</Text>
            <Text variant="muted" numberOfLines={2}>
              Rafraîchir les données.
            </Text>
          </View>
        </Pressable>

        {featured.slice(0, 3).map((h) => (
          <Pressable key={h.id} onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })} style={styles.featureCardTall}>
            <View style={styles.poster}>
              <View style={styles.posterOverlay} />
              <View style={styles.posterBadge}>
                <Text variant="mono">Phase {h.phase}</Text>
              </View>
              <View style={styles.posterTopRow}>
                <Text variant="subtitle" numberOfLines={1} style={{ flex: 1 }}>
                  {h.name}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
              </View>
              <View style={{ marginTop: 10 }}>
                <PlantProgress dayIndex={h.dayIndex} durationDays={Number(h.duration_days)} size="s" />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Card style={styles.heroCard}>
        <View style={styles.heroInner}>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle">What's new?</Text>
            <Text variant="muted" numberOfLines={3} style={{ marginTop: 6 }}>
              Une app hors-ligne, pensée pour tenir. Habitudes + journal. Zéro cloud.
            </Text>

            <View style={{ marginTop: 14, gap: 10 }}>
              <Pressable onPress={() => navigation.navigate('CreateHabit')} style={styles.rowLink}>
                <View style={iconWrap('rgba(139,92,246,0.18)')}>
                  <Ionicons name="leaf" size={18} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">Créer</Text>
                  <Text variant="muted" numberOfLines={1}>
                    Définis ton objectif et démarre.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </Pressable>

              <Pressable onPress={() => navigation.navigate('Notes')} style={styles.rowLink}>
                <View style={iconWrap('rgba(34,211,238,0.16)')}>
                  <Ionicons name="create" size={18} color={theme.colors.accent2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">Écrire</Text>
                  <Text variant="muted" numberOfLines={1}>
                    Notes, checklists, titres.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </Pressable>

              <Pressable
                onPress={() => {
                  if (items.length === 1) openSos(items[0]);
                  else navigation.navigate('Notes');
                }}
                style={styles.rowLink}
              >
                <View style={iconWrap('rgba(241,245,249,0.10)')}>
                  <Ionicons name="shield" size={18} color={theme.colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">SOS (3 min)</Text>
                  <Text variant="muted" numberOfLines={1}>
                    Revenir au contrôle, sans friction.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <View style={{ width: 130, alignItems: 'flex-end', justifyContent: 'center' }}>
            <PlantProgress dayIndex={Math.max(1, items[0]?.dayIndex || 1)} durationDays={Math.max(1, Number(items[0]?.duration_days || 66))} size="m" />
          </View>
        </View>
      </Card>

      <View style={styles.sectionRow}>
        <Text variant="subtitle">Mes habitudes</Text>
        <Text variant="mono">Build: {BUILD_ID}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Button title="Créer" onPress={() => navigation.navigate('CreateHabit')} />
        </View>
        <View style={{ width: 120 }}>
          <Button title="Rafraîchir" variant="ghost" onPress={refreshHabits} />
        </View>
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Card>
            <Text variant="subtitle">Bienvenue</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Zéro compte. Zéro cloud. Une progression visible — jour après jour.
            </Text>

            <View style={{ marginTop: 14 }}>
              <PlantProgress dayIndex={1} durationDays={66} size="l" />
            </View>

            <View style={{ marginTop: 14, gap: 10 }}>
              <Button title="Créer ma première habitude" onPress={() => navigation.navigate('CreateHabit')} />
              <Button title="Ouvrir le journal" variant="ghost" onPress={() => navigation.navigate('Notes')} />
            </View>

            <Text variant="muted" style={{ marginTop: 12 }}>
              Astuce: utilise “#” pour les titres, “-” pour les listes, et “- [ ]” pour les checklists.
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}>
            <Card style={{ padding: 0 }}>
              <View style={styles.habitCardInner}>
                <View style={{ flex: 1 }}>
                  <View style={styles.habitTopRow}>
                    <View style={iconWrap('rgba(139,92,246,0.14)')}>
                      <Ionicons name="leaf" size={16} color={theme.colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="subtitle" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text variant="muted" numberOfLines={1}>
                        Phase {item.phase} · Jour {item.dayIndex}/{item.duration_days}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        openSos(item);
                      }}
                      style={styles.sosChip}
                      hitSlop={10}
                    >
                      <Text variant="mono" style={{ color: theme.colors.text }}>
                        SOS
                      </Text>
                    </Pressable>
                  </View>

                  <Text variant="muted" numberOfLines={2} style={{ marginTop: 10 }}>
                    {item.description || item.replacement || '—'}
                  </Text>

                  <View style={{ marginTop: 12 }}>
                    <PlantProgress dayIndex={item.dayIndex} durationDays={Number(item.duration_days)} size="m" />
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
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hScroll: { gap: 12, paddingRight: 20 },
  featureCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  featureCardWide: { width: 240 },
  featureCardTall: { width: 260 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  poster: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    overflow: 'hidden',
    padding: 14,
    ...theme.shadow.card,
  },
  posterOverlay: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 140,
    backgroundColor: 'rgba(139,92,246,0.10)',
  },
  posterBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  posterTopRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroCard: {
    padding: 0,
    overflow: 'hidden',
  },
  heroInner: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  rowLink: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
  },
  habitCardInner: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  habitTopRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  sosChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
