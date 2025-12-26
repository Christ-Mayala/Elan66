import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../../../core/theme/theme';
import { phaseCopy } from '../../../core/utils/constants';

const clamp01 = (n) => Math.max(0, Math.min(1, n));

export function PlantProgress({ dayIndex, durationDays, size = 'm' }) {
  const dims = size === 's'
    ? { h: 52, w: 120, stemW: 6, leaf: 14 }
    : size === 'l'
      ? { h: 92, w: 220, stemW: 8, leaf: 18 }
      : { h: 72, w: 180, stemW: 7, leaf: 16 };

  const pct = useMemo(() => {
    const d = Math.max(1, Number(durationDays) || 66);
    const di = Math.max(1, Math.min(Number(dayIndex) || 1, d));
    return clamp01((di - 1) / (d - 1 || 1));
  }, [dayIndex, durationDays]);

  const growth = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(growth, { toValue: pct, duration: 520, useNativeDriver: false }).start();
  }, [pct, growth]);

  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1100, useNativeDriver: false }),
        Animated.timing(sway, { toValue: 0, duration: 1100, useNativeDriver: false }),
      ])
    );
    a.start();
    return () => a.stop();
  }, [sway]);

  const stemFillH = growth.interpolate({ inputRange: [0, 1], outputRange: [0, dims.h] });
  const swayDeg = sway.interpolate({ inputRange: [0, 1], outputRange: ['-1.4deg', '1.4deg'] });

  const p1 = phaseCopy[1].color;
  const p2 = phaseCopy[2].color;
  const p3 = phaseCopy[3].color;

  const leaf1Opacity = growth.interpolate({ inputRange: [0, 0.22, 0.33], outputRange: [0, 0, 1] });
  const leaf2Opacity = growth.interpolate({ inputRange: [0, 0.55, 0.66], outputRange: [0, 0, 1] });
  const leaf3Opacity = growth.interpolate({ inputRange: [0, 0.88, 1], outputRange: [0, 0, 1] });

  return (
    <View style={[styles.wrap, { height: dims.h, width: dims.w }]}>
      <View style={[styles.pot, { width: 42, height: 16 }]} />

      <Animated.View style={[styles.stemWrap, { height: dims.h, transform: [{ rotate: swayDeg }] }]}>
        <View style={[styles.stemTrack, { width: dims.stemW, height: dims.h }]}>
          <Animated.View style={[styles.stemFill, { width: dims.stemW, height: stemFillH }]} />
        </View>

        <Animated.View style={[styles.leafRow, { top: Math.round(dims.h * 0.33) }, { opacity: leaf1Opacity }]}>
          <Leaf size={dims.leaf} color={p1} flip={false} />
          <Leaf size={dims.leaf} color={p1} flip />
        </Animated.View>

        <Animated.View style={[styles.leafRow, { top: Math.round(dims.h * 0.66) }, { opacity: leaf2Opacity }]}>
          <Leaf size={dims.leaf} color={p2} flip={false} />
          <Leaf size={dims.leaf} color={p2} flip />
        </Animated.View>

        <Animated.View style={[styles.leafRow, { top: Math.round(dims.h * 0.92) }, { opacity: leaf3Opacity }]}>
          <Leaf size={dims.leaf} color={p3} flip={false} />
          <Leaf size={dims.leaf} color={p3} flip />
        </Animated.View>

        <Animated.View style={[styles.bud, { opacity: leaf3Opacity }]} />
      </Animated.View>

      <View style={[styles.ground, { width: '100%' }]} />
    </View>
  );
}

function Leaf({ size, color, flip }) {
  return (
    <View
      style={{
        width: size,
        height: size * 0.75,
        borderTopLeftRadius: size,
        borderTopRightRadius: size,
        borderBottomLeftRadius: size,
        borderBottomRightRadius: size,
        backgroundColor: color,
        opacity: 0.92,
        transform: [{ rotate: flip ? '-28deg' : '28deg' }, { scaleX: flip ? -1 : 1 }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  pot: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'absolute',
    bottom: 0,
  },
  ground: {
    position: 'absolute',
    bottom: 14,
    height: 1,
    backgroundColor: 'rgba(148,163,184,0.22)',
  },
  stemWrap: {
    position: 'absolute',
    bottom: 14,
    left: '50%',
    marginLeft: -4,
    width: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  stemTrack: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 99,
    backgroundColor: 'rgba(15,26,51,0.70)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  stemFill: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(34,211,238,0.75)',
  },
  leafRow: {
    position: 'absolute',
    left: -24,
    right: -24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  bud: {
    position: 'absolute',
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.text,
    opacity: 0.95,
  },
});
