import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '../../../core/ui/Screen';
import { Card } from '../../../core/ui/Card';
import { Text } from '../../../core/ui/Text';
import { theme } from '../../../core/theme/theme';
import { GiantTree } from '../../stats/components/GiantTree';

export function StartScreen({ navigation, onDone }) {
  const fade = useRef(new Animated.Value(0)).current;
  const up = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 520, useNativeDriver: false }),
      Animated.timing(up, { toValue: 0, duration: 520, useNativeDriver: false }),
    ]).start();
  }, [fade, up]);

  const go = async () => {
    await onDone?.();
    navigation.replace('Tabs');
  };

  return (
    <Screen>
      <Animated.View style={{ opacity: fade, transform: [{ translateY: up }], flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ paddingTop: 6 }}>
            <Text variant="title">Elan66</Text>
            <Text variant="muted" style={{ marginTop: 6 }}>
              Crée une habitude. Tiens 66 jours. Regarde ton arbre devenir géant.
            </Text>
          </View>

          <Card>
            <Text variant="subtitle">Ce que tu fais ici</Text>
            <View style={{ marginTop: 10, gap: 6 }}>
              <Text>• Valider ta journée (✅ / ⚠️ / ❌)</Text>
              <Text>• SOS 3 minutes quand ça pousse</Text>
              <Text>• Journal structuré type bloc-notes</Text>
              <Text>• Stats et arbre qui grandit</Text>
            </View>
          </Card>

          <View style={{ marginTop: 12 }}>
            <GiantTree progress={0.12} />
          </View>

          <View style={{ gap: 10, paddingBottom: 10 }}>
            <Pressable onPress={go} style={styles.primary}>
              <Text variant="subtitle" style={{ color: theme.colors.black }}>
                Commencer
              </Text>
            </Pressable>
            <Pressable onPress={() => navigation.replace('Tabs')} style={styles.ghost}>
              <Text variant="subtitle">Passer</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  ghost: {
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,26,51,0.55)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
