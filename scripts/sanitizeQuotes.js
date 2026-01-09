const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'core', 'services', 'quotes.json');
const raw = fs.readFileSync(file, 'utf8');
const data = JSON.parse(raw);

const clean = (s) =>
  String(s || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const out = Array.isArray(data)
  ? data
      .map((q) => ({ author: clean(q.author), text: clean(q.text) }))
      .filter((q) => q.author && q.text)
  : [];

fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`quotes: ${out.length}`);
