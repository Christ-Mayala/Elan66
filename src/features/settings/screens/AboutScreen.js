import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Enter } from '../../../core/ui/Enter';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { theme } from '../../../core/theme/theme';
import { BUILD_ID } from '../../../core/utils/buildInfo';

export function AboutScreen({ navigation }) {
  return (
    <Screen>
      <Enter style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 120 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={10}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text variant="muted">Projet</Text>
              <Text variant="display">À propos</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.textMuted} />
              <Text variant="mono">v{String(BUILD_ID || 'dev')}</Text>
            </View>
          </View>

          <Card>
            <Text variant="subtitle">Elan66</Text>
            <Text variant="muted" style={{ marginTop: 6, lineHeight: 18 }}>
              Elan66 est une application de transformation personnelle basée sur un défi de 66 jours.
              Tu crées des habitudes, tu valides tes journées, tu écris ton journal, et tu suis ta progression.
            </Text>
          </Card>

          <Card>
            <Text variant="subtitle">Ce que tu peux faire</Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              <Row icon="checkmark-circle" label="Check-in quotidien" value="✅ / ⚠️ / ❌" />
              <Row icon="document-text-outline" label="Journal" value="notes liées à chaque jour" />
              <Row icon="shield-checkmark" label="SOS" value="3 minutes pour revenir au contrôle" />
              <Row icon="compass" label="Répère" value="citations + rituels matin/soir" />
              <Row icon="stats-chart" label="Statistiques" value="streak, activité, progression" />
            </View>
          </Card>

          <Card>
            <Text variant="subtitle">Données & confidentialité</Text>
            <Text variant="muted" style={{ marginTop: 6, lineHeight: 18 }}>
              Aucune création de compte. Aucune API. Toutes les données sont stockées localement (SQLite).
              Export/Import JSON disponible pour sauvegarder et transférer.
            </Text>
          </Card>

          <Card>
            <Text variant="subtitle">Notifications</Text>
            <Text variant="muted" style={{ marginTop: 6, lineHeight: 18 }}>
              Les notifications (check-in quotidien + Répère) fonctionnent pleinement en dev build.
              Dans Expo Go, elles peuvent être limitées.
            </Text>
          </Card>
        </ScrollView>
      </Enter>
    </Screen>
  );
}

function Row({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="subtitle" numberOfLines={1}>
          {label}
        </Text>
        <Text variant="muted" numberOfLines={1} style={{ marginTop: 2 }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
