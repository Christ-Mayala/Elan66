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
    title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.2 },
    subtitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    body: { fontSize: 15, fontWeight: '400', color: colors.text },
    muted: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
    mono: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  },
};
