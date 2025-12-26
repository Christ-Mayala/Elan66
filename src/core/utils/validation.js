export const nonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

export const clampInt = (n, min, max) => {
  const x = Number.parseInt(String(n), 10);
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, x));
};
