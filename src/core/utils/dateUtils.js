const pad2 = (n) => String(n).padStart(2, '0');

export const toLocalDateId = (date = new Date()) => {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
};

export const fromLocalDateId = (dateId) => {
  const [y, m, d] = dateId.split('-').map((x) => Number(x));
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

export const diffDaysLocal = (aDateId, bDateId) => {
  const a = fromLocalDateId(aDateId).getTime();
  const b = fromLocalDateId(bDateId).getTime();
  const ms = a - b;
  return Math.round(ms / (24 * 60 * 60 * 1000));
};

export const addDaysLocal = (dateId, deltaDays) => {
  const d = fromLocalDateId(dateId);
  d.setDate(d.getDate() + deltaDays);
  return toLocalDateId(d);
};

export const isFutureLocal = (dateId, now = new Date()) => {
  const today = toLocalDateId(now);
  return diffDaysLocal(dateId, today) > 0;
};

export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export const dayIndexFromStart = (startDateId, dateId) => diffDaysLocal(dateId, startDateId) + 1;

export const phaseForDayIndex = (dayIndex) => {
  if (dayIndex <= 22) return 1;
  if (dayIndex <= 44) return 2;
  return 3;
};

export const phaseProgress = (dayIndex) => {
  const phase = phaseForDayIndex(dayIndex);
  const start = phase === 1 ? 1 : phase === 2 ? 23 : 45;
  const end = phase === 1 ? 22 : phase === 2 ? 44 : 66;
  return { phase, inPhase: dayIndex - start + 1, phaseTotal: end - start + 1, start, end };
};

export const formatDate = (dateId, locale = 'fr-FR') => {
  const date = new Date(dateId);
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
