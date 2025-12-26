import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getDb, wipeAllData } from '../db/database';

export const EXPORT_SCHEMA_VERSION = 1;

export const exportAllDataToJson = async () => {
  const db = await getDb();

  const habits = await db.getAllAsync('SELECT * FROM habits ORDER BY created_at ASC;');
  const logs = await db.getAllAsync('SELECT * FROM daily_logs ORDER BY date ASC;');
  const sos = await db.getAllAsync('SELECT * FROM sos_events ORDER BY date ASC;');
  const settings = await db.getAllAsync('SELECT * FROM app_settings ORDER BY key ASC;');

  const payload = {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: { habits, logs, sos, settings },
  };

  const json = JSON.stringify(payload, null, 2);
  const fileName = `elan66-export-${Date.now()}.json`;
  const path = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType: 'application/json',
      dialogTitle: 'Exporter les données (JSON)',
      UTI: 'public.json',
    });
  }

  return { path };
};

const validatePayload = (payload) => {
  if (!payload || typeof payload !== 'object') throw new Error('INVALID_EXPORT');
  if (payload.schemaVersion !== EXPORT_SCHEMA_VERSION) throw new Error('UNSUPPORTED_SCHEMA');
  const d = payload.data;
  if (!d || typeof d !== 'object') throw new Error('INVALID_EXPORT');
  if (!Array.isArray(d.habits) || !Array.isArray(d.logs) || !Array.isArray(d.sos) || !Array.isArray(d.settings)) {
    throw new Error('INVALID_EXPORT');
  }
  return d;
};

export const importAllDataFromJson = async ({ replaceAll = true } = {}) => {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/json'], copyToCacheDirectory: true });
  if (result.canceled) return { canceled: true };

  const file = result.assets?.[0];
  if (!file?.uri) throw new Error('IMPORT_READ_FAIL');

  const json = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });
  const payload = JSON.parse(json);
  const data = validatePayload(payload);

  const db = await getDb();

  if (replaceAll) {
    await wipeAllData();
  }

  await db.execAsync('PRAGMA foreign_keys = OFF;');

  for (const h of data.habits) {
    await db.runAsync(
      `
      INSERT INTO habits(id,name,description,replacement,commitment,discipline_mode,duration_days,start_date,status,created_at,updated_at,completed_at,archived_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        description=excluded.description,
        replacement=excluded.replacement,
        commitment=excluded.commitment,
        discipline_mode=excluded.discipline_mode,
        duration_days=excluded.duration_days,
        start_date=excluded.start_date,
        status=excluded.status,
        created_at=excluded.created_at,
        updated_at=excluded.updated_at,
        completed_at=excluded.completed_at,
        archived_at=excluded.archived_at;
    `,
      [
        h.id,
        h.name,
        h.description,
        h.replacement,
        h.commitment,
        h.discipline_mode,
        h.duration_days,
        h.start_date,
        h.status,
        h.created_at,
        h.updated_at,
        h.completed_at,
        h.archived_at,
      ]
    );
  }

  for (const l of data.logs) {
    await db.runAsync(
      `
      INSERT INTO daily_logs(id,habit_id,date,day_index,state,note,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?)
      ON CONFLICT(habit_id, date) DO UPDATE SET
        id=excluded.id,
        day_index=excluded.day_index,
        state=excluded.state,
        note=excluded.note,
        created_at=excluded.created_at,
        updated_at=excluded.updated_at;
    `,
      [l.id, l.habit_id, l.date, l.day_index, l.state, l.note, l.created_at, l.updated_at]
    );
  }

  for (const s of data.sos) {
    await db.runAsync(
      `
      INSERT INTO sos_events(id,habit_id,date,created_at)
      VALUES(?,?,?,?)
      ON CONFLICT(habit_id, date) DO UPDATE SET
        id=excluded.id,
        created_at=excluded.created_at;
    `,
      [s.id, s.habit_id, s.date, s.created_at]
    );
  }

  for (const st of data.settings) {
    await db.runAsync(
      `
      INSERT INTO app_settings(key,value,updated_at)
      VALUES(?,?,?)
      ON CONFLICT(key) DO UPDATE SET
        value=excluded.value,
        updated_at=excluded.updated_at;
    `,
      [st.key, st.value, st.updated_at]
    );
  }

  await db.execAsync('PRAGMA foreign_keys = ON;');

  return { imported: true, counts: { habits: data.habits.length, logs: data.logs.length, sos: data.sos.length, settings: data.settings.length } };
};
