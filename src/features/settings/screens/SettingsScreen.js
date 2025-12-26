import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { Button } from '../../../core/ui/Button';
import { theme } from '../../../core/theme/theme';
import { exportAllDataToJson, importAllDataFromJson } from '../../../core/services/exportImport';
import { domainErrorMessageFr } from '../../../core/utils/domainErrors';
import { getDailyReminderTime, setDailyReminderTime, syncDailyCheckinsForHabits } from '../../../core/services/notifications';
import { isExpoGo } from '../../../core/utils/runtime';
import { useHabits } from '../../habits/context/HabitsContext';

export function SettingsScreen() {
  const { state, refreshHabits } = useHabits();

  const [hour, setHour] = useState('20');
  const [minute, setMinute] = useState('30');

  useEffect(() => {
    (async () => {
      const t = await getDailyReminderTime();
      setHour(String(t.hour));
      setMinute(String(t.minute).padStart(2, '0'));
    })();
  }, []);

  const onSaveTime = async () => {
    try {
      const t = await setDailyReminderTime({ hour, minute });
      if (!isExpoGo()) {
        await syncDailyCheckinsForHabits(state.habits);
        Alert.alert('OK', `Rappel quotidien : ${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`);
        return;
      }
      Alert.alert('OK', `Heure enregistrée : ${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`);
    } catch (e) {
      Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const onExport = async () => {
    try {
      const res = await exportAllDataToJson();
      Alert.alert('Export', `Fichier créé : ${res.path}`);
    } catch (e) {
      Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const onImport = async () => {
    Alert.alert(
      'Importer',
      'Cette opération remplace toutes les données locales. Assure-toi de faire un export avant.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Importer',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await importAllDataFromJson({ replaceAll: true });
              if (res?.canceled) return;
              const habits = await refreshHabits();
              if (!isExpoGo()) await syncDailyCheckinsForHabits(habits);
              Alert.alert(
                'Import terminé',
                `Habitudes: ${res.counts?.habits || 0}\nLogs: ${res.counts?.logs || 0}\nSOS: ${res.counts?.sos || 0}\nJournal: ${res.counts?.diary || 0}`
              );
            } catch (e) {
              Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 110 }} keyboardShouldPersistTaps="handled">
        <Text variant="title">Réglages</Text>

        <Card>
          <Text variant="subtitle">Notifications</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Rappel quotidien à heure fixe. (Local)
          </Text>
          {isExpoGo() ? (
            <Text variant="muted" style={{ marginTop: 10, color: theme.colors.warn }}>
              Dans Expo Go, les notifications sont limitées. Utilise un dev build pour activer totalement cette fonctionnalité.
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="muted">Heure</Text>
              <TextInput value={hour} onChangeText={setHour} keyboardType="number-pad" style={styles.input} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="muted">Minute</Text>
              <TextInput value={minute} onChangeText={setMinute} keyboardType="number-pad" style={styles.input} />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Button title="Enregistrer l'heure" onPress={onSaveTime} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Sauvegarde manuelle</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Export/Import JSON. Aucun cloud.
          </Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            <Button title="Exporter (JSON)" onPress={onExport} />
            <Button title="Importer (JSON)" variant="ghost" onPress={onImport} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Confidentialité</Text>
          <Text variant="muted" style={{ marginTop: 6 }}>
            Zéro compte. Zéro appel API. Base SQLite locale.
          </Text>
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
});
