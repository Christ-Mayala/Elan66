import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../../../core/theme/theme';

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const LEAVES = [
  { x: 12, y: 84, s: 44, c: 'rgba(34,211,238,0.18)', t: 0.18 },
  { x: 44, y: 56, s: 56, c: 'rgba(34,211,238,0.22)', t: 0.24 },
  { x: 92, y: 44, s: 66, c: 'rgba(139,92,246,0.18)', t: 0.32 },
  { x: 132, y: 56, s: 52, c: 'rgba(34,211,238,0.22)', t: 0.38 },
  { x: 156, y: 88, s: 46, c: 'rgba(34,211,238,0.18)', t: 0.44 },
  { x: 72, y: 92, s: 74, c: 'rgba(139,92,246,0.14)', t: 0.5 },
  { x: 26, y: 122, s: 56, c: 'rgba(34,211,238,0.16)', t: 0.58 },
  { x: 124, y: 124, s: 62, c: 'rgba(34,211,238,0.18)', t: 0.62 },
  { x: 78, y: 132, s: 84, c: 'rgba(34,211,238,0.14)', t: 0.68 },
  { x: 8, y: 58, s: 34, c: 'rgba(139,92,246,0.14)', t: 0.72 },
  { x: 172, y: 62, s: 34, c: 'rgba(139,92,246,0.14)', t: 0.72 },
];

