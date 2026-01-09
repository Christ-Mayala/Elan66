import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Card } from '../../../core/ui/Card';
import { Button } from '../../../core/ui/Button';
import { NotepadInput } from '../../../core/ui/NotepadInput';
import { useHabits } from '../context/HabitsContext';
import { DayState, phaseCopy, DisciplineMode } from '../../../core/utils/constants';
import {
  addDaysLocal,
  dayIndexFromStart,
  toLocalDateId,
  clamp,
  phaseProgress,
  formatDate,
} from '../../../core/utils/dateUtils';
import { theme } from '../../../core/theme/theme';
import { domainErrorMessageFr } from '../../../core/utils/domainErrors';
import { HabitTimeline } from '../components/HabitTimeline';
import { DayPickerStrip } from '../components/DayPickerStrip';
import { PlantProgress } from '../components/PlantProgress';
import { SOSModal } from '../components/SOSModal';
import { LinearGradient } from 'expo-linear-gradient';
import { TabView, TabBar } from 'react-native-tab-view';

const { width: screenWidth } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Composant réutilisable pour les cartes de statistiques
const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, { borderColor: color + '20' }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text variant="title" style={styles.statValue}>{value}</Text>
      <Text variant="caption" style={styles.statLabel}>{label}</Text>
    </View>
);

