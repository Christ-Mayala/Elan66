import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  Animated,
  Dimensions,
  Vibration,
  Alert,
  ScrollView,
  Text as RNText,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../core/ui/Card';
import { Text } from '../../../core/ui/Text';
import { Button } from '../../../core/ui/Button';
import { theme } from '../../../core/theme/theme';
import { phaseCopy, sosMotivation, DisciplineMode } from '../../../core/utils/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const TIMER_DURATION = 180; // 3 minutes

const QuoteIcon = ({ style }) => (
    <Text style={[styles.quoteIcon, style]}>"</Text>
);

const format = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export function SOSModal({ visible, habit, phase, onCount, alreadyCounted, onClose }) {
  const [remaining, setRemaining] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(true);
  const [currentMotivation, setCurrentMotivation] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));
  const [progressAnim] = useState(new Animated.Value(1));
  const [timeUp, setTimeUp] = useState(false);

  // Animation de pulsation pour le timer
  useEffect(() => {
    if (!timerActive || remaining === 0) return;

    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();

    return () => pulseAnim.stopAnimation();
  }, [timerActive, remaining]);

  // Animation de progression
  useEffect(() => {
    if (!visible) return;

    const progress = (TIMER_DURATION - remaining) / TIMER_DURATION;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (remaining === 0 && !timeUp) {
      setTimeUp(true);
      Vibration.vibrate([500, 200, 500]);
    }
  }, [remaining, visible]);

  // Sélection et rotation des motivations
  const motivationList = useMemo(() => {
    const list = sosMotivation[habit?.discipline_mode || DisciplineMode.soft] || sosMotivation.soft;
    return list;
  }, [habit?.discipline_mode]);

  useEffect(() => {
    if (!visible || !motivationList.length) return;

    const randomMotivation = motivationList[Math.floor(Math.random() * motivationList.length)];
    setCurrentMotivation(randomMotivation);

    const interval = setInterval(() => {
      const newMotivation = motivationList[Math.floor(Math.random() * motivationList.length)];
      setCurrentMotivation(newMotivation);
    }, 30000);

    return () => clearInterval(interval);
  }, [visible, motivationList]);

  useEffect(() => {
    if (!visible) {
      setRemaining(TIMER_DURATION);
      setTimerActive(false);
      setTimeUp(false);
      return;
    }

    setTimerActive(true);
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  const phaseInfo = phaseCopy[phase || 1];
  const phaseMessage = phaseInfo?.message?.[habit?.discipline_mode] || phaseInfo?.message?.soft || '';

  const getPhaseColor = () => {
    switch (phase) {
      case 1: return theme.colors.accent;
      case 2: return theme.colors.accent2;
      case 3: return theme.colors.success;
      default: return theme.colors.text;
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleClose = () => {
    if (remaining > 0) {
      Alert.alert(
          'Quitter le mode SOS ?',
          'Tu peux toujours revenir plus tard. Ta progression ne sera pas perdue.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Quitter', style: 'destructive', onPress: onClose },
          ]
      );
    } else {
      onClose();
    }
  };

  return (
      <Modal
          visible={visible}
          animationType="fade"
          presentationStyle="fullScreen"
          onRequestClose={handleClose}
          statusBarTranslucent
      >
        <LinearGradient
            colors={['#0A0A1A', '#161625', '#1F1F33']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
          <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>

              <View style={styles.headerCenter}>
                <View style={styles.titleBadge}>
                  <Ionicons name="shield" size={16} color="#FF6B6B" />
                  <Text variant="caption" style={styles.titleText}>MODE SOS</Text>
                </View>
                <Text variant="title" style={styles.headerTitle}>
                  3 minutes pour retrouver le contrôle
                </Text>
              </View>

              <View style={styles.phaseIndicator}>
                <View style={[styles.phaseDot, { backgroundColor: getPhaseColor() }]} />
                <Text variant="caption" style={styles.phaseText}>
                  Phase {phase}
                </Text>
              </View>
            </View>

            {/* Timer Section */}
            <View style={styles.timerSection}>
              <Animated.View
                  style={[
                    styles.timerContainer,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
              >
                <LinearGradient
                    colors={['rgba(255,107,107,0.2)', 'rgba(255,107,107,0.1)']}
                    style={styles.timerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                  <View style={styles.timerBorder}>
                    <Text style={styles.timerText}>
                      {format(remaining)}
                    </Text>
                    <Text variant="caption" style={styles.timerLabel}>
                      {remaining > 0 ? 'Temps restant' : 'Temps écoulé'}
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                      style={[
                        styles.progressBarFill,
                        { width: progressWidth }
                      ]}
                  />
                </View>
                <Text variant="caption" style={styles.progressText}>
                  {Math.round(((TIMER_DURATION - remaining) / TIMER_DURATION) * 100)}% complété
                </Text>
              </View>
            </View>

            {/* Motivation Card */}
            <Card style={styles.motivationCard}>
              <View style={styles.motivationHeader}>
                <View style={styles.motivationIcon}>
                  <Ionicons name="bulb-outline" size={24} color="#FFD166" />
                </View>
                <Text variant="subtitle" style={styles.motivationTitle}>
                  Reste focus
                </Text>
              </View>
              <Text style={styles.motivationText}>
                {currentMotivation || motivationList[0]}
              </Text>
            </Card>

            {/* Phase Info */}
            <Card style={styles.phaseCard}>
              <LinearGradient
                  colors={[getPhaseColor() + '20', getPhaseColor() + '05']}
                  style={styles.phaseGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
              >
                <View style={styles.phaseHeader}>
                  <Text variant="subtitle" style={[styles.phaseName, { color: getPhaseColor() }]}>
                    Phase {phase} · {phaseInfo.name}
                  </Text>
                  <View style={[styles.phaseBadge, { backgroundColor: getPhaseColor() + '30' }]}>
                    <Text variant="caption" style={{ color: getPhaseColor(), fontWeight: '600' }}>
                      {phase === 1 ? 'Début' : phase === 2 ? 'Consolidation' : 'Ancrage'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.phaseMessage}>
                  {phaseMessage}
                </Text>
              </LinearGradient>
            </Card>

            {/* Commitment */}
            <Card style={styles.commitmentCard}>
              <View style={styles.commitmentHeader}>
                <View style={styles.commitmentIcon}>
                  <Ionicons name="heart" size={20} color="#EF476F" />
                </View>
                <Text variant="subtitle" style={styles.commitmentTitle}>
                  Ta phrase d'engagement
                </Text>
              </View>
              <View style={styles.commitmentContent}>
                <QuoteIcon />
                <Text style={styles.commitmentText}>
                  {habit?.commitment?.trim() || "Je choisis la version de moi qui tient ses engagements sur le long terme."}
                </Text>
                <QuoteIcon style={styles.quoteIconEnd} />
              </View>
            </Card>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {timeUp && (
                  <View style={styles.successOverlay}>
                    <Ionicons name="checkmark-circle" size={48} color="#06D6A0" />
                    <Text variant="title" style={styles.successText}>
                      Excellent ! La pulsion est passée.
                    </Text>
                  </View>
              )}

              <Button
                  title={alreadyCounted ? "✓ Déjà compté aujourd'hui" : "✓ J'ai tenu — comptabiliser"}
                  onPress={onCount}
                  disabled={alreadyCounted}
                  style={styles.mainButton}
                  icon="checkmark-circle"
                  variant={alreadyCounted ? "outline" : "primary"}
                  size="large"
                  gradient={!alreadyCounted}
                  gradientColors={['#06D6A0', '#118AB2']}
              />

              <Button
                  title={remaining > 0 ? "Continuer à respirer" : "Terminer la session"}
                  onPress={onClose}
                  style={styles.secondaryButton}
                  variant="ghost"
                  icon={remaining > 0 ? "time-outline" : "exit-outline"}
              />

              {remaining > 0 && (
                  <Text variant="caption" style={styles.hintText}>
                    Respire profondément et reste présent. La pulsion va passer.
                  </Text>
              )}
            </View>
          </ScrollView>

          {/* Background Animation */}
          {remaining > 0 && (
              <View style={styles.breathingAnimation}>
                <View style={styles.breathingCircle} />
              </View>
          )}
        </LinearGradient>
      </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 20,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,107,0.2)',
    marginBottom: 8,
    gap: 6,
  },
  titleText: {
    color: '#FF6B6B',
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    marginBottom: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  timerGradient: {
    flex: 1,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  timerBorder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: 'rgba(255,107,107,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FF6B6B',
    textShadowColor: 'rgba(255,107,107,0.5)',
    textShadowOffset: { width: 0, height: 7 },
    textShadowRadius: 10,
    padding: 17,
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    fontSize: 14,
    letterSpacing: 1,
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#06D6A0',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 14,
  },
  motivationCard: {
    marginBottom: 16,
    padding: theme.spacing.l,
    backgroundColor: 'rgba(255,209,102,0.05)',
    borderColor: 'rgba(255,209,102,0.2)',
    borderRadius: 16,
    shadowColor: 'rgba(255,209,102,0.1)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  motivationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,209,102,0.2)',
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  motivationText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  phaseCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
    borderRadius: 16,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  phaseGradient: {
    padding: theme.spacing.l,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  phaseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  phaseMessage: {
    color: theme.colors.text,
    lineHeight: 22,
    fontSize: 14,
  },
  commitmentCard: {
    marginBottom: 24,
    padding: theme.spacing.l,
    backgroundColor: 'rgba(239,71,111,0.05)',
    borderColor: 'rgba(239,71,111,0.2)',
    borderRadius: 16,
    shadowColor: 'rgba(239,71,111,0.1)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  commitmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  commitmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,71,111,0.2)',
  },
  commitmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  commitmentContent: {
    alignItems: 'center',
  },
  commitmentText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    color: theme.colors.text,
    paddingHorizontal: 20,
  },
  quoteIcon: {
    fontSize: 24,
    color: '#FFD166',
    opacity: 0.4,
    marginBottom: 12,
  },
  quoteIconEnd: {
    marginTop: 12,
    marginBottom: 0,
    transform: [{ rotate: '180deg' }],
  },
  actionsContainer: {
    gap: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  successOverlay: {
    position: 'relative',
    alignItems: 'center',
    backgroundColor: 'rgba(6,214,160,0.1)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6,214,160,0.3)',
    marginBottom: 16,
  },
  successText: {
    color: '#06D6A0',
    marginTop: 12,
    textAlign: 'center',
    fontSize: 16,
  },
  mainButton: {
    width: '100%',
    borderRadius: 12,
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 12,
  },
  hintText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  breathingAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  breathingCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,107,107,0.03)',
    borderWidth: 2,
    borderColor: 'rgba(255,107,107,0.1)',
  },
});
