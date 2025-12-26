import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Card } from '../../../core/ui/Card';
import { Text } from '../../../core/ui/Text';
import { Button } from '../../../core/ui/Button';
import { theme } from '../../../core/theme/theme';
import { phaseCopy, sosMotivation } from '../../../core/utils/constants';

const format = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export function SOSModal({ visible, habit, phase, onCount, alreadyCounted, onClose }) {
  const [remaining, setRemaining] = useState(180);

  const motivation = useMemo(() => {
    const list = sosMotivation[habit?.discipline_mode] || sosMotivation.soft;
    return list[Math.floor(Math.random() * list.length)];
  }, [habit?.discipline_mode, visible]);

  useEffect(() => {
    if (!visible) return;
    setRemaining(180);
    const t = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [visible]);

  const phaseInfo = phaseCopy[phase || 1];

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.bg}>
        <View style={styles.header}>
          <Text variant="subtitle">SOS — 3 minutes</Text>
          <Pressable onPress={onClose} style={styles.close}>
            <Text>Fermer</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', gap: 12 }}>
          <Card>
            <View style={{ gap: 10 }}>
              <Text variant="mono" style={{ color: phaseInfo.color }}>
                Phase {phase} — {phaseInfo.name}
              </Text>
              <Text variant="muted">{phaseInfo.message}</Text>

              <View style={styles.timerWrap}>
                <Text style={styles.timer}>{format(remaining)}</Text>
                <Text variant="muted" style={{ marginTop: 6 }}>
                  {remaining > 0 ? motivation : 'La pulsion est passée. Reviens au calme.'}
                </Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text variant="subtitle">Phrase d'engagement</Text>
            <Text style={{ marginTop: 10, fontSize: 18, fontWeight: '700' }}>
              {habit?.commitment?.trim() ? habit.commitment.trim() : 'Je choisis le long terme.'}
            </Text>
          </Card>

          <View style={{ gap: 10 }}>
            <Button
              title={alreadyCounted ? "Déjà compté aujourd'hui" : "J'ai tenu (compter 1 vie)"}
              disabled={alreadyCounted}
              onPress={onCount}
            />
            <Button title={remaining > 0 ? 'Continuer' : 'Terminer'} variant="ghost" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: theme.colors.bg, padding: theme.spacing.m },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timerWrap: { paddingVertical: 10 },
  timer: { fontSize: 54, fontWeight: '800', color: theme.colors.text },
});
