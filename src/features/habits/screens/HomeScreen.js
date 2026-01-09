import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const weekdayFr = () => {
  try {
    return new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  } catch {
    return '';
  }
};

const iconWrap = (bg) => [styles.iconWrap, { backgroundColor: bg }];

export function HomeScreen({ navigation }) {
  const { state, refreshHabits, recordSosToday, getSosEligibility } = useHabits();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  const [sosVisible, setSosVisible] = useState(false);
  const [sosHabit, setSosHabit] = useState(null);
  const [sosAlready, setSosAlready] = useState(false);
  const [sosPhase, setSosPhase] = useState(1);

  const [notesMeta, setNotesMeta] = useState({ count: 0, lastTitle: '' });
  const [refreshing, setRefreshing] = useState(false);

  const today = toLocalDateId(new Date());

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const items = useMemo(() => {
    return state.habits.map((h) => {
      const dayIndex = clamp(dayIndexFromStart(h.start_date, today), 1, Number(h.duration_days));
      const progress = dayIndex / Number(h.duration_days);
      const phase = phaseProgress(dayIndex).phase;
      const statusColor = phase === 3 ? theme.colors.accent2 : phase === 2 ? theme.colors.warn : theme.colors.accent;
      return { ...h, dayIndex, progress, phase, statusColor };
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshHabits();
    } finally {
      setTimeout(() => setRefreshing(false), 650);
    }
  };

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

  const totals = useMemo(() => {
    const habitsCount = items.length;
    const totalDays = items.reduce((acc, it) => acc + Number(it.dayIndex || 0), 0);
    const phase3 = items.filter((it) => Number(it.phase) === 3).length;
    return { habitsCount, totalDays, phase3 };
  }, [items]);

  const header = (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 16 }}>
      <View style={styles.modernTopBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="leaf" size={18} color={theme.colors.textMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="muted" style={styles.dateText}>
              Aujourd'hui, {weekdayFr()}
            </Text>
            <Text variant="display" style={styles.greeting}>
              Bonjour
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <AnimatedPressable onPress={() => navigation.navigate('Notes')} style={[styles.actionButton, styles.searchBtn]} hitSlop={10}>
            <Ionicons name="search" size={20} color={theme.colors.text} />
          </AnimatedPressable>
          <AnimatedPressable onPress={() => navigation.navigate('Settings')} style={[styles.actionButton, styles.settingsBtn]} hitSlop={10}>
            <Ionicons name="settings-outline" size={20} color={theme.colors.textMuted} />
          </AnimatedPressable>
          {totals.habitsCount > 0 ? (
            <View style={styles.badge}>
              <Text variant="caption" style={{ color: theme.colors.white, fontSize: 10 }}>
                {totals.habitsCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
        <AnimatedPressable onPress={() => navigation.navigate('CreateHabit')} style={[styles.quickAction, { backgroundColor: 'rgba(139,92,246,0.10)' }]} hitSlop={10}>
          <View style={[styles.quickIcon, { backgroundColor: theme.colors.accent }]}>
            <Ionicons name="add" size={22} color={theme.colors.white} />
          </View>
          <Text variant="caption" style={styles.quickLabel}>
            Nouveau
          </Text>
        </AnimatedPressable>

        <AnimatedPressable onPress={() => navigation.navigate('Notes')} style={[styles.quickAction, { backgroundColor: 'rgba(34,211,238,0.10)' }]} hitSlop={10}>
          <View style={[styles.quickIcon, { backgroundColor: theme.colors.accent2 }]}>
            <Ionicons name="book" size={22} color={theme.colors.black} />
          </View>
          <Text variant="caption" style={styles.quickLabel}>
            Journal
          </Text>
          {notesMeta.count > 0 ? (
            <View style={styles.miniBadge}>
              <Text variant="caption" style={{ color: theme.colors.white, fontSize: 8 }}>
                {notesMeta.count}
              </Text>
            </View>
          ) : null}
        </AnimatedPressable>

        <AnimatedPressable onPress={handleRefresh} style={[styles.quickAction, { backgroundColor: 'rgba(241,245,249,0.08)' }]} hitSlop={10}>
          <View style={[styles.quickIcon, { backgroundColor: 'rgba(241,245,249,0.28)' }]}>
            <Ionicons name="refresh" size={22} color={theme.colors.text} />
          </View>
          <Text variant="caption" style={styles.quickLabel}>
            Sync
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={() => {
            if (items.length === 1) openSos(items[0]);
            else navigation.navigate('Notes');
          }}
          style={[styles.quickAction, { backgroundColor: 'rgba(239,68,68,0.10)' }]}
          hitSlop={10}
        >
          <View style={[styles.quickIcon, { backgroundColor: 'rgba(239,68,68,0.55)' }]}>
            <Ionicons name="shield-checkmark" size={22} color={theme.colors.white} />
          </View>
          <Text variant="caption" style={styles.quickLabel}>
            SOS
          </Text>
        </AnimatedPressable>
      </ScrollView>

      <Card style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text variant="display" style={styles.statNumber}>
              {totals.habitsCount}
            </Text>
            <Text variant="caption" style={styles.statLabel}>
              HABITUDES
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="display" style={styles.statNumber}>
              {totals.totalDays}
            </Text>
            <Text variant="caption" style={styles.statLabel}>
              JOURS
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="display" style={styles.statNumber}>
              {totals.phase3}
            </Text>
            <Text variant="caption" style={styles.statLabel}>
              PHASE 3
            </Text>
          </View>
        </View>
      </Card>

      {featured.length > 0 ? (
        <View style={{ gap: 12 }}>
          <View style={styles.sectionHeader}>
            <Text variant="subtitle">À la une</Text>
            <Pressable onPress={() => navigation.navigate('Notes')} hitSlop={10}>
              <Text variant="mono" style={{ color: theme.colors.accent2 }}>
                Voir tout
              </Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {featured.slice(0, 4).map((h) => (
              <Pressable key={h.id} onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })} style={styles.featureCardTall}>
                <View style={styles.poster}>
                  <View style={[styles.posterOverlay, { backgroundColor: `${String(h.statusColor || theme.colors.accent).replace(')', ',0.10)').replace('rgb', 'rgba')}` }]} />
                  <View style={styles.posterBadge}>
                    <Text variant="mono">Phase {h.phase}</Text>
                  </View>
                  <View style={styles.posterTopRow}>
                    <Text variant="subtitle" numberOfLines={1} style={{ flex: 1 }}>
                      {h.name}
                    </Text>
                    {h.important ? <Ionicons name="star" size={16} color="#F59E0B" /> : null}
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
                  </View>
                  <Text variant="muted" numberOfLines={2} style={{ marginTop: 8 }}>
                    {h.description || h.replacement || '—'}
                  </Text>
                  {/*<View style={{ marginTop: 12 }}>*/}
                  {/*  <PlantProgress dayIndex={h.dayIndex} durationDays={Number(h.duration_days)} size="s" />*/}
                  {/*</View>*/}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text variant="subtitle">Mes habitudes</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Button title="Créer" onPress={() => navigation.navigate('CreateHabit')} />
        </View>
        <View style={{ width: 120 }}>
          <Button title="Rafraîchir" variant="ghost" onPress={handleRefresh} />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <Screen>
      <FlatList
        data={items}
        showsVerticalScrollIndicator={false}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
        ListHeaderComponent={header}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Card>
            <Text variant="subtitle">Bienvenue</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Zéro compte. Zéro cloud. Une progression visible — jour après jour.
            </Text>
            {/*<View style={{ marginTop: 14 }}>*/}
            {/*  <PlantProgress dayIndex={1} durationDays={66} size="l" />*/}
            {/*</View>*/}
            <View style={{ marginTop: 14, gap: 10 }}>
              <Button title="Créer ma première habitude" onPress={() => navigation.navigate('CreateHabit')} />
              <Button title="Ouvrir le journal" variant="ghost" onPress={() => navigation.navigate('Notes')} />
            </View>
          </Card>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}>
            <Card style={{ padding: 0 }}>
              <View style={styles.habitCardInner}>
                <View style={styles.habitTopRow}>
                  <View style={[styles.dot, { backgroundColor: item.statusColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text variant="subtitle" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text variant="muted" numberOfLines={1}>
                      Phase {item.phase} · Jour {item.dayIndex}/{item.duration_days}
                    </Text>
                  </View>
                  {item.important ? <Ionicons name="star" size={16} color="#F59E0B" /> : null}
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
  modernTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: { textTransform: 'capitalize' },
  greeting: { letterSpacing: -0.4 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchBtn: { backgroundColor: 'rgba(255,255,255,0.04)' },
  settingsBtn: { backgroundColor: 'rgba(255,255,255,0.04)' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  quickActionsScroll: { gap: 12, paddingRight: 20 },
  quickAction: {
    width: 92,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    alignItems: 'center',
    gap: 10,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  quickLabel: { color: theme.colors.textMuted },
  miniBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
  statsCard: { padding: 0 },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 26, fontWeight: '900', color: theme.colors.text },
  statLabel: { color: theme.colors.textMuted, letterSpacing: 1.2, fontWeight: '800' },
  statDivider: { width: 1, height: 32, backgroundColor: theme.colors.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hScroll: { gap: 12, paddingRight: 20 },
  featureCardTall: { width: 280 },
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
    top: -70,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 150,
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
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
