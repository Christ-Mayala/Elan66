import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Enter } from '../../../core/ui/Enter';
import { Card } from '../../../core/ui/Card';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';
import { getNoteById, softDeleteNote, updateNote } from '../data/notesRepo';
import { NotePreview } from '../components/NotePreview';
import { Segmented } from '../components/segmented';
import { NotepadInput } from '../../../core/ui/NotepadInput';

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
  const [mode, setMode] = useState('edit');
  const bodyRef = useRef(null);
  const saveTimer = useRef(null);

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

  useEffect(() => {
    if (!canSave) return;
    if (!note) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateNote({ id, title, body, pinned });
    }, 650);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, body, pinned, canSave, id, note]);

  const onBack = async () => {
    try {
      await updateNote({ id, title, body, pinned });
    } catch {}
    navigation.goBack();
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
    if (mode !== 'edit') setMode('edit');
    const res = insertAtCursor(body, sel, s);
    setBody(res.next);
    requestAnimationFrame(() => {
      setSel(res.selection);
      bodyRef.current?.focus?.();
    });
  };

  const toggleTaskAtLine = (lineIndex) => {
    const lines = String(body || '').replace(/\r\n/g, '\n').split('\n');
    const l = String(lines[lineIndex] || '');
    const m = l.match(/^-\s\[( |x|X)\]\s+(.*)$/);
    if (!m) return;
    const checked = String(m[1]).toLowerCase() === 'x';
    lines[lineIndex] = `- [${checked ? ' ' : 'x'}] ${m[2]}`;
    setBody(lines.join('\n'));
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
      <Enter style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </Pressable>
          <Text variant="subtitle" numberOfLines={1} style={{ flex: 1 }}>
            {title.trim() ? title.trim() : 'Note'}
          </Text>
          <Pressable onPress={() => setPinned((p) => (p ? 0 : 1))} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name={pinned ? 'pin' : 'pin-outline'} size={18} color={pinned ? theme.colors.accent : theme.colors.textMuted} />
          </Pressable>
          <Pressable onPress={() => save()} style={styles.primaryBtn} hitSlop={10}>
            <Ionicons name="save" size={18} color={theme.colors.black} />
            <Text variant="subtitle" style={{ color: theme.colors.black }}>
              OK
            </Text>
          </Pressable>
        </View>

        <Card>
          <Text variant="subtitle">Titre</Text>
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
            <View style={styles.toolsRow}>
              <ToolButton label="#" onPress={() => onInsert('# ')} />
              <ToolButton label="##" onPress={() => onInsert('## ')} />
              <ToolButton label="•" onPress={() => onInsert('- ')} />
              <ToolButton label="☐" onPress={() => onInsert('- [ ] ')} />
              <ToolButton label=">" onPress={() => onInsert('> ')} />
              <ToolButton label="{}" onPress={() => onInsert('`code`')} />
            </View>
            <View style={{ marginTop: 10 }}>
              <Segmented
                value={mode}
                options={[
                  { value: 'edit', label: 'Éditer' },
                  { value: 'preview', label: 'Aperçu' },
                ]}
                onChange={setMode}
              />
            </View>
          </View>
          <View style={{ padding: theme.spacing.m, paddingTop: 12 }}>
            <Text variant="subtitle">Contenu</Text>
            {mode === 'edit' ? (
              <NotepadInput
                ref={bodyRef}
                value={body}
                onChangeText={setBody}
                onSelectionChange={(e) => setSel(e.nativeEvent.selection)}
                selection={sel}
                placeholder="Écris ici…"
                autoCorrect
                minHeight={260}
                style={{ marginTop: 12, ...theme.shadow.card }}
              />
            ) : (
              <View style={[styles.preview, styles.body]}>
                <NotePreview body={body} onToggleTaskAtLine={toggleTaskAtLine} />
              </View>
            )}
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="subtitle">Actions</Text>
            <Pressable onPress={onDelete} style={styles.dangerBtn} hitSlop={10}>
              <Ionicons name="trash" size={18} color={theme.colors.text} />
              <Text variant="subtitle">Supprimer</Text>
            </Pressable>
          </View>
        </Card>
        </ScrollView>
      </Enter>
    </Screen>
  );
}

function ToolButton({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.toolBtn} hitSlop={10}>
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
    backgroundColor: 'rgba(239,68,68,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.32)',
  },
  toolbar: {
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: 'rgba(15,26,51,0.45)',
  },
  toolsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toolBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
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
  preview: {
    marginTop: 12,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    padding: theme.spacing.m,
    ...theme.shadow.card,
  },
  body: { minHeight: 260 },
});
