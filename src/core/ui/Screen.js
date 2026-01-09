import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

export function Screen({ children, style, padTop = true, padBottom = true, padX = true }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View
        style={[
          styles.inner,
          {
            paddingHorizontal: padX ? theme.spacing.l : 0,
            paddingTop: padTop ? theme.spacing.l : 0,
            paddingBottom: padBottom ? 96 : 0,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  inner: { flex: 1 },
});
