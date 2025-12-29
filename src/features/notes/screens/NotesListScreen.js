import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { animateNext, enableLayoutAnimation } from '../../../core/utils/layoutAnim';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Card } from '../../../core/ui/Card';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';
import { createNote, listNotes, softDeleteNote, updateNote } from '../data/notesRepo';

const previewText = (s) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > 140 ? `${t.slice(0, 140)}…` : t;
};

export function NotesListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');

  const refresh = async () => {
    const rows = await listNotes();
    animateNext();
    setItems(rows);
  };

  useEffect(() => {
    enableLayoutAnimation();
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const qq = String(q || '').trim().toLowerCase();
    if (!qq) return items;
    return items.filter((n) => String(n.title || '').toLowerCase().includes(qq) || String(n.body || '').toLowerCase().includes(qq));
  }, [items, q]);

  const onNew = async () => {
    const n = await createNote({ title: 'Nouvelle note', body: '' });
    await refresh();
    navigation.navigate('NoteEditor', { id: n.id });
  };

  const onOpen = (id) => navigation.navigate('NoteEditor', { id });

  const onDelete = (note) => {
    Alert.alert('Supprimer', 'Supprimer cette note ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await softDeleteNote(note.id);
          await refresh();
        },
      },
    ]);
  };

  const onTogglePin = async (note) => {
    await updateNote({ id: note.id, pinned: note.pinned ? 0 : 1 });
    await refresh();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="display">Journal</Text>
            <Text variant="muted">Bloc-notes privé. Structure avec titres, listes et checklists.</Text>
          </View>
          <Pressable onPress={onNew} style={styles.fabTop}>
            <Ionicons name="add" size={22} color={theme.colors.black} />
          </Pressable>
        </View>

        <Card>
          <View style={{ gap: 10 }}>
            <Text variant="subtitle">Rechercher</Text>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Titre ou contenu…"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </Card>

        {filtered.length === 0 ? (
          <Card>
            <Text variant="subtitle">Aucune note</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Crée ta première note. Tu peux utiliser:
            </Text>
            <Text style={{ marginTop: 10 }}>
              • # Titre
            </Text>
            <Text>
              • - Liste
            </Text>
            <Text>
              • - [ ] Checklist
            </Text>
            <View style={{ marginTop: 12 }}>
              <Pressable onPress={onNew} style={styles.primaryInline}>
                <Text variant="subtitle" style={{ color: theme.colors.black }}>
                  Créer une note
                </Text>
              </Pressable>
            </View>
          </Card>
        ) : (
          filtered.map((n) => (
            <Card key={n.id} style={styles.noteCard}>
              <Pressable onPress={() => onOpen(n.id)}>
                <View style={styles.noteTopRow}>
                  <Text variant="subtitle" numberOfLines={1}>
                    {String(n.title || 'Sans titre')}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Pressable onPress={() => onTogglePin(n)} hitSlop={10}>
                      <Ionicons name={n.pinned ? 'pin' : 'pin-outline'} size={18} color={n.pinned ? theme.colors.accent : theme.colors.textMuted} />
                    </Pressable>
                    <Pressable onPress={() => onDelete(n)} hitSlop={10}>
                      <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                    </Pressable>
                  </View>
                </View>
                <Text variant="muted" style={{ marginTop: 6 }}>
                  {previewText(n.body)}
                </Text>
                <Text variant="mono" style={{ marginTop: 10 }}>
                  Modifié: {String(n.updated_at || '').slice(0, 16).replace('T', ' ')}
                </Text>
              </Pressable>
            </Card>
          ))
        )}

        <View style={{ height: 6 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fabTop: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
  primaryInline: {
    paddingVertical: 12,
    borderRadius: theme.radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
  noteCard: { padding: 0 },
  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.m,
  },
});
