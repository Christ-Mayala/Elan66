import React, { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Enter } from '../../../core/ui/Enter';
import { Text } from '../../../core/ui/Text';
import { Button } from '../../../core/ui/Button';
import { Card } from '../../../core/ui/Card';
import { theme } from '../../../core/theme/theme';
import { DisciplineMode, GOLD_STANDARD_DAYS, PHASE_LENGTH_DAYS, nudge66Text } from '../../../core/utils/constants';
import { addDaysLocal, clamp, fromLocalDateId, toLocalDateId } from '../../../core/utils/dateUtils';
import { clampInt, nonEmpty } from '../../../core/utils/validation';
import { useHabits } from '../context/HabitsContext';
import { Segmented } from '../../notes/components/segmented';
import { NotepadInput } from '../../../core/ui/NotepadInput';
import { LinearGradient } from 'expo-linear-gradient';

const presetDurations = [30, 66, 90];

export function CreateHabitScreen({ navigation }) {
  const { createNewHabit, state } = useHabits();

  const descRef = useRef(null);
  const sosRef = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [replacement, setReplacement] = useState('');
  const [commitment, setCommitment] = useState('');
  const [durationDays, setDurationDays] = useState(String(GOLD_STANDARD_DAYS));
  const [disciplineMode, setDisciplineMode] = useState(DisciplineMode.soft);

  const durationValue = useMemo(() => clampInt(durationDays, 7, 365), [durationDays]);
  const today = useMemo(() => toLocalDateId(new Date()), []);
  const endDate = useMemo(() => {
    const dateId = addDaysLocal(today, Math.max(0, durationValue - 1));
    return fromLocalDateId(dateId).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [today, durationValue]);

  const phase3Start = useMemo(() => {
    const d = clamp(durationValue, 7, 365);
    const p2 = Math.min(PHASE_LENGTH_DAYS * 2, d);
    return Math.min(d, p2 + 1);
  }, [durationValue]);

  const onSubmit = async () => {
    if (!nonEmpty(name)) {
      Alert.alert('Nom requis', "Donne un nom simple et clair à ton habitude.");
      return;
    }

    const wantsShort = durationValue < GOLD_STANDARD_DAYS;

    const proceed = async () => {
      const habit = await createNewHabit({
        name,
        description,
        replacement,
        commitment,
        disciplineMode,
        durationDays: durationValue,
      });
      navigation.replace('HabitDetail', { habitId: habit.id });
    };

    if (wantsShort) {
      Alert.alert(
          'Durée recommandée : 66 jours',
          nudge66Text,
          [
            { text: 'Garder 66 jours', style: 'default', onPress: () => setDurationDays(String(GOLD_STANDARD_DAYS)) },
            { text: 'Continuer', style: 'destructive', onPress: proceed },
          ],
          { cancelable: false }
      );
      return;
    }

    await proceed();
  };

  return (
      <Screen style={styles.screen}>
        <Enter style={styles.enter}>
          <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
          >
            {/* En-tête */}
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={10}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              </Pressable>
              <View style={styles.headerTitle}>
                <Text variant="muted" style={styles.headerSubtitle}>Nouvelle habitude</Text>
                <Text variant="display" style={styles.headerMainTitle}>Créer une habitude</Text>
              </View>
              <View style={styles.durationPill}>
                <Ionicons name="calendar" size={16} color={theme.colors.accent} />
                <Text variant="mono" style={styles.durationText}>{durationValue} jours</Text>
              </View>
            </View>

            {/* Carte d'aperçu corrigée (sans la section Progression) */}
            <Card style={styles.heroCard}>
              <LinearGradient
                  colors={['rgba(139, 92, 246, 0.1)', 'rgba(34, 211, 238, 0.05)']}
                  style={styles.heroGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroHeader}>
                  <Text variant="subtitle" style={styles.heroTitle}>Aperçu de l'habitude</Text>
                  <View style={styles.heroBadge}>
                    <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
                    <Text variant="caption" style={styles.heroBadgeText}>Nouvelle</Text>
                  </View>
                </View>

                <Text variant="muted" style={styles.heroSubtitle}>
                  Fin estimée : <Text style={styles.heroDate}>{endDate}</Text>
                </Text>

                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconLabel}>
                      <Ionicons name="settings" size={16} color={theme.colors.textMuted} />
                      <Text variant="muted" style={styles.infoLabel}>Mode</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {disciplineMode === DisciplineMode.strict ? 'Stricte' : 'Douce'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoIconLabel}>
                      <Ionicons name="stats-chart" size={16} color={theme.colors.textMuted} />
                      <Text variant="muted" style={styles.infoLabel}>Phase 3</Text>
                    </View>
                    <Text style={styles.infoValue}>à partir du jour {phase3Start}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoIconLabel}>
                      <Ionicons name="time" size={16} color={theme.colors.textMuted} />
                      <Text variant="muted" style={styles.infoLabel}>Durée</Text>
                    </View>
                    <Text style={styles.infoValue}>{durationValue} jours</Text>
                  </View>
                </View>
              </LinearGradient>
            </Card>

            {/* Carte "Nom de l'habitude" */}
            <Card style={styles.card}>
              <Text variant="subtitle" style={styles.cardTitle}>Nom de l'habitude</Text>
              <Text variant="muted" style={styles.cardSubtitle}>
                Un nom clair et actionnable.
              </Text>
              <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex : Arrêter le sucre"
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.textInput}
                  returnKeyType="next"
                  onSubmitEditing={() => descRef.current?.focus()}
              />

              <View style={styles.inputGroup}>
                <Text variant="muted" style={styles.inputLabel}>Habitude de remplacement</Text>
                <TextInput
                    value={replacement}
                    onChangeText={setReplacement}
                    placeholder="Ex : Boire un verre d'eau"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.textInput}
                />
              </View>
            </Card>

            {/* Carte "Contexte" */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text-outline" size={20} color={theme.colors.accent} />
                <Text variant="subtitle" style={styles.cardTitle}>Contexte</Text>
              </View>
              <Text variant="muted" style={styles.cardSubtitle}>
                Déclencheurs, situations, motivations.
              </Text>
              <NotepadInput
                  ref={descRef}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Décris le contexte, les enjeux, les déclencheurs..."
                  minHeight={180}
                  style={styles.notepadInput}
              />
            </Card>

            {/* Carte "Phrase d'engagement" */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="heart" size={20} color={theme.colors.accent} />
                <Text variant="subtitle" style={styles.cardTitle}>Phrase d'engagement</Text>
              </View>
              <Text variant="muted" style={styles.cardSubtitle}>
                Une phrase courte pour te motiver et te ramener au contrôle.
              </Text>
              <NotepadInput
                  ref={sosRef}
                  value={commitment}
                  onChangeText={setCommitment}
                  placeholder="Ex : Je mérite une vie plus saine et équilibrée."
                  minHeight={160}
                  style={styles.notepadInput}
              />
            </Card>

            {/* Carte "Durée & Discipline" */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="time-outline" size={20} color={theme.colors.accent} />
                <Text variant="subtitle" style={styles.cardTitle}>Durée & Discipline</Text>
              </View>
              <Text variant="muted" style={styles.cardSubtitle}>
                Durée recommandée : {GOLD_STANDARD_DAYS} jours.
              </Text>

              <View style={styles.inputGroup}>
                <Text variant="muted" style={styles.inputLabel}>Durée (jours)</Text>
                <TextInput
                    value={String(durationDays)}
                    onChangeText={setDurationDays}
                    keyboardType="number-pad"
                    style={styles.textInput}
                />
              </View>

              <View style={styles.presetsContainer}>
                {presetDurations.map((d) => {
                  const active = Number(durationValue) === d;
                  return (
                      <Pressable
                          key={String(d)}
                          onPress={() => setDurationDays(String(d))}
                          style={[styles.presetChip, active && styles.presetChipActive]}
                      >
                        <Text variant="mono" style={[styles.presetText, active && styles.presetTextActive]}>
                          {d} j
                        </Text>
                      </Pressable>
                  );
                })}
              </View>

              <View style={styles.inputGroup}>
                <Text variant="muted" style={styles.inputLabel}>Discipline</Text>
                <View style={styles.segmentedContainer}>
                  <Segmented
                      value={disciplineMode}
                      options={[
                        { value: DisciplineMode.soft, label: 'Douce' },
                        { value: DisciplineMode.strict, label: 'Stricte' },
                      ]}
                      onChange={setDisciplineMode}
                  />
                </View>
              </View>

              <Button
                  title={state.isBusy ? 'Création en cours...' : 'Créer mon habitude'}
                  disabled={state.isBusy || !nonEmpty(name)}
                  onPress={onSubmit}
                  style={styles.createButton}
                  gradient
                  gradientColors={[theme.colors.accent, theme.colors.accent2]}
              />
            </Card>
          </ScrollView>
        </Enter>
      </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  enter: {
    flex: 1,
  },
  scrollContainer: {
    gap: 12,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,      // 22 → 16 (comme actionButton sur Home)
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface2, // Uniformisation
    borderWidth: 1,
    borderColor: theme.colors.border,      // Uniformisation
    ...theme.shadow.sm,    // Ajout d'une ombre légère
  },
  headerTitle: {
    flex: 1,
    marginLeft: 14,        // Augmenté de 10 à 14
  },
  headerSubtitle: {
    fontSize: 13,          // Légèrement réduit
    opacity: 0.7,
    letterSpacing: 0.3,
  },
  headerMainTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.6,   // Ajouté pour correspondre au style
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.12)', // Teinte accent
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',    // Border accent
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
  },

  // Carte hero - alignée avec les cartes du HomeScreen
  heroCard: {
    borderRadius: theme.radius.xl,   // 20 → theme.radius.xl
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,                  // Ajouté
    borderColor: theme.colors.border, // Ajouté
    backgroundColor: theme.colors.surface2, // Ajouté
    ...theme.shadow.card,            // Utilisation de shadow standard
  },
  heroGradient: {
    padding: 20,                     // 24 → 20
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,                // 16 → 12
  },
  heroTitle: {
    fontSize: 17,                    // 18 → 17
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,                // 12 → 10
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  heroBadgeText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  heroSubtitle: {
    fontSize: 14,
    marginBottom: 16,                // 20 → 16
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  heroDate: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  infoContainer: {
    gap: 10,                         // 12 → 10
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,             // 14 → 12
    paddingHorizontal: 14,           // 16 → 14
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // Réduit l'opacité
    borderWidth: 1,
    borderColor: theme.colors.border, // Uniformisation
  },
  infoIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },

  // Cartes standard - alignées avec HomeScreen
  card: {
    padding: 18,                     // 20 → 18
    borderRadius: theme.radius.xl,   // 20 → theme.radius.xl
    borderWidth: 1,
    borderColor: theme.colors.border, // Uniformisation
    backgroundColor: theme.colors.surface2, // Ajouté
    marginBottom: 16,
    ...theme.shadow.card,            // Utilisation de shadow standard
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,                // 12 → 10
  },
  cardTitle: {
    fontSize: 17,                    // 18 → 17
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 14,                // 16 → 14
    lineHeight: 18,
  },

  // Inputs - alignés avec le style général
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border, // Uniformisation
    paddingHorizontal: 14,           // 16 → 14
    paddingVertical: 13,             // 14 → 13
    color: theme.colors.text,
    fontSize: 16,
    marginTop: 12,
    ...theme.shadow.input,           // Ajout si défini dans theme
  },
  inputGroup: {
    marginTop: 14,                   // 16 → 14
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  notepadInput: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border, // Uniformisation
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // Réduit l'opacité
  },

  // Presets - alignés avec les chips du HomeScreen
  presetsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,                   // 16 → 14
  },
  presetChip: {
    flex: 1,
    height: 44,                      // 48 → 44
    borderRadius: 14,                // 16 → 14
    borderWidth: 1,
    borderColor: theme.colors.border, // Uniformisation
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.sm,              // Ajout d'ombre légère
  },
  presetChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  presetText: {
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  presetTextActive: {
    color: theme.colors.black,
    fontWeight: '600',
  },

  // Segmented - espacement ajusté
  segmentedContainer: {
    marginTop: 10,                   // 12 → 10
  },

  // Bouton de création - aligné avec les boutons du HomeScreen
  createButton: {
    marginTop: 22,                   // 24 → 22
    borderRadius: 12,
    height: 54,                      // Hauteur définie
    ...theme.shadow.lg,              // Ombre plus prononcée
  },
});
