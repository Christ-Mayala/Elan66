import { colors } from './colors';

export const theme = {
  colors,
  radius: {
    s: 10,
    m: 14,
    l: 18,
  },
  spacing: {
    xs: 8,
    s: 12,
    m: 16,
    l: 20,
    xl: 28,
  },
  text: {
    display: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -0.6 },
    title: { fontSize: 28, fontWeight: '850', color: colors.text, letterSpacing: -0.3 },
    subtitle: { fontSize: 16, fontWeight: '750', color: colors.text },
    body: { fontSize: 15, fontWeight: '450', color: colors.text, lineHeight: 22 },
    muted: { fontSize: 13, fontWeight: '550', color: colors.textMuted, lineHeight: 18 },
    mono: { fontSize: 12, fontWeight: '750', color: colors.textMuted },
    caption: { fontSize: 12, fontWeight: '550', color: colors.textMuted },
  },
};