export function GiantTree({ progress = 0 }) {
  const p = clamp01(Number(progress) || 0);

  const grow = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(grow, {
      toValue: p,
      duration: 800,
      useNativeDriver: false
    }).start();
  }, [p]);

  useEffect(() => {
    const swayAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(sway, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: false
          }),
          Animated.timing(sway, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: false
          }),
        ])
    );
    swayAnimation.start();
    return () => swayAnimation.stop();
  }, [sway]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: false
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: false
          }),
        ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulse]);

  const swayDeg = sway.interpolate({
    inputRange: [0, 1],
    outputRange: ['-1.5deg', '1.5deg']
  });

  const trunkH = grow.interpolate({
    inputRange: [0, 1],
    outputRange: [54, 260]
  });

  const trunkW = grow.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 28]
  });

  const canopyScale = grow.interpolate({
    inputRange: [0, 0.32, 1],
    outputRange: [0.2, 0.72, 1]
  });

  const canopyOpacity = grow.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.9, 1]
  });

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.16]
  });

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.04]
  });

  const branch1Opacity = grow.interpolate({
    inputRange: [0, 0.28, 0.42],
    outputRange: [0, 0, 1]
  });

  const branch2Opacity = grow.interpolate({
    inputRange: [0, 0.42, 0.58],
    outputRange: [0, 0, 1]
  });

  const branch3Opacity = grow.interpolate({
    inputRange: [0, 0.56, 0.74],
    outputRange: [0, 0, 1]
  });

  return (
      <View style={styles.container}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

        <Animated.View style={[styles.treeContainer, { transform: [{ rotate: swayDeg }] }]}>
          {/* Tronc */}
          <Animated.View style={[styles.trunk, {
            height: trunkH,
            width: trunkW,
            backgroundColor: 'rgba(101, 67, 33, 0.65)'
          }]}>
            <View style={[styles.trunkHighlight, {
              backgroundColor: 'rgba(255, 255, 255, 0.12)'
            }]} />
          </Animated.View>

          {/* Branches */}
          <Animated.View style={[styles.branch, styles.branchLeft1, { opacity: branch1Opacity }]} />
          <Animated.View style={[styles.branch, styles.branchRight1, { opacity: branch1Opacity }]} />

          <Animated.View style={[styles.branch, styles.branchLeft2, { opacity: branch2Opacity }]} />
          <Animated.View style={[styles.branch, styles.branchRight2, { opacity: branch2Opacity }]} />

          <Animated.View style={[styles.branch, styles.branchLeft3, { opacity: branch3Opacity }]} />
          <Animated.View style={[styles.branch, styles.branchRight3, { opacity: branch3Opacity }]} />

          {/* Canopée */}
          <Animated.View style={[styles.canopy, {
            opacity: canopyOpacity,
            transform: [{ scale: canopyScale }]
          }]}>
            <View style={styles.canopyShadow} />

            {/* Feuilles */}
            {LEAVES.map((leaf, idx) => {
              const opacity = grow.interpolate({
                inputRange: [Math.max(0, leaf.t - 0.16), leaf.t],
                outputRange: [0, 1],
              });

              const scale = grow.interpolate({
                inputRange: [Math.max(0, leaf.t - 0.2), leaf.t],
                outputRange: [0.86, 1],
              });

              return (
                  <Animated.View
                      key={`leaf-${idx}`}
                      style={[
                        styles.leaf,
                        {
                          left: leaf.x,
                          top: leaf.y,
                          width: leaf.s,
                          height: leaf.s,
                          backgroundColor: leaf.c,
                          opacity,
                          transform: [{ scale }],
                          borderColor: 'rgba(255, 255, 255, 0.08)'
                        }
                      ]}
                  />
              );
            })}

            {/* Éclats de lumière */}
            <View style={[styles.leafSpark, styles.spark1]} />
            <View style={[styles.leafSpark, styles.spark2]} />
            <View style={[styles.leafSpark, styles.spark3]} />
          </Animated.View>

          <View style={styles.rootShadow} />
        </Animated.View>

        <View style={styles.ground} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20
  },
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  glow: {
    position: 'absolute',
    bottom: 120,
    width: 320,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    zIndex: -1
  },
  trunk: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(101, 67, 33, 0.5)',
    overflow: 'hidden',
  },
  trunkHighlight: {
    position: 'absolute',
    left: 2,
    top: 10,
    bottom: 10,
    width: 4,
    borderRadius: 999,
  },
  branch: {
    position: 'absolute',
    bottom: 86,
    width: 74,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(101, 67, 33, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(101, 67, 33, 0.4)',
  },
  branchLeft1: {
    left: '50%',
    marginLeft: -22,
    bottom: 156,
    transform: [{ rotate: '-26deg' }]
  },
  branchRight1: {
    left: '50%',
    marginLeft: -52,
    bottom: 156,
    transform: [{ rotate: '26deg' }]
  },
  branchLeft2: {
    left: '50%',
    marginLeft: -18,
    bottom: 194,
    width: 64,
    transform: [{ rotate: '-18deg' }]
  },
  branchRight2: {
    left: '50%',
    marginLeft: -46,
    bottom: 194,
    width: 64,
    transform: [{ rotate: '18deg' }]
  },
  branchLeft3: {
    left: '50%',
    marginLeft: -14,
    bottom: 224,
    width: 52,
    transform: [{ rotate: '-12deg' }]
  },
  branchRight3: {
    left: '50%',
    marginLeft: -38,
    bottom: 224,
    width: 52,
    transform: [{ rotate: '12deg' }]
  },
  canopy: {
    position: 'absolute',
    bottom: 206,
    width: 220,
    height: 190,
  },
  canopyShadow: {
    position: 'absolute',
    left: 14,
    top: 22,
    width: 192,
    height: 152,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    transform: [{ scaleY: 0.88 }],
  },
  leaf: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  leafSpark: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  spark1: {
    left: 118,
    top: 68,
    opacity: 0.7
  },
  spark2: {
    left: 82,
    top: 74,
    opacity: 0.65
  },
  spark3: {
    left: 146,
    top: 98,
    opacity: 0.5
  },
  rootShadow: {
    position: 'absolute',
    bottom: 68,
    width: 220,
    height: 46,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.26)',
    transform: [{ scaleY: 0.48 }],
  },
  ground: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.22)',
    marginTop: 18,
  }
});
