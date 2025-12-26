import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../../../core/theme/theme';
import { phaseCopy } from '../../../core/utils/constants';

export function RouteProgress({ dayIndex, durationDays }) {
  const pct = useMemo(() => {
    const d = Math.max(1, Number(durationDays) || 66);
    const di = Math.max(1, Math.min(Number(dayIndex) || 1, d));
    return (di - 1) / (d - 1 || 1);
  }, [dayIndex, durationDays]);

  const x = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(x, { toValue: pct, duration: 500, useNativeDriver: false }).start();
  }, [pct, x]);

  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 650, useNativeDriver: false }),
      ])
    );
    a.start();
    return () => a.stop();
  }, [pulse]);

  const markerScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] });
  const markerOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  const left = x.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const p1 = phaseCopy[1].color;
  const p2 = phaseCopy[2].color;
  const p3 = phaseCopy[3].color;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.seg, { backgroundColor: p1, left: 0, width: '33.33%' }]} />
        <View style={[styles.seg, { backgroundColor: p2, left: '33.33%', width: '33.33%' }]} />
        <View style={[styles.seg, { backgroundColor: p3, left: '66.66%', width: '33.34%' }]} />

        <Animated.View style={[styles.markerWrap, { left }]}>
          <Animated.View style={[styles.marker, { transform: [{ translateX: -8 }, { scale: markerScale }], opacity: markerOpacity }]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 4 },
  track: {
    height: 10,
    borderRadius: 99,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  seg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    opacity: 0.55,
  },
  markerWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  marker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.bg,
  },
});
