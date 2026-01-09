import { getDb } from './database';

export const SettingsKeys = {
  dailyReminderTime: 'dailyReminderTime',
  onboardingDone: 'onboardingDone',
  quoteSchedule: 'quoteSchedule',
};

export const getSetting = async (key) => {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT key, value FROM app_settings WHERE key = ?;', [key]);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
};

export const setSetting = async (key, value) => {
  const db = await getDb();
  const now = new Date().toISOString();
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  await db.runAsync(
    'INSERT INTO app_settings(key, value, updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;',
    [key, str, now]
  );
};

export const getAllSettings = async () => {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT key, value, updated_at FROM app_settings;');
  return rows.map((r) => {
    let v = r.value;
    try {
      v = JSON.parse(r.value);
    } catch {}
    return { key: r.key, value: v, updated_at: r.updated_at };
  });
};
