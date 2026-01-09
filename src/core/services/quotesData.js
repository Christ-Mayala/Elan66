import raw from './quotes.json';

export const QUOTES = Array.isArray(raw)
  ? raw
      .map((q) => ({ author: String(q?.author || '').trim(), text: String(q?.text || '').trim() }))
      .filter((q) => q.author && q.text)
  : [];

export const AUTHORS = Array.from(new Set(QUOTES.map((q) => q.author))).sort((a, b) => a.localeCompare(b, 'fr'));

export const quotesCount = () => QUOTES.length;

export const randomQuote = () => {
  if (!QUOTES.length) return null;
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  if (!q) return null;
  return { text: String(q.text || ''), author: String(q.author || '') };
};
