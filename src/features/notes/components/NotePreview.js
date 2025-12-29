import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';

const parse = (body) => {
  const lines = String(body || '').replace(/\r\n/g, '\n').split('\n');
  return lines.map((raw, idx) => {
    const line = String(raw || '');

    const h1 = line.match(/^#\s+(.*)$/);
    if (h1) return { type: 'h1', idx, text: h1[1] };

    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) return { type: 'h2', idx, text: h2[1] };

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) return { type: 'quote', idx, text: quote[1] };

    const task = line.match(/^-\s\[( |x|X)\]\s+(.*)$/);
    if (task) return { type: 'task', idx, checked: String(task[1]).toLowerCase() === 'x', text: task[2] };

    const bullet = line.match(/^-\s+(.*)$/);
    if (bullet) return { type: 'bullet', idx, text: bullet[1] };

    const code = line.match(/^```(.*)$/);
    if (code) return { type: 'fence', idx, text: code[1] };

    return { type: 'p', idx, text: line };
  });
};

export function NotePreview({ body, onToggleTaskAtLine }) {
  const items = useMemo(() => parse(body), [body]);

  return (
    <View style={{ gap: 10 }}>
      {items.map((it) => {
        if (it.type === 'h1') {
          return (
            <Text key={it.idx} style={styles.h1}>
              {it.text}
            </Text>
          );
        }

        if (it.type === 'h2') {
          return (
            <Text key={it.idx} style={styles.h2}>
              {it.text}
            </Text>
          );
        }

        if (it.type === 'quote') {
          return (
            <View key={it.idx} style={styles.quote}>
              <Text style={{ color: theme.colors.textMuted }}>{it.text}</Text>
            </View>
          );
        }

        if (it.type === 'task') {
          return (
            <Pressable key={it.idx} onPress={() => onToggleTaskAtLine?.(it.idx)} style={styles.taskRow}>
              <View style={[styles.checkbox, it.checked ? styles.checkboxOn : null]}>
                {it.checked ? <Ionicons name="checkmark" size={16} color={theme.colors.black} /> : null}
              </View>
              <Text style={[styles.taskText, it.checked ? styles.taskDone : null]}>{it.text}</Text>
            </Pressable>
          );
        }

        if (it.type === 'bullet') {
          return (
            <View key={it.idx} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={{ flex: 1 }}>{it.text}</Text>
            </View>
          );
        }

        if (it.type === 'p') {
          if (!String(it.text || '').trim()) return <View key={it.idx} style={{ height: 2 }} />;
          return (
            <Text key={it.idx} style={{ lineHeight: 22 }}>
              {it.text}
            </Text>
          );
        }

        return <View key={it.idx} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.1 },
  h2: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  quote: {
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
    paddingLeft: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(15,26,51,0.35)',
    borderRadius: 12,
  },
  taskRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: theme.colors.accent,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  taskText: { flex: 1 },
  taskDone: { opacity: 0.65, textDecorationLine: 'line-through' },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.accent, marginTop: 9 },
});
