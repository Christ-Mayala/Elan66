import React, { useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { theme } from '../theme/theme';

const LINE_H = 26;
const TOP = 18;
const LINE_COUNT = 48;
const MARGIN_X = 46;

export function NotepadInput({
  value,
  onChangeText,
  placeholder,
  editable = true,
  minHeight = 180,
  style,
  inputStyle,
  placeholderTextColor = theme.colors.textMuted,
  ...props
}) {
  const lines = useMemo(() => Array.from({ length: LINE_COUNT }, (_, i) => i), []);

  return (
    <View style={[styles.outer, { minHeight }, style]}>
      <View style={[styles.clip, { minHeight }]}>
        <View pointerEvents="none" style={styles.paper}>
          <View style={styles.marginLine} />
          {lines.map((i) => (
            <View key={i} style={[styles.line, { top: TOP + i * LINE_H }]} />
          ))}
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          editable={editable}
          multiline
          textAlignVertical="top"
          style={[styles.input, { minHeight }, inputStyle]}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: theme.radius.xl,
  },
  clip: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.paperEdge,
    backgroundColor: theme.colors.paper,
    overflow: 'hidden',
  },
  paper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.paper,
  },
  marginLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: MARGIN_X,
    width: 2,
    backgroundColor: theme.colors.paperMargin,
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.paperLine,
  },
  input: {
    paddingTop: TOP,
    paddingBottom: TOP,
    paddingLeft: MARGIN_X + 16,
    paddingRight: 16,
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: LINE_H,
    fontWeight: '500',
  },
});
