import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { Button } from '../../../core/ui/Button';
import { useHabits } from '../context/HabitsContext';
import { DayState, phaseCopy } from '../../../core/utils/constants';
import { dayIndexFromStart, toLocalDateId, clamp, phaseProgress } from '../../../core/utils/dateUtils';
import { theme } from '../../../core/theme/theme';
import { domainErrorMessageFr } from '../../../core/utils/domainErrors';
import { HabitTimeline } from '../components/HabitTimeline';
import { RouteProgress } from '../components/RouteProgress';
import { SOSModal } from '../components/SOSModal';

export function HabitDetailScreen({ route, navigation }) {
  const habitId = route.params?.habitId;
  const { getHabitDetail, setStateForDay, saveNoteForDay, recordSosToday, getSosEligibility, archive, remove } = useHabits();

  const [data, setData] = useState({ habit: null, logs: [] });
  const [note, setNote] = useState('');
  const [sosVisible, setSosVisible] = useState(false);
  const [sosAlready, setSosAlready] = useState(false);

  const today = toLocalDateId(new Date());

  useEffect(() => {
    (async () => {
      const d = await getHabitDetail(habitId);
      setData(d);
      const todayLog = d.logs.find((l) => l.date === today);
      setNote(todayLog?.note || '');
      navigation.setOptions({ title: d.habit?.name || 'Détail' });
    })();
  }, [getHabitDetail, habitId, navigation, today]);

  const habit = data.habit;

  const dayIndex = useMemo(() => {
    if (!habit) return 1;
    return clamp(dayIndexFromStart(habit.start_date, today), 1, Number(habit.duration_days));
  }, [habit, today]);

  const phase = useMemo(() => phaseProgress(dayIndex), [dayIndex]);

  const onValidate = async (state) => {
    try {
      const log = await setStateForDay({ habitId, dateId: today, state });
      if (state === DayState.fail) {
        Alert.alert('Analyse', "Qu'est-ce qui a déclenché cela ? Écris-le dans ton journal pour mieux l'anticiper.");
      }
      setData((d) => ({
        ...d,
        logs: d.logs.some((l) => l.date === log.date) ? d.logs.map((l) => (l.date === log.date ? log : l)) : [...d.logs, log],
      }));
    } catch (e) {
      Alert.alert('Impossible', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const onSaveNote = async () => {
    try {
      const log = await saveNoteForDay({ habitId, dateId: today, note });
      setData((d) => ({
        ...d,
        logs: d.logs.some((l) => l.date === log.date) ? d.logs.map((l) => (l.date === log.date ? log : l)) : [...d.logs, log],
      }));
    } catch (e) {
      Alert.alert('Impossible', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const onSosOpen = async () => {
    try {
      const res = await getSosEligibility({ habitId, dateId: today });
      setSosAlready(Boolean(res.already));
      setSosVisible(true);
    } catch (e) {
      Alert.alert('Impossible', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const onSosCount = async () => {
    try {
      const res = await recordSosToday({ habitId, dateId: today });
      if (res.didCount) {
        setSosAlready(true);
      }
    } catch (e) {
      Alert.alert('Impossible', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const onArchive = async () => {
    Alert.alert('Archiver', 'Archiver cette habitude ? Elle sera exclue des stats.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Archiver',
        style: 'destructive',
        onPress: async () => {
          await archive(habitId);
          navigation.goBack();
        },
      },
    ]);
  };

  const onDelete = async () => {
    Alert.alert('Supprimer', 'Suppression irréversible. Toutes les données associées seront effacées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await remove(habitId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!habit) {
    return (
      <Screen>
        <Text variant="muted">Chargement…</Text>
      </Screen>
    );
  }

  const phaseInfo = phaseCopy[phase.phase];
  const phaseMessage = phaseInfo?.message?.[habit.discipline_mode] || phaseInfo?.message?.soft || '';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Card>
          <Text variant="subtitle">Phase {phase.phase} — {phaseInfo.name}</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>{phaseMessage}</Text>
          <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="mono">Jour {dayIndex}/{habit.duration_days}</Text>
            <Text variant="mono">{phase.inPhase}/{phase.phaseTotal}</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <RouteProgress dayIndex={dayIndex} durationDays={Number(habit.duration_days)} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Timeline</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            66 jours en 3 phases (22/22/22). Une journée = 1 validation.
          </Text>
          <View style={{ marginTop: 10 }}>
            <HabitTimeline durationDays={Number(habit.duration_days)} logs={data.logs} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Valider aujourd'hui</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Button title="✅" onPress={() => onValidate(DayState.success)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="⚠️" variant="ghost" onPress={() => onValidate(DayState.resisted)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="❌" variant="ghost" onPress={() => onValidate(DayState.fail)} />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Button title="SOS (3 min)" variant="ghost" onPress={onSosOpen} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Journal (aujourd'hui)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Qu'est-ce qui se passe en toi ?"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.multiline]}
            multiline
          />
          <View style={{ marginTop: 10 }}>
            <Button title="Enregistrer" onPress={onSaveNote} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Actions</Text>
          <View style={{ marginTop: 10, gap: 10 }}>
            <Pressable onPress={onArchive} style={styles.linkRow}>
              <Text>Archiver</Text>
            </Pressable>
            <Pressable onPress={onDelete} style={styles.linkRow}>
              <Text style={{ color: theme.colors.danger }}>Supprimer</Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>

      <SOSModal
        visible={sosVisible}
        habit={habit}
        phase={phase.phase}
        alreadyCounted={sosAlready}
        onCount={onSosCount}
        onClose={() => setSosVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  barOuter: {
    marginTop: 10,
    height: 8,
    borderRadius: 99,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  barInner: { height: '100%', backgroundColor: theme.colors.accent },
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
  multiline: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  linkRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
