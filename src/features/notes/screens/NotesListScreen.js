import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { animateNext, enableLayoutAnimation } from '../../../core/utils/layoutAnim';
import { Screen } from '../../../core/ui/Screen';
import { Enter } from '../../../core/ui/Enter';
import { Card } from '../../../core/ui/Card';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';
import { createNote, listNotes, softDeleteNote, updateNote } from '../data/notesRepo';

const previewText = (s) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > 120 ? `${t.slice(0, 120)}…` : t;
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
      <Enter style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.avatar}>
            <Ionicons name="book" size={18} color={theme.colors.textMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="muted">Bloc-notes</Text>
            <Text variant="display">Journal</Text>
          </View>
          <Pressable onPress={onNew} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name="add" size={20} color={theme.colors.black} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={theme.colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Rechercher…"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {q ? (
            <Pressable onPress={() => setQ('')} hitSlop={10}>
              <Ionicons name="close" size={18} color={theme.colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {filtered.length === 0 ? (
          <Card>
            <Text variant="subtitle">Aucune note</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Crée ta première note. Structure avec titres, listes et checklists.
            </Text>

            <View style={{ marginTop: 12, gap: 8 }}>
              <View style={styles.tipRow}>
                <Text style={styles.tipKey}>#</Text>
                <Text variant="muted">Titre</Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipKey}>-</Text>
                <Text variant="muted">Liste</Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipKey}>- [ ]</Text>
                <Text variant="muted">Checklist</Text>
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              <Pressable onPress={onNew} style={styles.primaryInline}>
                <Text variant="subtitle" style={{ color: theme.colors.black }}>
                  Créer une note
                </Text>
              </Pressable>
            </View>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map((n) => (
              <Pressable key={n.id} onPress={() => onOpen(n.id)} style={styles.noteRow}>
                <View style={[styles.noteIcon, n.pinned ? styles.noteIconPinned : null]}>
                  <Ionicons name={n.pinned ? 'pin' : 'document-text'} size={18} color={n.pinned ? theme.colors.black : theme.colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle" numberOfLines={1}>
                    {String(n.title || 'Sans titre')}
                  </Text>
                  <Text variant="muted" numberOfLines={1} style={{ marginTop: 4 }}>
                    {previewText(n.body)}
                  </Text>
                  <Text variant="mono" style={{ marginTop: 8 }}>
                    Modifié: {String(n.updated_at || '').slice(0, 16).replace('T', ' ')}
                  </Text>
                </View>

                <View style={{ gap: 10, alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Pressable onPress={() => onTogglePin(n)} hitSlop={12}>
                    <Ionicons name={n.pinned ? 'pin' : 'pin-outline'} size={18} color={n.pinned ? theme.colors.accent : theme.colors.textMuted} />
                  </Pressable>
                  <Pressable onPress={() => onDelete(n)} hitSlop={12}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}
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
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    ...theme.shadow.card,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    paddingVertical: 0,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
  },
  tipKey: {
    width: 64,
    textAlign: 'center',
    color: theme.colors.text,
    fontWeight: '800',
  },
  primaryInline: {
    paddingVertical: 12,
    borderRadius: theme.radius.l,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
  noteRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 14,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(241,245,249,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noteIconPinned: {
    backgroundColor: theme.colors.accent,
    borderColor: 'rgba(255,255,255,0.10)',
  },
});
