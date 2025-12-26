import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Button } from '../../../core/ui/Button';
import { Card } from '../../../core/ui/Card';
import { theme } from '../../../core/theme/theme';
import { DisciplineMode, GOLD_STANDARD_DAYS, nudge66Text } from '../../../core/utils/constants';
import { clampInt, nonEmpty } from '../../../core/utils/validation';
import { useHabits } from '../context/HabitsContext';

export function CreateHabitScreen({ navigation }) {
  const { createNewHabit, state } = useHabits();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [replacement, setReplacement] = useState('');
  const [commitment, setCommitment] = useState('');
  const [durationDays, setDurationDays] = useState(String(GOLD_STANDARD_DAYS));
  const [disciplineMode, setDisciplineMode] = useState(DisciplineMode.soft);

  const durationValue = useMemo(() => clampInt(durationDays, 7, 365), [durationDays]);

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
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Text variant="title">Nouvelle habitude</Text>

        <Card>
          <View style={{ gap: 10 }}>
            <Text variant="subtitle">Paramètres</Text>

            <View>
              <Text variant="muted">Nom</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Arrêter le sucre"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>

            <View>
              <Text variant="muted">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Contexte, enjeu, déclencheurs"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, styles.multiline]}
                multiline
              />
            </View>

            <View>
              <Text variant="muted">Habitude de remplacement</Text>
              <TextInput
                value={replacement}
                onChangeText={setReplacement}
                placeholder="Ex: Marcher 5 minutes"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>

            <View>
              <Text variant="muted">Phrase d'engagement (SOS)</Text>
              <TextInput
                value={commitment}
                onChangeText={setCommitment}
                placeholder="Pourquoi je tiens ?"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, styles.multiline]}
                multiline
              />
            </View>

            <View>
              <Text variant="muted">Durée (jours)</Text>
              <TextInput
                value={String(durationDays)}
                onChangeText={setDurationDays}
                keyboardType="number-pad"
                style={styles.input}
              />
              <Text variant="muted" style={{ marginTop: 6 }}>
                Gold standard : {GOLD_STANDARD_DAYS} jours.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Douce"
                  variant={disciplineMode === DisciplineMode.soft ? 'primary' : 'ghost'}
                  onPress={() => setDisciplineMode(DisciplineMode.soft)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Stricte"
                  variant={disciplineMode === DisciplineMode.strict ? 'primary' : 'ghost'}
                  onPress={() => setDisciplineMode(DisciplineMode.strict)}
                />
              </View>
            </View>

            <Button title={state.isBusy ? 'Création…' : 'Créer'} disabled={state.isBusy} onPress={onSubmit} />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 6,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.text,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
