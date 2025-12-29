import * as SQLite from 'expo-sqlite';

const DB_NAME = 'elan66.db';

let dbPromise;

const migrateV1 = async (db) => {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      replacement TEXT,
      commitment TEXT,
      discipline_mode TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT,
      archived_at TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      day_index INTEGER NOT NULL,
      state TEXT,
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE (habit_id, date)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sos_events (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE (habit_id, date)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execAsync('CREATE INDEX IF NOT EXISTS idx_daily_logs_habit_date ON daily_logs(habit_id, date);');
  await db.execAsync('CREATE INDEX IF NOT EXISTS idx_sos_events_habit_date ON sos_events(habit_id, date);');
};

const migrateV2 = async (db) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      text TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(date)
    );
  `);
  await db.execAsync('CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries(date);');
};

const migrateV3 = async (db) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      pinned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );
  `);

  await db.execAsync('CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);');
  await db.execAsync('CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON notes(deleted_at);');

  const legacy = await db.getAllAsync('SELECT id, date, text, created_at, updated_at FROM diary_entries;');
  for (const e of legacy || []) {
    const id = String(e.id);
    const title = String(e.date || '').trim() ? `Journal — ${String(e.date)}` : 'Journal';
    const body = String(e.text || '');
    const created = String(e.created_at || new Date().toISOString());
    const updated = String(e.updated_at || created);
    await db.runAsync(
      'INSERT INTO notes(id,title,body,pinned,created_at,updated_at,deleted_at) VALUES(?,?,?,?,?,?,NULL) ON CONFLICT(id) DO NOTHING;',
      [id, title, body, 0, created, updated]
    );
  }
};

const migrate = async (db) => {
  const row = await db.getFirstAsync('PRAGMA user_version;');
  const current = Number(row?.user_version || 0);
  if (current < 1) {
    await migrateV1(db);
    await db.execAsync('PRAGMA user_version = 1;');
  }
  const row2 = await db.getFirstAsync('PRAGMA user_version;');
  const current2 = Number(row2?.user_version || 0);
  if (current2 < 2) {
    await migrateV2(db);
    await db.execAsync('PRAGMA user_version = 2;');
  }

  const row3 = await db.getFirstAsync('PRAGMA user_version;');
  const current3 = Number(row3?.user_version || 0);
  if (current3 < 3) {
    await migrateV3(db);
    await db.execAsync('PRAGMA user_version = 3;');
  }
};

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  const db = await dbPromise;
  await migrate(db);
  return db;
};

export const wipeAllData = async () => {
  const db = await getDb();
  await db.execAsync('PRAGMA foreign_keys = OFF;');
  await db.execAsync('DROP TABLE IF EXISTS sos_events;');
  await db.execAsync('DROP TABLE IF EXISTS daily_logs;');
  await db.execAsync('DROP TABLE IF EXISTS habits;');
  await db.execAsync('DROP TABLE IF EXISTS app_settings;');
  await db.execAsync('DROP TABLE IF EXISTS diary_entries;');
  await db.execAsync('DROP TABLE IF EXISTS notes;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync('PRAGMA user_version = 0;');
  await migrate(db);
};
