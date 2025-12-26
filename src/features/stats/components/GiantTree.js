import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../../../core/theme/theme';

const clamp01 = (n) => Math.max(0, Math.min(1, n));

export function GiantTree({ progress = 0 }) {
  const p = clamp01(Number(progress) || 0);

  const grow = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(grow, { toValue: p, duration: 650, useNativeDriver: false }).start();
  }, [p, grow]);

  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1400, useNativeDriver: false }),
        Animated.timing(sway, { toValue: 0, duration: 1400, useNativeDriver: false }),
      ])
    );
    a.start();
    return () => a.stop();
  }, [sway]);

  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    );
    a.start();
    return () => a.stop();
  }, [pulse]);

  const trunkH = grow.interpolate({ inputRange: [0, 1], outputRange: [30, 260] });
  const trunkW = grow.interpolate({ inputRange: [0, 1], outputRange: [10, 22] });
  const canopyScale = grow.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, 0.55, 1] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.22] });

  const swayDeg = useMemo(() => sway.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] }), [sway]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: canopyScale }] }]} />

      <Animated.View style={[styles.tree, { transform: [{ rotate: swayDeg }] }]}>
        <Animated.View style={[styles.trunk, { height: trunkH, width: trunkW }]} />

        <Animated.View style={[styles.canopy, { transform: [{ scale: canopyScale }] }]}>
          <View style={[styles.blob, styles.blob1]} />
          <View style={[styles.blob, styles.blob2]} />
          <View style={[styles.blob, styles.blob3]} />
          <View style={[styles.blob, styles.blob4]} />
          <View style={[styles.blob, styles.blob5]} />
          <View style={styles.spark} />
          <View style={[styles.spark, { left: 44, top: 28, opacity: 0.75 }]} />
          <View style={[styles.spark, { left: 116, top: 46, opacity: 0.55 }]} />
        </Animated.View>
      </Animated.View>

      <View style={styles.ground} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', height: 360, alignItems: 'center', justifyContent: 'flex-end' },
  tree: { alignItems: 'center', justifyContent: 'flex-end' },
  trunk: {
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.30)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
  },
  canopy: {
    position: 'absolute',
    bottom: 210,
    width: 220,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(34,211,238,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.22)',
  },
  blob1: { width: 150, height: 120, left: 24, top: 34 },
  blob2: { width: 120, height: 100, left: 84, top: 20 },
  blob3: { width: 130, height: 110, left: 58, top: 62 },
  blob4: { width: 110, height: 90, left: 6, top: 64 },
  blob5: { width: 96, height: 80, left: 128, top: 74 },
  spark: {
    position: 'absolute',
    left: 88,
    top: 60,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    opacity: 0.9,
  },
  ground: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(148,163,184,0.22)',
    marginTop: 18,
  },
  glow: {
    position: 'absolute',
    bottom: 120,
    width: 280,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(34,211,238,0.12)',
  },
});
