import { getDb } from '../../../core/db/database';
import { createId } from '../../../core/utils/id';

export const getDiaryEntryByDate = async (dateId) => {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM diary_entries WHERE date = ?;', [dateId]);
};

export const upsertDiaryEntry = async ({ dateId, text }) => {
  const db = await getDb();
  const now = new Date().toISOString();

  const existing = await getDiaryEntryByDate(dateId);
  if (!existing) {
    const id = createId();
    await db.runAsync(
      'INSERT INTO diary_entries(id, date, text, created_at, updated_at) VALUES(?,?,?,?,?);',
      [id, dateId, text || '', now, now]
    );
    return getDiaryEntryByDate(dateId);
  }

  await db.runAsync('UPDATE diary_entries SET text = ?, updated_at = ? WHERE id = ?;', [text || '', now, existing.id]);
  return getDiaryEntryByDate(dateId);
};

export const listRecentDiaryEntries = async (limit = 30) => {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM diary_entries ORDER BY date DESC LIMIT ?;', [Number(limit)]);
};
