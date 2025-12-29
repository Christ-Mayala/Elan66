import { colors } from './colors';

export const theme = {
  colors,
  radius: {
    s: 12,
    m: 16,
    l: 22,
    xl: 28,
  },
  spacing: {
    xs: 8,
    s: 12,
    m: 16,
    l: 20,
    xl: 28,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.38,
      shadowRadius: 26,
      elevation: 10,
    },
    floating: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.46,
      shadowRadius: 30,
      elevation: 14,
    },
  },
  text: {
    display: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -0.6 },
    title: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
    subtitle: { fontSize: 16, fontWeight: '700', color: colors.text, letterSpacing: -0.1 },
    body: { fontSize: 15, fontWeight: '500', color: colors.text, letterSpacing: -0.1, lineHeight: 22 },
    muted: { fontSize: 13, fontWeight: '500', color: colors.textMuted, lineHeight: 18 },
    mono: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
    caption: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  },
};
