import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Card } from '../../../core/ui/Card';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';
import { getNoteById, softDeleteNote, updateNote } from '../data/notesRepo';

const insertAtCursor = (value, selection, insert) => {
  const start = selection?.start ?? value.length;
  const end = selection?.end ?? value.length;
  const next = value.slice(0, start) + insert + value.slice(end);
  const cursor = start + insert.length;
  return { next, selection: { start: cursor, end: cursor } };
};

export function NoteEditorScreen({ navigation, route }) {
  const id = route?.params?.id;
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(0);
  const [sel, setSel] = useState({ start: 0, end: 0 });
  const bodyRef = useRef(null);

  const canSave = useMemo(() => Boolean(id), [id]);

  const load = async () => {
    const n = await getNoteById(id);
    if (!n) return;
    setNote(n);
    setTitle(String(n.title || ''));
    setBody(String(n.body || ''));
    setPinned(Number(n.pinned) ? 1 : 0);
  };

  useEffect(() => {
    load();
  }, [id]);

  const save = async ({ silent = false } = {}) => {
    if (!canSave) return;
    await updateNote({ id, title, body, pinned });
    if (!silent) Alert.alert('OK', 'Enregistré.');
    Keyboard.dismiss();
    await load();
  };

  const onDelete = () => {
    Alert.alert('Supprimer', 'Supprimer cette note ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await softDeleteNote(id);
          navigation.goBack();
        },
      },
    ]);
  };

  const onInsert = (s) => {
    const res = insertAtCursor(body, sel, s);
    setBody(res.next);
    requestAnimationFrame(() => {
      setSel(res.selection);
      bodyRef.current?.focus?.();
    });
  };

  if (!note) {
    return (
      <Screen>
        <View style={{ paddingTop: 16 }}>
          <Text>Chargement…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </Pressable>
          <Text variant="subtitle" numberOfLines={1} style={{ flex: 1 }}>
            {title.trim() ? title.trim() : 'Note'}
          </Text>
          <Pressable onPress={() => setPinned((p) => (p ? 0 : 1))} style={styles.iconBtn}>
            <Ionicons name={pinned ? 'pin' : 'pin-outline'} size={18} color={pinned ? theme.colors.accent : theme.colors.textMuted} />
          </Pressable>
          <Pressable onPress={() => save()} style={styles.primaryBtn}>
            <Ionicons name="save" size={18} color={theme.colors.black} />
            <Text variant="subtitle" style={{ color: theme.colors.black }}>
              OK
            </Text>
          </Pressable>
        </View>

        <Card>
          <Text variant="muted">Titre</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titre…"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
        </Card>

        <Card style={{ padding: 0 }}>
          <View style={styles.toolbar}>
            <ToolButton label="#" onPress={() => onInsert('# ')} />
            <ToolButton label="##" onPress={() => onInsert('## ')} />
            <ToolButton label="•" onPress={() => onInsert('- ')} />
            <ToolButton label="☐" onPress={() => onInsert('- [ ] ')} />
            <ToolButton label=">" onPress={() => onInsert('> ')} />
            <ToolButton label="{}" onPress={() => onInsert('`code`')} />
          </View>
          <View style={{ padding: theme.spacing.m, paddingTop: 12 }}>
            <Text variant="muted">Contenu</Text>
            <TextInput
              ref={bodyRef}
              value={body}
              onChangeText={setBody}
              onSelectionChange={(e) => setSel(e.nativeEvent.selection)}
              selection={sel}
              placeholder="Écris ici…"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, styles.body]}
              multiline
              textAlignVertical="top"
              autoCorrect
            />
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="muted">Actions</Text>
            <Pressable onPress={onDelete} style={styles.dangerBtn}>
              <Ionicons name="trash" size={18} color={theme.colors.text} />
              <Text variant="subtitle">Supprimer</Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function ToolButton({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.toolBtn}>
      <Text variant="mono" style={{ color: theme.colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(15,26,51,0.55)',
  },
  primaryBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  dangerBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(251,113,133,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.35)',
  },
  toolbar: {
    flexDirection: 'row',
    gap: 8,
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: 'rgba(15,26,51,0.45)',
  },
  toolBtn: {
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface2,
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
  body: {
    minHeight: 260,
    lineHeight: 20,
  },
});
