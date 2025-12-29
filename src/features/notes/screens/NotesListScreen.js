import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { animateNext, enableLayoutAnimation } from '../../../core/utils/layoutAnim';
import { Screen } from '../../../core/ui/Screen';
import { Card } from '../../../core/ui/Card';
import { Chip } from '../../../core/ui/Chip';
import { Fab } from '../../../core/ui/Fab';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';
import { createNote, listNotes, softDeleteNote, updateNote } from '../data/notesRepo';

const previewText = (s) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (!t) return '—';
  return t.length > 110 ? `${t.slice(0, 110)}…` : t;
};

const fmt = (iso) => {
  const s = String(iso || '');
  if (!s) return '';
  return s.slice(0, 10);
};

export function NotesListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

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
    let list = items;
    if (filter === 'pinned') list = list.filter((n) => Number(n.pinned) === 1);
    if (!qq) return list;
    return list.filter((n) => String(n.title || '').toLowerCase().includes(qq) || String(n.body || '').toLowerCase().includes(qq));
  }, [items, q, filter]);

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
      <View style={{ flex: 1 }}>
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={{ gap: 12 }}>
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text variant="display">Journal</Text>
                  <Text variant="muted">Tout au même endroit. Propre. Privé.</Text>
                </View>
                <Pressable onPress={refresh} style={styles.iconBtn}>
                  <Ionicons name="refresh" size={18} color={theme.colors.text} />
                </Pressable>
              </View>

              <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color={theme.colors.textMuted} />
                <TextInput
                  value={q}
                  onChangeText={setQ}
                  placeholder="Rechercher une note…"
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {q ? (
                  <Pressable onPress={() => setQ('')} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
                  </Pressable>
                ) : null}
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Chip label="Toutes" selected={filter === 'all'} onPress={() => setFilter('all')} />
                <Chip
                  label="Épinglées"
                  selected={filter === 'pinned'}
                  onPress={() => setFilter('pinned')}
                  right={<Ionicons name="pin" size={14} color={filter === 'pinned' ? theme.colors.black : theme.colors.textMuted} />}
                />
              </View>

              {filtered.length === 0 ? (
                <Card>
                  <Text variant="subtitle">Aucune note</Text>
                  <Text variant="muted" style={{ marginTop: 6 }}>
                    Crée ta première note et utilise les checklists pour suivre tes idées.
                  </Text>
                  <View style={{ marginTop: 12 }}>
                    <Pressable onPress={onNew} style={styles.primaryInline}>
                      <Text variant="subtitle" style={{ color: theme.colors.black }}>
                        Créer une note
                      </Text>
                    </Pressable>
                  </View>
                </Card>
              ) : null}

              <Text variant="muted">{filtered.length} note(s)</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => onOpen(item.id)} style={{ flex: 1 }}>
              <Card style={styles.noteCard}>
                <View style={styles.noteTop}>
                  <Text variant="subtitle" numberOfLines={2} style={{ flex: 1 }}>
                    {String(item.title || 'Sans titre')}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Pressable onPress={() => onTogglePin(item)} hitSlop={10}>
                      <Ionicons
                        name={item.pinned ? 'pin' : 'pin-outline'}
                        size={16}
                        color={item.pinned ? theme.colors.accent : theme.colors.textMuted}
                      />
                    </Pressable>
                    <Pressable onPress={() => onDelete(item)} hitSlop={10}>
                      <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
                    </Pressable>
                  </View>
                </View>

                <Text variant="muted" style={{ marginTop: 10 }}>
                  {previewText(item.body)}
                </Text>

                <View style={styles.noteMeta}>
                  <Text variant="mono">{fmt(item.updated_at)}</Text>
                  <View style={styles.dot} />
                  <Text variant="mono">{item.pinned ? 'Pinned' : ' '}</Text>
                </View>
              </Card>
            </Pressable>
          )}
        />

        <Fab onPress={onNew} style={styles.fab} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, paddingBottom: 160 },
  row: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 2 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(15,26,51,0.55)',
  },
  searchWrap: {
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(15,26,51,0.55)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  primaryInline: {
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  noteCard: { minHeight: 160 },
  noteTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' },
  noteMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, opacity: 0.9 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.border },
  fab: { position: 'absolute', alignSelf: 'center', bottom: 98 },
});
