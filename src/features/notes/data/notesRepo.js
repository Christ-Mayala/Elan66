import { getDb } from '../../../core/db/database';
import { createId } from '../../../core/utils/id';

const nowIso = () => new Date().toISOString();

export const listNotes = async ({ includeDeleted = false } = {}) => {
  const db = await getDb();
  const where = includeDeleted ? '' : 'WHERE deleted_at IS NULL';
  const rows = await db.getAllAsync(`SELECT * FROM notes ${where} ORDER BY pinned DESC, updated_at DESC;`);
  return rows;
};

export const getNoteById = async (id) => {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM notes WHERE id = ?;', [id]);
};

export const createNote = async ({ title = '', body = '', pinned = 0 } = {}) => {
  const db = await getDb();
  const id = createId();
  const now = nowIso();
  await db.runAsync(
    'INSERT INTO notes(id,title,body,pinned,created_at,updated_at,deleted_at) VALUES(?,?,?,?,?,?,NULL);',
    [id, String(title || ''), String(body || ''), Number(pinned) ? 1 : 0, now, now]
  );
  return getNoteById(id);
};

export const updateNote = async ({ id, title, body, pinned }) => {
  const db = await getDb();
  const prev = await getNoteById(id);
  if (!prev) return null;
  const now = nowIso();
  const nextTitle = title === undefined ? prev.title : String(title || '');
  const nextBody = body === undefined ? prev.body : String(body || '');
  const nextPinned = pinned === undefined ? prev.pinned : Number(pinned) ? 1 : 0;
  await db.runAsync('UPDATE notes SET title = ?, body = ?, pinned = ?, updated_at = ? WHERE id = ?;', [nextTitle, nextBody, nextPinned, now, id]);
  return getNoteById(id);
};

export const softDeleteNote = async (id) => {
  const db = await getDb();
  const now = nowIso();
  await db.runAsync('UPDATE notes SET deleted_at = ?, updated_at = ? WHERE id = ?;', [now, now, id]);
};

export const restoreNote = async (id) => {
  const db = await getDb();
  const now = nowIso();
  await db.runAsync('UPDATE notes SET deleted_at = NULL, updated_at = ? WHERE id = ?;', [now, id]);
};

export const permanentlyDeleteNote = async (id) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM notes WHERE id = ?;', [id]);
};
