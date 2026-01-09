import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Enter } from '../../../core/ui/Enter';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { Button } from '../../../core/ui/Button';
import { theme } from '../../../core/theme/theme';
import { exportAllDataToJson, importAllDataFromJson } from '../../../core/services/exportImport';
import { domainErrorMessageFr } from '../../../core/utils/domainErrors';
import {
  configureNotifications,
  getDailyReminderTime,
  getNotifPermissions,
  requestNotifPermissions,
  setDailyReminderTime,
  syncDailyCheckinsForHabits,
} from '../../../core/services/notifications';
import { isExpoGo } from '../../../core/utils/runtime';
import { useHabits } from '../../habits/context/HabitsContext';

export function SettingsScreen() {
  const { state, refreshHabits } = useHabits();

  const [hour, setHour] = useState('20');
  const [minute, setMinute] = useState('30');
  const [notifGranted, setNotifGranted] = useState(null);

  useEffect(() => {
    (async () => {
      const t = await getDailyReminderTime();
      setHour(String(t.hour));
      setMinute(String(t.minute).padStart(2, '0'));

      if (!isExpoGo()) {
        try {
          const p = await getNotifPermissions();
          setNotifGranted(Boolean(p?.granted || p?.ios?.status));
        } catch {}
      }
    })();
  }, []);

  const timePreview = useMemo(() => {
    const h = String(Math.max(0, Math.min(23, Number(hour) || 0))).padStart(2, '0');
    const m = String(Math.max(0, Math.min(59, Number(minute) || 0))).padStart(2, '0');
    return `${h}:${m}`;
  }, [hour, minute]);

  const onEnableNotifs = async () => {
    if (isExpoGo()) {
      Alert.alert('Indisponible', 'Dans Expo Go, les notifications sont limitées. Utilise un dev build pour activer totalement.');
      return;
    }
    try {
      await configureNotifications();
      const p = await requestNotifPermissions();
      const granted = Boolean(p?.granted || p?.ios?.status);
      setNotifGranted(granted);
      if (!granted) {
        Alert.alert('Autorisation requise', 'Active les notifications dans les réglages système du téléphone.');
        return;
      }
      Alert.alert('OK', 'Notifications activées.');
    } catch (e) {
      Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const onSaveTime = async () => {
    try {
      const t = await setDailyReminderTime({ hour, minute });
      if (!isExpoGo()) {
        await configureNotifications();
        const p = await requestNotifPermissions();
        const granted = Boolean(p?.granted || p?.ios?.status);
        setNotifGranted(granted);
        if (granted) {
          await syncDailyCheckinsForHabits(state.habits);
          Alert.alert('OK', `Rappel quotidien : ${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`);
          return;
        }
        Alert.alert('Autorisation requise', `Heure enregistrée (${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}). Active les notifications dans les réglages système.`);
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
    Alert.alert('Importer', 'Cette opération remplace toutes les données locales. Assure-toi de faire un export avant.', [
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
    ]);
  };

  return (
    <Screen>
      <Enter style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.avatar}>
            <Ionicons name="settings" size={18} color={theme.colors.textMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="muted">Système</Text>
            <Text variant="display">Réglages</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="time" size={16} color={theme.colors.textMuted} />
            <Text variant="mono">{timePreview}</Text>
          </View>
        </View>

        <Card style={{ padding: 0 }}>
          <View style={styles.blockHeader}>
            <View style={[styles.blockIcon, { backgroundColor: 'rgba(34,211,238,0.14)' }]}>
              <Ionicons name="notifications" size={18} color={theme.colors.accent2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">Notifications</Text>
              <Text variant="muted" style={{ marginTop: 2 }}>
                Rappel quotidien (local){notifGranted === null ? '' : notifGranted ? ' · activées' : ' · désactivées'}
              </Text>
            </View>
          </View>

          <View style={{ padding: theme.spacing.m, paddingTop: 0, gap: 12 }}>
            {isExpoGo() ? (
              <View style={styles.warning}>
                <Ionicons name="warning" size={16} color={theme.colors.warn} />
                <Text variant="muted" style={{ flex: 1, color: theme.colors.warn }}>
                  Dans Expo Go, les notifications sont limitées. Utilise un dev build pour activer totalement.
                </Text>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text variant="muted">Heure</Text>
                <TextInput value={hour} onChangeText={setHour} keyboardType="number-pad" style={styles.input} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="muted">Minute</Text>
                <TextInput value={minute} onChangeText={setMinute} keyboardType="number-pad" style={styles.input} />
              </View>
            </View>

            <View style={{ gap: 10 }}>
              <Button title="Activer les notifications" variant="ghost" onPress={onEnableNotifs} />
              <Button title="Enregistrer" onPress={onSaveTime} />
            </View>
          </View>
        </Card>

        <Card style={{ padding: 0 }}>
          <View style={styles.blockHeader}>
            <View style={[styles.blockIcon, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
              <Ionicons name="star" size={18} color={theme.colors.warn} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">Important</Text>
              <Text variant="muted" style={{ marginTop: 2 }}>
                Mets une habitude en ★ pour la remonter en haut.
              </Text>
            </View>
          </View>

          <View style={{ padding: theme.spacing.m, paddingTop: 0, gap: 10 }}>
            <View style={styles.rowInfo}>
              <Text variant="muted" style={{ flex: 1 }}>
                Tu peux activer ★ dans le détail d'une habitude.
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </View>
          </View>
        </Card>

        <Card style={{ padding: 0 }}>
          <View style={styles.blockHeader}>
            <View style={[styles.blockIcon, { backgroundColor: 'rgba(139,92,246,0.14)' }]}>
              <Ionicons name="cloud-offline" size={18} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">Sauvegarde</Text>
              <Text variant="muted" style={{ marginTop: 2 }}>
                Export / import JSON. Aucun cloud.
              </Text>
            </View>
          </View>

          <View style={{ padding: theme.spacing.m, paddingTop: 0, gap: 10 }}>
            <Pressable onPress={onExport} style={styles.rowLink}>
              <View style={[styles.rowIcon, { backgroundColor: 'rgba(34,211,238,0.14)' }]}>
                <Ionicons name="download" size={18} color={theme.colors.accent2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle">Exporter</Text>
                <Text variant="muted" numberOfLines={1}>
                  Créer un fichier JSON
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>

            <Pressable onPress={onImport} style={[styles.rowLink, styles.rowDanger]}>
              <View style={[styles.rowIcon, { backgroundColor: 'rgba(239,68,68,0.14)' }]}>
                <Ionicons name="upload" size={18} color={theme.colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle">Importer</Text>
                <Text variant="muted" numberOfLines={1}>
                  Remplacer toutes les données
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </View>
        </Card>

        <Card style={{ padding: 0 }}>
          <View style={styles.blockHeader}>
            <View style={[styles.blockIcon, { backgroundColor: 'rgba(241,245,249,0.08)' }]}>
              <Ionicons name="lock-closed" size={18} color={theme.colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">Confidentialité</Text>
              <Text variant="muted" style={{ marginTop: 2 }}>
                Zéro compte. Zéro appel API. Base SQLite locale.
              </Text>
            </View>
          </View>

          <View style={{ padding: theme.spacing.m, paddingTop: 0, gap: 10 }}>
            <View style={styles.rowInfo}>
              <Text variant="muted" style={{ flex: 1 }}>
                Tes données restent sur ton téléphone.
              </Text>
              <Ionicons name="shield-checkmark" size={18} color={theme.colors.accent2} />
            </View>
          </View>
        </Card>
        </ScrollView>
      </Enter>
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
    alignItems: 'center',
    justifyContent: 'center',
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
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: theme.spacing.m,
  },
  blockIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  warning: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.30)',
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
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
  rowLink: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
  },
  rowDanger: {
    borderColor: 'rgba(239,68,68,0.22)',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowInfo: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
  },
});
