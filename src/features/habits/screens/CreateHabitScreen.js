import React, { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Button } from '../../../core/ui/Button';
import { Card } from '../../../core/ui/Card';
import { theme } from '../../../core/theme/theme';
import { DisciplineMode, GOLD_STANDARD_DAYS, PHASE_LENGTH_DAYS, nudge66Text } from '../../../core/utils/constants';
import { addDaysLocal, clamp, toLocalDateId } from '../../../core/utils/dateUtils';
import { clampInt, nonEmpty } from '../../../core/utils/validation';
import { useHabits } from '../context/HabitsContext';
import { Segmented } from '../../notes/components/segmented';
import { NotepadInput } from '../../../core/ui/NotepadInput';
import { PlantProgress } from '../components/PlantProgress';

const presetDurations = [30, 66, 90];

export function CreateHabitScreen({ navigation }) {
  const { createNewHabit, state } = useHabits();

  const descRef = useRef(null);
  const sosRef = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [replacement, setReplacement] = useState('');
  const [commitment, setCommitment] = useState('');
  const [durationDays, setDurationDays] = useState(String(GOLD_STANDARD_DAYS));
  const [disciplineMode, setDisciplineMode] = useState(DisciplineMode.soft);

  const durationValue = useMemo(() => clampInt(durationDays, 7, 365), [durationDays]);
  const today = useMemo(() => toLocalDateId(new Date()), []);
  const endDate = useMemo(() => addDaysLocal(today, Math.max(0, durationValue - 1)), [today, durationValue]);

  const phase3Start = useMemo(() => {
    const d = clamp(durationValue, 7, 365);
    const p2 = Math.min(PHASE_LENGTH_DAYS * 2, d);
    return Math.min(d, p2 + 1);
  }, [durationValue]);

  const onSubmit = async () => {
    if (!nonEmpty(name)) {
      Alert.alert('Nom requis', "Donne un nom simple à l'habitude.");
      return;
    }

    const wantsShort = durationValue < GOLD_STANDARD_DAYS;

    const proceed = async () => {
      const habit = await createNewHabit({
        name,
        description,
        replacement,
        commitment,
        disciplineMode,
        durationDays: durationValue,
      });
      navigation.replace('HabitDetail', { habitId: habit.id });
    };

    if (wantsShort) {
      Alert.alert('66 jours', nudge66Text, [
        { text: 'Garder 66', style: 'default', onPress: () => setDurationDays(String(GOLD_STANDARD_DAYS)) },
        { text: 'Continuer', style: 'destructive', onPress: proceed },
      ]);
      return;
    }

    await proceed();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text variant="muted">Création</Text>
            <Text variant="display">Nouvelle habitude</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="calendar" size={16} color={theme.colors.textMuted} />
            <Text variant="mono">{durationValue} j</Text>
          </View>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroInner}>
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">Aperçu</Text>
              <Text variant="muted" style={{ marginTop: 6 }}>
                Fin estimée : {endDate}
              </Text>

              <View style={{ marginTop: 12, gap: 8 }}>
                <View style={styles.rowInfo}>
                  <Text variant="muted">Mode</Text>
                  <Text>{disciplineMode === DisciplineMode.strict ? 'Stricte' : 'Douce'}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <Text variant="muted">Phase 3 à partir du</Text>
                  <Text>jour {phase3Start}</Text>
                </View>
              </View>
            </View>

            <View style={{ width: 170, alignItems: 'flex-end', justifyContent: 'center' }}>
              <PlantProgress dayIndex={1} durationDays={durationValue} size="m" />
            </View>
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Essentiel</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Un nom clair et actionnable.
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex : Arrêter le sucre"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => descRef.current?.focus?.()}
          />

          <View style={{ marginTop: 12 }}>
            <Text variant="muted">Habitude de remplacement</Text>
            <TextInput
              value={replacement}
              onChangeText={setReplacement}
              placeholder="Ex : Marcher 5 minutes"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Contexte</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Déclencheurs, situations, pourquoi.
          </Text>
          <NotepadInput
            ref={descRef}
            value={description}
            onChangeText={setDescription}
            placeholder="Contexte, enjeu, déclencheurs…"
            minHeight={180}
            style={{ marginTop: 12, ...theme.shadow.card }}
          />
        </Card>

        <Card>
          <Text variant="subtitle">Phrase SOS</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Une phrase courte pour te ramener au contrôle.
          </Text>
          <NotepadInput
            ref={sosRef}
            value={commitment}
            onChangeText={setCommitment}
            placeholder="Pourquoi je tiens ?"
            minHeight={160}
            style={{ marginTop: 12, ...theme.shadow.card }}
          />
        </Card>

        <Card>
          <Text variant="subtitle">Durée & mode</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Gold standard : {GOLD_STANDARD_DAYS} jours.
          </Text>

          <View style={{ marginTop: 12 }}>
            <Text variant="muted">Durée (jours)</Text>
            <TextInput
              value={String(durationDays)}
              onChangeText={setDurationDays}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.presetsRow}>
            {presetDurations.map((d) => {
              const active = Number(durationValue) === d;
              return (
                <Pressable key={String(d)} onPress={() => setDurationDays(String(d))} style={[styles.presetChip, active ? styles.presetChipOn : null]}>
                  <Text variant="mono" style={{ color: active ? theme.colors.black : theme.colors.textMuted }}>
                    {d} j
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text variant="muted">Discipline</Text>
            <View style={{ marginTop: 8 }}>
              <Segmented
                value={disciplineMode}
                options={[
                  { value: DisciplineMode.soft, label: 'Douce' },
                  { value: DisciplineMode.strict, label: 'Stricte' },
                ]}
                onChange={setDisciplineMode}
              />
            </View>
          </View>

          <View style={{ marginTop: 14 }}>
            <Button title={state.isBusy ? 'Création…' : 'Créer'} disabled={state.isBusy} onPress={onSubmit} />
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
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
  heroCard: { padding: 0, overflow: 'hidden' },
  heroInner: {
    padding: theme.spacing.m,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  rowInfo: {
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
  input: {
    marginTop: 10,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.text,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  presetChip: {
    flex: 1,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipOn: {
    backgroundColor: theme.colors.accent,
    borderColor: 'rgba(255,255,255,0.10)',
  },
});
