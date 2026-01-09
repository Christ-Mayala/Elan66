import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Enter } from '../../../core/ui/Enter';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { Button } from '../../../core/ui/Button';
import { NotepadInput } from '../../../core/ui/NotepadInput';
import { theme } from '../../../core/theme/theme';
import { addDaysLocal, diffDaysLocal, toLocalDateId } from '../../../core/utils/dateUtils';
import { getDiaryEntryByDate, listRecentDiaryEntries, upsertDiaryEntry } from '../data/diaryRepo';

export function DiaryScreen() {
  const today = toLocalDateId(new Date());

  const [dateId, setDateId] = useState(today);
  const [text, setText] = useState('');
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      const e = await getDiaryEntryByDate(dateId);
      setText(e?.text || '');
    })();
  }, [dateId]);

  useEffect(() => {
    (async () => {
      const r = await listRecentDiaryEntries(14);
      setRecent(r);
    })();
  }, [dateId]);

  const isToday = useMemo(() => dateId === today, [dateId, today]);
  const isFuture = useMemo(() => diffDaysLocal(dateId, today) > 0, [dateId, today]);

  const onSave = async () => {
    try {
      await upsertDiaryEntry({ dateId, text });
      const r = await listRecentDiaryEntries(14);
      setRecent(r);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer.');
    }
  };

  return (
    <Screen>
      <Enter style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.avatar}>
            <Ionicons name="book" size={18} color={theme.colors.textMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="muted">Écriture</Text>
            <Text variant="display">Journal</Text>
          </View>
        </View>

        <Text variant="muted">Court. Privé. Sans analyse automatique.</Text>

        <Card>
          <View style={styles.dateRow}>
            <Pressable onPress={() => setDateId(addDaysLocal(dateId, -1))} style={styles.dateBtn}>
              <Text>←</Text>
            </Pressable>
            <View style={{ alignItems: 'center' }}>
              <Text variant="subtitle">{dateId}</Text>
              <Text variant="muted">{isToday ? "Aujourd'hui" : ' '}</Text>
            </View>
            <Pressable disabled={isToday} onPress={() => setDateId(addDaysLocal(dateId, 1))} style={[styles.dateBtn, isToday ? styles.disabled : null]}>
              <Text>→</Text>
            </Pressable>
          </View>

          <NotepadInput
            value={text}
            onChangeText={setText}
            placeholder="Écrire sans filtre. Quelques lignes suffisent."
            editable={!isFuture}
            minHeight={220}
            style={{ marginTop: 12, ...theme.shadow.card }}
          />

          <View style={{ marginTop: 10 }}>
            <Button title="Enregistrer" disabled={isFuture} onPress={onSave} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Derniers jours</Text>
          <View style={{ marginTop: 10, gap: 10 }}>
            {recent.length === 0 ? (
              <Text variant="muted">Aucune entrée.</Text>
            ) : (
              recent.map((e) => (
                <Pressable key={e.id} onPress={() => setDateId(e.date)} style={styles.recentRow}>
                  <View style={{ flex: 1 }}>
                    <Text>{e.date}</Text>
                    <Text variant="muted" numberOfLines={1} style={{ marginTop: 4 }}>
                      {(e.text || '').trim() ? (e.text || '').trim() : '—'}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
  },
  recentRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabled: { opacity: 0.35 },
});