// Composant amélioré pour les boutons d'état avec couleurs vives
const DayStateButton = ({ state, icon, label, color, disabled, onPress, isSelected }) => {
  const bgColor = isSelected ? color : color + '15';
  const textColor = isSelected ? '#FFFFFF' : color;
  const borderColor = isSelected ? color : color + '40';
  const iconColor = isSelected ? '#FFFFFF' : color;

  return (
      <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          style={[
            styles.stateButton,
            {
              borderColor: disabled ? theme.colors.border : borderColor,
              backgroundColor: disabled ? theme.colors.surface2 : bgColor,
            },
            disabled && styles.stateButtonDisabled,
            isSelected && styles.stateButtonSelected,
          ]}
          activeOpacity={0.7}
      >
        <View style={[
          styles.stateIcon,
          {
            backgroundColor: disabled ? theme.colors.surface2 : (isSelected ? 'rgba(255,255,255,0.2)' : color + '15')
          }
        ]}>
          <Ionicons
              name={icon}
              size={24}
              color={disabled ? theme.colors.textMuted : iconColor}
          />
        </View>
        <Text
            variant="caption"
            style={[
              styles.stateLabel,
              {
                color: disabled ? theme.colors.textMuted : textColor,
                fontWeight: isSelected ? '700' : '600'
              },
            ]}
        >
          {label}
        </Text>
        {isSelected && (
            <View style={[styles.selectedIndicator, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
        )}
      </TouchableOpacity>
  );
};

export function HabitDetailScreen({ route, navigation }) {
  const habitId = route.params?.habitId;
  const {
    getHabitDetail,
    setStateForDay,
    saveNoteForDay,
    recordSosToday,
    getSosEligibility,
    setImportant,
    archive,
    remove,
  } = useHabits();

  const [data, setData] = useState({ habit: null, logs: [] });
  const [note, setNote] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [sosVisible, setSosVisible] = useState(false);
  const [sosAlready, setSosAlready] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: 'overview', title: 'Aperçu' },
    { key: 'journal', title: 'Journal' },
    { key: 'stats', title: 'Stats' },
  ]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const today = toLocalDateId(new Date());

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    loadHabitDetail();
  }, [habitId]);

  const loadHabitDetail = async () => {
    try {
      const d = await getHabitDetail(habitId);
      setData(d);
      const idx = clamp(dayIndexFromStart(d.habit.start_date, today), 1, Number(d.habit.duration_days));
      setSelectedDayIndex(idx);
      const dateId = addDaysLocal(d.habit.start_date, idx - 1);
      const selLog = d.logs.find((l) => l.date === dateId);
      setNote(selLog?.note || '');
      navigation.setOptions({ title: d.habit?.name || 'Détail' });
    } catch (e) {
      Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const habit = data.habit;

  const todayDayIndex = useMemo(() => {
    if (!habit) return 1;
    return clamp(dayIndexFromStart(habit.start_date, today), 1, Number(habit.duration_days));
  }, [habit, today]);

  const selectedDateId = useMemo(() => {
    if (!habit) return today;
    return addDaysLocal(habit.start_date, (Number(selectedDayIndex) || 1) - 1);
  }, [habit, selectedDayIndex, today]);

  const selectedLog = useMemo(() => {
    return data.logs.find((l) => l.date === selectedDateId) || null;
  }, [data.logs, selectedDateId]);

  const notedLogs = useMemo(() => {
    if (!habit) return [];
    return (data.logs || [])
      .filter((l) => String(l?.note || '').trim())
      .slice()
      .sort((a, b) => String(b?.date || '').localeCompare(String(a?.date || '')));
  }, [data.logs, habit]);

  const phase = useMemo(() => phaseProgress(selectedDayIndex), [selectedDayIndex]);
  const todayPhase = useMemo(() => phaseProgress(todayDayIndex), [todayDayIndex]);

  const phaseInfo = phaseCopy[phase.phase];
  const phaseMessage = phaseInfo?.message?.[habit?.discipline_mode] || phaseInfo?.message?.soft || '';

  const isFutureSelected = Number(selectedDayIndex) > Number(todayDayIndex);
  const isTodaySelected = selectedDateId === today;
  const alreadyValidated = Boolean(selectedLog?.state);
  const sosPhase = todayPhase.phase;

  // Calcul des statistiques
  const stats = useMemo(() => {
    if (!data.logs.length) return null;
    const totalDays = data.logs.length;
    const successCount = data.logs.filter((l) => l.state === DayState.success).length;
    const resistedCount = data.logs.filter((l) => l.state === DayState.resisted).length;
    const failCount = data.logs.filter((l) => l.state === DayState.fail).length;
    const successRate = totalDays > 0 ? Math.round((successCount / totalDays) * 100) : 0;
    const currentStreak = calculateCurrentStreak(data.logs);

    return {
      successCount,
      resistedCount,
      failCount,
      successRate,
      currentStreak,
      totalDays,
    };
  }, [data.logs]);

  // Fonction pour calculer la série actuelle
  function calculateCurrentStreak(logs) {
    let streak = 0;
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

    for (const log of sortedLogs) {
      if (log.state === DayState.success) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // Sélection d'un jour
  const onSelectDay = (d) => {
    const di = clamp(Number(d) || 1, 1, Number(habit.duration_days));
    setSelectedDayIndex(di);
    const dateId = addDaysLocal(habit.start_date, di - 1);
    const log = data.logs.find((l) => l.date === dateId);
    setNote(log?.note || '');
  };

  // Validation d'un jour
  const onValidate = async (state) => {
    const doIt = async () => {
      try {
        const log = await setStateForDay({ habitId, dateId: selectedDateId, state });
        if (state === DayState.fail) {
          Alert.alert(
              'Analyse',
              "Prends un moment pour écrire ce qui s'est passé dans ton journal. Cette réflexion t'aidera à mieux anticiper la prochaine fois.",
              [{ text: 'Compris' }],
          );
        }
        setData((d) => ({
          ...d,
          logs: d.logs.some((l) => l.date === log.date)
              ? d.logs.map((l) => (l.date === log.date ? log : l))
              : [...d.logs, log],
        }));
      } catch (e) {
        Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
      }
    };

    if (selectedDateId !== today) {
      Alert.alert(
          'Validation rétroactive',
          "Tu es sur le point de valider un jour passé. Assure-toi d'être certain de ton choix.",
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Confirmer', style: 'destructive', onPress: doIt },
          ],
      );
      return;
    }
    doIt();
  };

  // Sauvegarde d'une note
  const onSaveNote = async () => {
    try {
      const log = await saveNoteForDay({ habitId, dateId: selectedDateId, note });
      setData((d) => ({
        ...d,
        logs: d.logs.some((l) => l.date === log.date)
            ? d.logs.map((l) => (l.date === log.date ? log : l))
            : [...d.logs, log],
      }));
    } catch (e) {
      Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
    }
  };

  // Ouverture du modal SOS
  const onSosOpen = async () => {
    try {
      const res = await getSosEligibility({ habitId, dateId: today });
      setSosAlready(Boolean(res.already));
      setSosVisible(true);
    } catch (e) {
      Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
    }
  };

  // Comptabilisation du SOS
  const onSosCount = async () => {
    try {
      const res = await recordSosToday({ habitId, dateId: today });
      if (res.didCount) {
        setSosAlready(true);
      }
    } catch (e) {
      Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
    }
  };

  const onToggleImportant = async () => {
    try {
      const next = habit?.important ? 0 : 1;
      const h = await setImportant({ habitId, important: next });
      setData((d) => ({ ...d, habit: h || { ...d.habit, important: next } }));
    } catch (e) {
      Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
    }
  };

  // Archivage de l'habitude
  const onArchive = async () => {
    Alert.alert(
        'Archiver',
        'Cette habitude sera exclue des statistiques mais conservée dans tes archives.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Archiver',
            style: 'destructive',
            onPress: async () => {
              try {
                await archive(habitId);
                navigation.goBack();
              } catch (e) {
                Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
              }
            },
          },
        ],
    );
  };

  // Suppression de l'habitude
  const onDelete = async () => {
    Alert.alert(
        'Supprimer définitivement',
        'Cette action est irréversible. Toutes les données associées seront effacées.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                await remove(habitId);
                navigation.goBack();
              } catch (e) {
                Alert.alert('Erreur', domainErrorMessageFr(String(e.message || e)));
              }
            },
          },
        ],
    );
  };

  // Barre d'onglets personnalisée
  const renderTabBar = (props) => (
      <TabBar
          {...props}
          indicatorStyle={styles.tabIndicator}
          style={styles.tabBar}
          labelStyle={styles.tabLabel}
          activeColor={theme.colors.accent}
          inactiveColor={theme.colors.textMuted}
          pressColor="transparent"
      />
  );

  // Onglet "Aperçu"
  const OverviewTab = () => (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContainer} showsVerticalScrollIndicator={false}>
        <Card style={styles.headerCard}>
          <LinearGradient
              colors={['rgba(139,92,246,0.08)', 'rgba(34,211,238,0.04)']}
              style={styles.gradientBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerInfo}>
                <View style={styles.titleRow}>
                  <Text variant="title" style={[styles.habitTitle, { flex: 1 }]} numberOfLines={1}>
                    {habit?.name}
                  </Text>
                  <Pressable onPress={onToggleImportant} style={styles.starBtn} hitSlop={10}>
                    <Ionicons
                      name={habit?.important ? 'star' : 'star-outline'}
                      size={20}
                      color={habit?.important ? '#F59E0B' : theme.colors.textMuted}
                    />
                  </Pressable>
                </View>
                <Text variant="caption" style={styles.habitDescription}>
                  {habit?.description || habit?.replacement || 'Aucune description'}
                </Text>

                <View style={styles.badgesRow}>
                  <View style={styles.phaseBadge}>
                    <View style={[styles.phaseDot, { backgroundColor: getPhaseColor(phase.phase) }]} />
                    <Text variant="caption" style={styles.phaseText}>
                      Phase {phase.phase} · {phaseInfo.name}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.modeBadge,
                      habit?.discipline_mode === DisciplineMode.strict ? styles.modeStrict : styles.modeSoft,
                    ]}
                  >
                    <Ionicons
                      name={habit?.discipline_mode === DisciplineMode.strict ? 'flash' : 'heart'}
                      size={14}
                      color={habit?.discipline_mode === DisciplineMode.strict ? '#F59E0B' : '#22D3EE'}
                    />
                    <Text variant="caption" style={styles.modeText}>
                      {habit?.discipline_mode === DisciplineMode.strict ? 'Stricte' : 'Douce'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressSection}>
                <Text variant="caption" style={styles.progressLabel}>
                  Jour {selectedDayIndex}/{habit?.duration_days}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Card>

        <Card style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <Ionicons name="chatbox-ellipses-outline" size={18} color={theme.colors.textMuted} />
            <Text variant="subtitle" style={{ marginLeft: 10, flex: 1 }}>
              Message de phase
            </Text>
          </View>
          <Text variant="muted" style={styles.messageText}>
            {phaseMessage}
          </Text>
        </Card>

        <Card style={styles.dateCard}>
          <View style={styles.dateHeader}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.accent} />
            <Text variant="subtitle" style={styles.dateTitle}>
              Jour sélectionné
            </Text>
          </View>

          <View style={styles.dateInfo}>
            <View>
              <Text variant="title" style={styles.selectedDate}>
                {formatDate(selectedDateId, 'fr-FR')}
              </Text>
              <Text variant="caption" style={styles.dayInfo}>
                Jour {selectedDayIndex} · {phase.inPhase}/{phase.phaseTotal} en phase {phase.phase}
              </Text>
            </View>

            {selectedLog?.state && (
                <View style={[styles.stateBadge, { backgroundColor: getStateColor(selectedLog.state) }]}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    {getStateLabel(selectedLog.state)}
                  </Text>
                </View>
            )}
          </View>

          <DayPickerStrip
              durationDays={Number(habit?.duration_days)}
              selectedDayIndex={selectedDayIndex}
              logs={data.logs}
              onSelect={onSelectDay}
          />
        </Card>

        <Card style={styles.validationCard}>
          <View style={styles.validationHeader}>
            <Text variant="subtitle" style={styles.validationTitle}>Validation du jour</Text>
            {alreadyValidated && (
                <View style={styles.alreadyValidatedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                  <Text variant="caption" style={styles.alreadyValidatedText}>
                    Déjà validé
                  </Text>
                </View>
            )}
          </View>

          <Text variant="caption" style={styles.validationHint}>
            {isFutureSelected
                ? '❌ Impossible de valider un jour futur'
                : alreadyValidated
                    ? `✅ Jour marqué comme ${getStateLabel(selectedLog.state).toLowerCase()}`
                    : '✅ Marque ta progression pour aujourd\'hui'}
          </Text>

          <View style={styles.stateButtons}>
            <DayStateButton
                state={DayState.success}
                icon="checkmark-circle"
                label="Réussi"
                color="#10B981" // Vert vif
                disabled={isFutureSelected || alreadyValidated}
                onPress={() => onValidate(DayState.success)}
                isSelected={selectedLog?.state === DayState.success}
            />

            <DayStateButton
                state={DayState.resisted}
                icon="shield-checkmark"
                label="Résisté"
                color="#F59E0B" // Orange vif
                disabled={isFutureSelected || alreadyValidated}
                onPress={() => onValidate(DayState.resisted)}
                isSelected={selectedLog?.state === DayState.resisted}
            />

            <DayStateButton
                state={DayState.fail}
                icon="close-circle"
                label="Échec"
                color="#EF4444" // Rouge vif
                disabled={isFutureSelected || alreadyValidated}
                onPress={() => onValidate(DayState.fail)}
                isSelected={selectedLog?.state === DayState.fail}
            />
          </View>

          {!alreadyValidated && !isFutureSelected && (
              <View style={styles.validationHelp}>
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.textMuted} />
                <Text variant="caption" style={styles.validationHelpText}>
                  Sélectionne l'état qui correspond le mieux à ta journée
                </Text>
              </View>
          )}
        </Card>

        <Card style={styles.sosCard}>
          <View style={styles.sosHeader}>
            <View style={styles.sosIcon}>
              <Ionicons name="shield" size={24} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">SOS - 3 minutes</Text>
              <Text variant="caption" style={styles.sosDescription}>
                Revenir au contrôle rapidement. Disponible uniquement aujourd'hui.
              </Text>
            </View>
          </View>

          <Button
              title={sosAlready ? 'SOS déjà utilisé aujourd\'hui' : 'Utiliser SOS maintenant'}
              variant={sosAlready ? 'outline' : 'primary'}
              onPress={onSosOpen}
              disabled={sosAlready}
              style={styles.sosButton}
              icon={sosAlready ? 'time-outline' : 'shield-checkmark'}
              gradient={!sosAlready}
              gradientColors={['#DC2626', '#EF4444']}
          />
        </Card>

        <Card style={styles.timelineCard}>
          <Text variant="subtitle">Timeline complète</Text>
          <Text variant="caption" style={styles.timelineHint}>
            Visualise ta progression sur les {habit?.duration_days} jours
          </Text>
          <View style={styles.timelineContainer}>
            <HabitTimeline durationDays={Number(habit?.duration_days)} logs={data.logs} />
          </View>
        </Card>
      </ScrollView>
  );

  // Onglet "Journal"
  const JournalTab = () => (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContainer} showsVerticalScrollIndicator={false}>
        <Card style={styles.journalCard}>
          <View style={styles.journalHeader}>
            <Ionicons name="document-text-outline" size={24} color={theme.colors.accent} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="subtitle">Journal du {formatDate(selectedDateId, 'fr-FR')}</Text>
              <Text variant="caption" style={styles.journalDate}>
                Jour {selectedDayIndex} · {selectedLog?.state ? getStateLabel(selectedLog.state) : 'Non validé'}
              </Text>
            </View>
            {selectedLog?.state && (
                <View style={[styles.journalStateBadge, { backgroundColor: getStateColor(selectedLog.state) }]}>
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                    {getStateLabel(selectedLog.state)}
                  </Text>
                </View>
            )}
          </View>

          <NotepadInput
              value={note}
              onChangeText={setNote}
              placeholder="Écris tes réflexions, ce qui s'est passé, ce que tu as appris, ou comment tu peux mieux anticiper la prochaine fois..."
              editable={!isFutureSelected}
              minHeight={300}
              style={styles.journalInput}
          />

          <View style={styles.journalActions}>
            <Button
                title="Enregistrer la note"
                onPress={onSaveNote}
                disabled={isFutureSelected}
                style={styles.saveButton}
                icon="save-outline"
                gradient
                gradientColors={[theme.colors.accent, theme.colors.accent2]}
            />
            <Text variant="caption" style={styles.journalHint}>
              {isFutureSelected
                  ? '❌ Impossible d\'écrire dans le journal d\'un jour futur'
                  : '📝 Tes notes sont automatiquement associées à ce jour spécifique'}
            </Text>
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="subtitle">Notes passées</Text>
            <Text variant="mono">{notedLogs.length}</Text>
          </View>

          {notedLogs.length === 0 ? (
            <Text variant="muted" style={{ marginTop: 10 }}>
              Aucune note enregistrée.
            </Text>
          ) : (
            <View style={{ marginTop: 12, gap: 10 }}>
              {notedLogs.slice(0, 20).map((l) => (
                <Pressable
                  key={l.id}
                  onPress={() => onSelectDay(dayIndexFromStart(habit.start_date, l.date))}
                  style={styles.noteRow}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="subtitle" numberOfLines={1}>
                      {formatDate(l.date, 'fr-FR')}
                    </Text>
                    <Text variant="muted" numberOfLines={2} style={{ marginTop: 4, lineHeight: 18 }}>
                      {String(l.note || '').trim()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </Pressable>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
  );

  // Onglet "Stats"
  const StatsTab = () => (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContainer} showsVerticalScrollIndicator={false}>
        <Card style={styles.statsOverviewCard}>
          <Text variant="title" style={styles.statsTitle}>
            Statistiques
          </Text>
          <Text variant="caption" style={styles.statsSubtitle}>
            Résumé de ta progression sur {habit?.duration_days} jours
          </Text>

          {stats && (
              <View style={styles.statsGrid}>
                <StatCard
                    icon="trending-up"
                    label="Taux de succès"
                    value={`${stats.successRate}%`}
                    color="#10B981"
                />

                <StatCard
                    icon="flame"
                    label="Série actuelle"
                    value={stats.currentStreak}
                    color={theme.colors.accent}
                />

                <StatCard
                    icon="checkmark-done"
                    label="Réussis"
                    value={stats.successCount}
                    color="#10B981"
                />

                <StatCard
                    icon="shield"
                    label="Résistés"
                    value={stats.resistedCount}
                    color="#F59E0B"
                />
              </View>
          )}
        </Card>

        <Card style={styles.actionsCard}>
          <Text variant="subtitle">Actions</Text>
          <Text variant="caption" style={styles.actionsHint}>
            Gestion de cette habitude
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={onArchive}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(120,119,198,0.1)' }]}>
                <Ionicons name="archive-outline" size={20} color="#7877C6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle">Archiver</Text>
                <Text variant="caption" style={styles.actionDescription}>
                  Exclure des statistiques
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={[styles.actionButton, styles.dangerAction]} onPress={onDelete}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle" style={{ color: theme.colors.error }}>
                  Supprimer
                </Text>
                <Text variant="caption" style={[styles.actionDescription, { color: theme.colors.error + '80' }]}>
                  Action irréversible
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
  );

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'overview':
        return OverviewTab();
      case 'journal':
        return JournalTab();
      case 'stats':
        return StatsTab();
      default:
        return null;
    }
  };

  // Fonctions utilitaires
  const getPhaseColor = (phaseNum) => {
    switch (phaseNum) {
      case 1:
        return '#8B5CF6'; // Violet
      case 2:
        return '#22D3EE'; // Cyan
      case 3:
        return '#10B981'; // Vert
      default:
        return theme.colors.textMuted;
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case DayState.success:
        return '#10B981'; // Vert vif
      case DayState.resisted:
        return '#F59E0B'; // Orange vif
      case DayState.fail:
        return '#EF4444'; // Rouge vif
      default:
        return theme.colors.textMuted;
    }
  };

  const getStateLabel = (state) => {
    switch (state) {
      case DayState.success:
        return 'Réussi';
      case DayState.resisted:
        return 'Résisté';
      case DayState.fail:
        return 'Échec';
      default:
        return 'Non validé';
    }
  };

  // Affichage de chargement
  if (!habit) {
    return (
        <Screen style={styles.loadingScreen}>
          <View style={styles.loadingContent}>
            <Ionicons name="leaf" size={48} color={theme.colors.accent} />
            <Text variant="title" style={styles.loadingText}>
              Chargement...
            </Text>
          </View>
        </Screen>
    );
  }

  return (
      <Screen style={styles.container}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <TabView
              navigationState={{ index: tabIndex, routes }}
              renderScene={renderScene}
              onIndexChange={setTabIndex}
              initialLayout={{ width: screenWidth }}
              renderTabBar={renderTabBar}
          />
        </Animated.View>

        <SOSModal
            visible={sosVisible}
            habit={habit}
            phase={sosPhase}
            alreadyCounted={sosAlready}
            onCount={onSosCount}
            onClose={() => setSosVisible(false)}
        />
      </Screen>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    color: theme.colors.textMuted,
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabIndicator: {
    backgroundColor: theme.colors.accent,
    height: 3,
    borderRadius: 1.5,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
    paddingVertical: 8,
  },
  tabContent: {
    flex: 1,
  },
  tabContainer: {
    gap: 12,
    paddingBottom: 120,
  },
  headerCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 0,
  },
  gradientBackground: {
    padding: theme.spacing.l,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginRight: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  starBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  habitTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  habitDescription: {
    color: theme.colors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surface2,
    gap: 6,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  modeSoft: { backgroundColor: 'rgba(34,211,238,0.10)' },
  modeStrict: { backgroundColor: 'rgba(245,158,11,0.10)' },
  modeText: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressLabel: {
    marginTop: 8,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  messageCard: {
    padding: theme.spacing.l,
    borderRadius: 20,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  messageText: { lineHeight: 20 },
  dateCard: {
    padding: theme.spacing.l,
    borderRadius: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  dayInfo: {
    color: theme.colors.textMuted,
  },
  stateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  validationCard: {
    padding: theme.spacing.l,
    borderRadius: 20,
  },
  validationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  alreadyValidatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  alreadyValidatedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
  validationHint: {
    color: theme.colors.textMuted,
    marginBottom: 20,
    lineHeight: 18,
  },
  stateButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  stateButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    position: 'relative',
  },
  stateButtonDisabled: {
    opacity: 0.4,
  },
  stateButtonSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  stateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stateLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validationHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  validationHelpText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  sosCard: {
    padding: theme.spacing.l,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    backgroundColor: 'rgba(239,68,68,0.03)',
  },
  sosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sosIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  sosDescription: {
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  sosButton: {
    width: '100%',
  },
  timelineCard: {
    padding: theme.spacing.l,
    borderRadius: 20,
  },
  timelineHint: {
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  timelineContainer: {
    paddingVertical: 8,
  },
  journalCard: {
    padding: theme.spacing.l,
    borderRadius: 20,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  journalDate: {
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  journalStateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  journalInput: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  journalActions: {
    marginTop: 20,
  },
  saveButton: {
    width: '100%',
  },
  journalHint: {
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  noteRow: {
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
  statsOverviewCard: {
    padding: theme.spacing.l,
    borderRadius: 20,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsSubtitle: {
    color: theme.colors.textMuted,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  actionsCard: {
    padding: theme.spacing.l,
    borderRadius: 20,
  },
  actionsHint: {
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  actionButtons: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionDescription: {
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  dangerAction: {
    backgroundColor: 'rgba(239,68,68,0.03)',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
});