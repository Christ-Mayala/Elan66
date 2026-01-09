import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Enter } from '../../../core/ui/Enter';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { Button } from '../../../core/ui/Button';
import { theme } from '../../../core/theme/theme';
import { AUTHORS, QUOTES, randomQuote } from '../../../core/services/quotesData';
import { DisciplineMode } from '../../../core/utils/constants';

const modeCopy = {
  [DisciplineMode.soft]: {
    title: 'Habitude douce',
    icon: 'heart',
    color: 'rgba(34,211,238,0.14)',
    text:
      "Douce = bienveillance + continuité. Tu avances sans te juger, tu reviens vite après un écart, et tu privilégies la constance plutôt que la perfection.",
  },
  [DisciplineMode.strict]: {
    title: 'Habitude stricte',
    icon: 'flash',
    color: 'rgba(245,158,11,0.14)',
    text:
      "Stricte = clarté + engagement. Tu évites la négociation interne, tu poses des règles simples, et tu protèges ta trajectoire même quand l'envie baisse.",
  },
};

export function RepereScreen() {
  const [picked, setPicked] = useState(0);
  const q = useMemo(() => randomQuote(), [picked]);

  const onNew = () => setPicked((x) => x + 1);

  return (
    <Screen>
      <Enter style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <View style={styles.avatar}>
              <Ionicons name="compass" size={18} color={theme.colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="muted">Rituels</Text>
              <Text variant="display">Répère</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="time" size={16} color={theme.colors.textMuted} />
              <Text variant="mono">Matin / Soir</Text>
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
                  À lire en 20 secondes.
                </Text>
              </View>
            </View>

            <View style={{ padding: theme.spacing.m, paddingTop: 0, gap: 12 }}>
              {q ? (
                <View style={styles.quoteBox}>
                  <Text style={styles.quoteText}>{q.text}</Text>
                  <Text variant="muted" style={{ marginTop: 10 }}>
                    — {q.author}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Ionicons name="information-circle-outline" size={18} color={theme.colors.textMuted} />
                  <Text variant="muted" style={{ flex: 1 }}>
                    Aucune citation chargée. Ton fichier fourni contient des auteurs, mais pas encore de citations.
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Button title="Nouvelle citation" onPress={onNew} disabled={!QUOTES.length} icon="refresh" />
                </View>
              </View>
            </View>
          </Card>

          <Card style={{ padding: 0 }}>
            <View style={styles.heroHeader}>
              <View style={[styles.heroIcon, { backgroundColor: 'rgba(34,211,238,0.14)' }]}>
                <Ionicons name="settings" size={18} color={theme.colors.accent2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle">Douce vs Stricte</Text>
                <Text variant="muted" style={{ marginTop: 2 }}>
                  Deux styles, un objectif : tenir.
                </Text>
              </View>
            </View>

            <View style={{ padding: theme.spacing.m, paddingTop: 0, gap: 10 }}>
              {[DisciplineMode.soft, DisciplineMode.strict].map((m) => (
                <View key={m} style={styles.modeRow}>
                  <View style={[styles.modeIcon, { backgroundColor: modeCopy[m].color }]}>
                    <Ionicons name={modeCopy[m].icon} size={18} color={theme.colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="subtitle">{modeCopy[m].title}</Text>
                    <Text variant="muted" style={{ marginTop: 4, lineHeight: 18 }}>
                      {modeCopy[m].text}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          <Card>
            <Text variant="subtitle">Auteurs (liste)</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Les citations seront associées à ces auteurs dès que le fichier de citations sera fourni.
            </Text>
            <View style={{ marginTop: 12, gap: 8 }}>
              {(AUTHORS || []).slice(0, 18).map((a) => (
                <View key={a} style={styles.authorRow}>
                  <Ionicons name="person" size={16} color={theme.colors.textMuted} />
                  <Text style={{ flex: 1 }}>{a}</Text>
                </View>
              ))}
              {(AUTHORS || []).length > 18 ? (
                <Text variant="muted" style={{ marginTop: 4 }}>
                  + {(AUTHORS || []).length - 18} autres
                </Text>
              ) : null}
            </View>
          </Card>

          <View style={{ height: 8 }} />
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
    fontWeight: '600',
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
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
  },
  modeIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  authorRow: {
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
});
