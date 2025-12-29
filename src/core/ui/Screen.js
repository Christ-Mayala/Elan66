import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { theme } from '../theme/theme';

export function Screen({ children, style }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  inner: { flex: 1, paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.l, paddingBottom: 96 },
});
