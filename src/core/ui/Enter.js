import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function Enter({ children, style, distance = 18, duration = 520 }) {
  const fade = useRef(new Animated.Value(0)).current;
  const up = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration, useNativeDriver: true }),
      Animated.timing(up, { toValue: 0, duration, useNativeDriver: true }),
    ]).start();
  }, [duration, fade, up]);

  return <Animated.View style={[{ opacity: fade, transform: [{ translateY: up }] }, style]}>{children}</Animated.View>;
}
