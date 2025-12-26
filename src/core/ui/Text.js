import React from 'react';
import { Text as RNText } from 'react-native';
import { theme } from '../theme/theme';

export function Text({ variant = 'body', style, children, ...props }) {
  return (
    <RNText style={[theme.text[variant] || theme.text.body, style]} {...props}>
      {children}
    </RNText>
  );
}
