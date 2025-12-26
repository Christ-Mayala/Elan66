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
    title: { fontSize: 24, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    body: { fontSize: 15, fontWeight: '400', color: colors.text },
    muted: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
    mono: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  },
};
