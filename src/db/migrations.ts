import type { SQLiteDatabase } from 'expo-sqlite';

import { DAILY_VERSES } from '../data/seedVerses';

const DATABASE_VERSION = 5;

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

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_daily_verses_date_key ON daily_verses(date_key);
      CREATE INDEX IF NOT EXISTS idx_saved_verses_saved_at ON saved_verses(saved_at);
    `);

    await seedDefaults(db);
  }

  if (currentVersion < 4) {
    await syncDailyVerses(db);
  }

  if (currentVersion < 3) {
    await db.runAsync('DROP TABLE IF EXISTS ai_interpretations');
  }

  if (currentVersion < 5) {
    await db.runAsync('DROP TABLE IF EXISTS meditation_logs');
    await db.runAsync('DROP TABLE IF EXISTS streak_state');
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  console.info('[BibleFit] SQLite migration completed');
}

async function syncDailyVerses(db: SQLiteDatabase) {
  for (const verse of DAILY_VERSES) {
    await db.runAsync(
      `INSERT INTO daily_verses (id, date_key, reference, text, translation, theme)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         date_key = excluded.date_key,
         reference = excluded.reference,
         text = excluded.text,
         translation = excluded.translation,
         theme = excluded.theme`,
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
}
