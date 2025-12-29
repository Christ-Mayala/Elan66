import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { Button } from '../../../core/ui/Button';
import { NotepadInput } from '../../../core/ui/NotepadInput';
import { useHabits } from '../context/HabitsContext';
import { DayState, phaseCopy } from '../../../core/utils/constants';
import { addDaysLocal, dayIndexFromStart, toLocalDateId, clamp, phaseProgress } from '../../../core/utils/dateUtils';
import { theme } from '../../../core/theme/theme';
import { domainErrorMessageFr } from '../../../core/utils/domainErrors';
import { HabitTimeline } from '../components/HabitTimeline';
import { DayPickerStrip } from '../components/DayPickerStrip';
import { PlantProgress } from '../components/PlantProgress';
import { SOSModal } from '../components/SOSModal';

export function HabitDetailScreen({ route, navigation }) {
  const habitId = route.params?.habitId;
  const { getHabitDetail, setStateForDay, saveNoteForDay, recordSosToday, getSosEligibility, archive, remove } = useHabits();

  const [data, setData] = useState({ habit: null, logs: [] });
  const [note, setNote] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [sosVisible, setSosVisible] = useState(false);
  const [sosAlready, setSosAlready] = useState(false);

  const today = toLocalDateId(new Date());

  useEffect(() => {
    (async () => {
      const d = await getHabitDetail(habitId);
      setData(d);
      const idx = clamp(dayIndexFromStart(d.habit.start_date, today), 1, Number(d.habit.duration_days));
      setSelectedDayIndex(idx);
      const dateId = addDaysLocal(d.habit.start_date, idx - 1);
      const selLog = d.logs.find((l) => l.date === dateId);
      setNote(selLog?.note || '');
      navigation.setOptions({ title: d.habit?.name || 'Détail' });
    })();
  }, [getHabitDetail, habitId, navigation, today]);

  const habit = data.habit;

  const todayDayIndex = useMemo(() => {
    if (!habit) return 1;
    return clamp(dayIndexFromStart(habit.start_date, today), 1, Number(habit.duration_days));
  }, [habit, today]);

  const selectedDateId = useMemo(() => {
    if (!habit) return today;
    return addDaysLocal(habit.start_date, (Number(selectedDayIndex) || 1) - 1);
  }, [habit, selectedDayIndex, today]);

  const selectedLog = useMemo(() => {
    return data.logs.find((l) => l.date === selectedDateId) || null;
  }, [data.logs, selectedDateId]);

  const phase = useMemo(() => phaseProgress(selectedDayIndex), [selectedDayIndex]);

  const onValidate = async (state) => {
    const doIt = async () => {
      const log = await setStateForDay({ habitId, dateId: selectedDateId, state });
      if (state === DayState.fail) {
        Alert.alert('Analyse', "Qu'est-ce qui a déclenché cela ? Écris-le dans ton journal pour mieux l'anticiper.");
      }
      setData((d) => ({
        ...d,
        logs: d.logs.some((l) => l.date === log.date) ? d.logs.map((l) => (l.date === log.date ? log : l)) : [...d.logs, log],
      }));
    };

    try {
      if (selectedDateId !== today) {
        Alert.alert(
          'Validation rétroactive',
          "Tu vas valider un jour passé. C'est OK si tu es sûr de toi.",
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Valider', style: 'destructive', onPress: doIt },
          ]
        );
        return;
      }
      await doIt();
    } catch (e) {
      Alert.alert('Impossible', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const onSaveNote = async () => {
    try {
      const log = await saveNoteForDay({ habitId, dateId: selectedDateId, note });
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

  const isFutureSelected = Number(selectedDayIndex) > Number(todayDayIndex);
  const isTodaySelected = selectedDateId === today;
  const alreadyValidated = Boolean(selectedLog?.state);
  const sosPhase = phaseProgress(todayDayIndex).phase;

  const onSelectDay = (d) => {
    const di = clamp(Number(d) || 1, 1, Number(habit.duration_days));
    setSelectedDayIndex(di);
    const dateId = addDaysLocal(habit.start_date, di - 1);
    const log = data.logs.find((l) => l.date === dateId);
    setNote(log?.note || '');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Card>
          <Text variant="subtitle">Phase {phase.phase} — {phaseInfo.name}</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>{phaseMessage}</Text>
          <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="mono">
              Jour {selectedDayIndex}/{habit.duration_days} · {selectedDateId}
            </Text>
            <Text variant="mono">
              {phase.inPhase}/{phase.phaseTotal}{isTodaySelected ? '' : ` · Aujourd'hui ${todayDayIndex}`}
            </Text>
          </View>
          <View style={{ marginTop: 10, alignItems: 'center' }}>
            <PlantProgress dayIndex={selectedDayIndex} durationDays={Number(habit.duration_days)} size="l" />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Choisir un jour</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Validation rétroactive possible (jours passés). Impossible sur un jour futur.
          </Text>
          <View style={{ marginTop: 8 }}>
            <DayPickerStrip
              durationDays={Number(habit.duration_days)}
              selectedDayIndex={selectedDayIndex}
              logs={data.logs}
              onSelect={onSelectDay}
            />
          </View>
          <Text variant="muted" style={{ marginTop: 6 }}>
            État: {selectedLog?.state ? selectedLog.state : '—'}
          </Text>
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
          <Text variant="subtitle">Valider</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            {selectedDateId}{isFutureSelected ? ' (futur)' : ''}{alreadyValidated ? ' (déjà validé)' : ''}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Button title="✅" disabled={isFutureSelected || alreadyValidated} onPress={() => onValidate(DayState.success)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="⚠️" variant="ghost" disabled={isFutureSelected || alreadyValidated} onPress={() => onValidate(DayState.resisted)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="❌" variant="ghost" disabled={isFutureSelected || alreadyValidated} onPress={() => onValidate(DayState.fail)} />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Button title="SOS (3 min)" variant="ghost" disabled={!isTodaySelected} onPress={onSosOpen} />
            <Text variant="muted" style={{ marginTop: 6 }}>
              SOS comptabilisé uniquement aujourd'hui.
            </Text>
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Journal</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>{selectedDateId}</Text>
          <NotepadInput
            value={note}
            onChangeText={setNote}
            placeholder="Qu'est-ce qui a déclenché cela ? Qu'est-ce que tu peux anticiper ?"
            editable={!isFutureSelected}
            minHeight={200}
            style={{ marginTop: 12, ...theme.shadow.card }}
          />
          <View style={{ marginTop: 10 }}>
            <Button title="Enregistrer" disabled={isFutureSelected} onPress={onSaveNote} />
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
        phase={sosPhase}
        alreadyCounted={sosAlready}
        onCount={onSosCount}
        onClose={() => setSosVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  linkRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
