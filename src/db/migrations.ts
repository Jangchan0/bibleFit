import type { SQLiteDatabase } from 'expo-sqlite';

import { DAILY_VERSES } from '../data/seedVerses';

const DATABASE_VERSION = 1;

export async function configureDbConnection(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  console.info('[BibleFit] SQLite migration started');

  await configureDbConnection(db);

  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    console.info('[BibleFit] SQLite migration skipped');
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_verses (
        id TEXT PRIMARY KEY NOT NULL,
        date_key TEXT NOT NULL UNIQUE,
        reference TEXT NOT NULL,
        text TEXT NOT NULL,
        translation TEXT NOT NULL,
        theme TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS saved_verses (
        verse_id TEXT PRIMARY KEY NOT NULL,
        saved_at TEXT NOT NULL,
        FOREIGN KEY (verse_id) REFERENCES daily_verses(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ai_interpretations (
        verse_id TEXT PRIMARY KEY NOT NULL,
        model TEXT NOT NULL,
        prompt_version TEXT NOT NULL,
        interpretation TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (verse_id) REFERENCES daily_verses(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS meditation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id TEXT NOT NULL,
        completed_date TEXT NOT NULL UNIQUE,
        completed_at TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        FOREIGN KEY (verse_id) REFERENCES daily_verses(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS streak_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        current_count INTEGER NOT NULL,
        longest_count INTEGER NOT NULL,
        last_completed_date TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_daily_verses_date_key ON daily_verses(date_key);
      CREATE INDEX IF NOT EXISTS idx_saved_verses_saved_at ON saved_verses(saved_at);
      CREATE INDEX IF NOT EXISTS idx_meditation_logs_completed_date ON meditation_logs(completed_date);
    `);

    await seedDailyVerses(db);
    await seedDefaults(db);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  console.info('[BibleFit] SQLite migration completed');
}

async function seedDailyVerses(db: SQLiteDatabase) {
  const countRow = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM daily_verses');

  if ((countRow?.count ?? 0) > 0) {
    return;
  }

  for (const verse of DAILY_VERSES) {
    await db.runAsync(
      'INSERT OR IGNORE INTO daily_verses (id, date_key, reference, text, translation, theme) VALUES (?, ?, ?, ?, ?, ?)',
      verse.id,
      verse.dateKey,
      verse.reference,
      verse.text,
      verse.translation,
      verse.theme,
    );
  }
}

async function seedDefaults(db: SQLiteDatabase) {
  const now = new Date().toISOString();

  await db.runAsync(
    'INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)',
    'notification_hour',
    '8',
    now,
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)',
    'notification_minute',
    '0',
    now,
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)',
    'notifications_enabled',
    'false',
    now,
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO streak_state (id, current_count, longest_count, last_completed_date) VALUES (1, 0, 0, NULL)',
  );
}
