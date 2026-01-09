import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../../core/ui/Screen';
import { Enter } from '../../../core/ui/Enter';
import { Card } from '../../../core/ui/Card';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';

export function StartScreen({ navigation, onDone }) {
  const go = async () => {
    await onDone?.();
    navigation.replace('Tabs');
  };

  return (
    <Screen>
      <Enter style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 14 }}>
            <View style={styles.heroTop}>
              <View style={styles.logo}>
                <Ionicons name="leaf" size={18} color={theme.colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="muted">Défi personnel</Text>
                <Text variant="display">Elan66</Text>
              </View>
            </View>

            <LinearGradient
              colors={['rgba(139,92,246,0.18)', 'rgba(34,211,238,0.08)', 'rgba(239,68,68,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <Text variant="subtitle" style={{ fontSize: 18 }}>
                66 jours.
              </Text>
              <Text variant="subtitle" style={{ fontSize: 18, marginTop: 2 }}>
                Une habitude.
              </Text>
              <Text variant="subtitle" style={{ fontSize: 18, marginTop: 2 }}>
                Une identité qui se construit.
              </Text>

              <Text variant="muted" style={{ marginTop: 12, lineHeight: 18 }}>
                Tu avances avec un check-in simple, un journal, et des rituels matin/soir.
              </Text>

              <View style={styles.pillsRow}>
                <Pill icon="notifications" label="Rappels" />
                <Pill icon="document-text-outline" label="Journal" />
                <Pill icon="compass" label="Répère" />
              </View>
            </LinearGradient>

            <Card>
              <Text variant="subtitle">Ce que tu fais ici</Text>
              <View style={{ marginTop: 12, gap: 10 }}>
                <Row icon="checkmark-circle" title="Valider ta journée" desc="✅ / ⚠️ / ❌" color={theme.colors.accent} />
                <Row icon="shield-checkmark" title="SOS" desc="3 minutes pour tenir" color={theme.colors.danger} />
                <Row icon="compass" title="Répère" desc="citations + rituels" color={theme.colors.accent2} />
                <Row icon="stats-chart" title="Progression" desc="stats + arbre" color={theme.colors.warn} />
              </View>
            </Card>

            <Card>
              <Text variant="subtitle">Confidentialité</Text>
              <Text variant="muted" style={{ marginTop: 6, lineHeight: 18 }}>
                Zéro compte. Zéro API. Données locales (SQLite). Export/Import JSON.
              </Text>
            </Card>
          </View>

          <View style={{ gap: 10, paddingTop: 14 }}>
            <Pressable onPress={go} style={styles.primary}>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.black} />
              <Text variant="subtitle" style={{ color: theme.colors.black }}>
                Commencer
              </Text>
            </Pressable>
            <Pressable onPress={() => navigation.replace('Tabs')} style={styles.ghost}>
              <Text variant="subtitle">Passer</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Enter>
    </Screen>
  );
}

function Pill({ icon, label }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={14} color={theme.colors.textMuted} />
      <Text variant="mono">{label}</Text>
    </View>
  );
}

function Row({ icon, title, desc, color }) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: String(color).replace(')', ',0.14)').replace('rgb', 'rgba') }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="subtitle">{title}</Text>
        <Text variant="muted" style={{ marginTop: 2 }}>
          {desc}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    overflow: 'hidden',
  },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  row: {
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
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  ghost: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
