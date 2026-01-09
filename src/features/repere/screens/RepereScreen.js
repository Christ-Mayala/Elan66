import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Enter } from '../../../core/ui/Enter';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { Button } from '../../../core/ui/Button';
import { theme } from '../../../core/theme/theme';
import { QUOTES, quotesCount, randomQuote } from '../../../core/services/quotesData';

const pickMany = (n) => {
  const total = QUOTES.length;
  if (!total) return [];
  const out = [];
  const used = new Set();
  for (let i = 0; i < Math.min(n, total); i++) {
    for (let t = 0; t < 20; t++) {
      const idx = Math.floor(Math.random() * total);
      if (used.has(idx)) continue;
      used.add(idx);
      out.push(QUOTES[idx]);
      break;
    }
  }
  return out.map((q) => ({ author: String(q.author || ''), text: String(q.text || '') }));
};

export function RepereScreen({ navigation }) {
  const [seed, setSeed] = useState(0);

  const main = useMemo(() => randomQuote(), [seed]);
  const extra = useMemo(() => pickMany(3), [seed]);

  return (
    <Screen>
      <Enter style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <View style={styles.avatar}>
              <Ionicons name="compass" size={18} color={theme.colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="muted">Rituels</Text>
              <Text variant="display">Répère</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="sparkles" size={16} color={theme.colors.textMuted} />
              <Text variant="mono">{quotesCount()}</Text>
            </View>
          </View>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <View style={styles.heroHeader}>
              <View style={[styles.heroIcon, { backgroundColor: 'rgba(139,92,246,0.14)' }]}>
                <Ionicons name="sparkles" size={18} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle">Citation du moment</Text>
                <Text variant="muted" style={{ marginTop: 2 }}>
                  Une pensée courte pour orienter ta journée.
                </Text>
              </View>
              <Pressable onPress={() => setSeed((s) => s + 1)} style={styles.iconBtn} hitSlop={10}>
                <Ionicons name="refresh" size={18} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={{ padding: theme.spacing.m, paddingTop: 0, gap: 12 }}>
              {main ? (
                <View style={styles.quoteBox}>
                  <Text style={styles.quoteText}>{main.text}</Text>
                  <Text variant="muted" style={{ marginTop: 10 }}>
                    — {main.author}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Ionicons name="information-circle-outline" size={18} color={theme.colors.textMuted} />
                  <Text variant="muted" style={{ flex: 1 }}>
                    Aucune citation chargée.
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Régler les notifications"
                    onPress={() => navigation.navigate('Settings')}
                    variant="ghost"
                    icon="notifications-outline"
                  />
                </View>
              </View>
            </View>
          </Card>

          <Card>
            <Text variant="subtitle">Rituel du matin (2 min)</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Pour choisir l'intention avant que la journée te choisisse.
            </Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, { backgroundColor: theme.colors.accent }]} />
                <Text style={{ flex: 1 }}>Lis la citation lentement une seconde fois.</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, { backgroundColor: theme.colors.accent2 }]} />
                <Text style={{ flex: 1 }}>Une phrase d'action : « Aujourd'hui je… »</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, { backgroundColor: theme.colors.warn }]} />
                <Text style={{ flex: 1 }}>Un piège à éviter : « Je ne négocie pas avec… »</Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text variant="subtitle">Rituel du soir (2 min)</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Pour clôturer la journée sans te juger, et préparer demain.
            </Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, { backgroundColor: '#10B981' }]} />
                <Text style={{ flex: 1 }}>Qu'est-ce que j'ai bien fait aujourd'hui ?</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, { backgroundColor: theme.colors.warn }]} />
                <Text style={{ flex: 1 }}>Qu'est-ce que j'améliore demain (simple) ?</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, { backgroundColor: theme.colors.accent }]} />
                <Text style={{ flex: 1 }}>Une gratitude : « Merci pour… »</Text>
              </View>
            </View>
          </Card>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <View style={styles.heroHeader}>
              <View style={[styles.heroIcon, { backgroundColor: 'rgba(34,211,238,0.14)' }]}>
                <Ionicons name="library" size={18} color={theme.colors.accent2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle">À lire ensuite</Text>
                <Text variant="muted" style={{ marginTop: 2 }}>
                  Trois citations, choisies au hasard.
                </Text>
              </View>
            </View>

            <View style={{ padding: theme.spacing.m, paddingTop: 0, gap: 10 }}>
              {extra.length === 0 ? <Text variant="muted">—</Text> : null}
              {extra.map((q, i) => (
                <View key={`${q.author}-${i}`} style={styles.miniQuote}>
                  <Text numberOfLines={2} style={{ flex: 1, lineHeight: 20 }}>
                    {q.text}
                  </Text>
                  <Text variant="muted" numberOfLines={1} style={{ marginTop: 8 }}>
                    — {q.author}
                  </Text>
                </View>
              ))}
              <Button title="Rafraîchir" onPress={() => setSeed((s) => s + 1)} icon="refresh" />
            </View>
          </Card>
        </ScrollView>
      </Enter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: theme.spacing.m,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quoteBox: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    padding: 14,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    fontWeight: '700',
  },
  emptyBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    padding: 14,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  miniQuote: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    padding: 12,
  },
});
