import type { SQLiteDatabase } from 'expo-sqlite';

import type { AppSettings, MeditationCompletion, StreakState, Verse } from '../types';
import { addDaysToDateString } from '../utils/date';

const DEFAULT_SETTINGS: AppSettings = {
  notificationHour: 8,
  notificationIdentifier: null,
  notificationMinute: 0,
  notificationsEnabled: false,
};

export async function getTodayVerse(db: SQLiteDatabase, dateKey: string) {
  const row = await db.getFirstAsync<Verse>(
    `SELECT
       v.id,
       v.date_key,
       v.reference,
       v.text,
       v.translation,
       v.theme,
       CASE WHEN s.verse_id IS NULL THEN 0 ELSE 1 END AS is_saved
     FROM daily_verses v
     LEFT JOIN saved_verses s ON s.verse_id = v.id
     WHERE v.date_key = ?
     LIMIT 1`,
    dateKey,
  );

  if (row) {
    return row;
  }

  return db.getFirstAsync<Verse>(
    `SELECT
       v.id,
       v.date_key,
       v.reference,
       v.text,
       v.translation,
       v.theme,
       CASE WHEN s.verse_id IS NULL THEN 0 ELSE 1 END AS is_saved
     FROM daily_verses v
     LEFT JOIN saved_verses s ON s.verse_id = v.id
     ORDER BY v.date_key ASC
     LIMIT 1`,
  );
}

export async function getSavedVerses(db: SQLiteDatabase) {
  return db.getAllAsync<Verse>(
    `SELECT
       v.id,
       v.date_key,
       v.reference,
       v.text,
       v.translation,
       v.theme,
       1 AS is_saved
     FROM saved_verses s
     JOIN daily_verses v ON v.id = s.verse_id
     ORDER BY s.saved_at DESC`,
  );
}

export async function toggleSavedVerse(db: SQLiteDatabase, verseId: string) {
  const existing = await db.getFirstAsync<{ verse_id: string }>(
    'SELECT verse_id FROM saved_verses WHERE verse_id = ? LIMIT 1',
    verseId,
  );

  if (existing) {
    await db.runAsync('DELETE FROM saved_verses WHERE verse_id = ?', verseId);
    return false;
  }

  await db.runAsync('INSERT INTO saved_verses (verse_id, saved_at) VALUES (?, ?)', verseId, new Date().toISOString());
  return true;
}

export async function getSetting(db: SQLiteDatabase, key: string) {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ? LIMIT 1', key);
  return row?.value ?? null;
}

export async function setSetting(db: SQLiteDatabase, key: string, value: string) {
  await db.runAsync(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = excluded.updated_at`,
    key,
    value,
    new Date().toISOString(),
  );
}

export async function getAppSettings(db: SQLiteDatabase): Promise<AppSettings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM app_settings');
  const values = new Map(rows.map((row) => [row.key, row.value]));

  return {
    notificationHour: parseBoundedNumber(values.get('notification_hour'), 0, 23, DEFAULT_SETTINGS.notificationHour),
    notificationIdentifier: values.get('notification_identifier') ?? null,
    notificationMinute: parseBoundedNumber(
      values.get('notification_minute'),
      0,
      59,
      DEFAULT_SETTINGS.notificationMinute,
    ),
    notificationsEnabled: values.get('notifications_enabled') === 'true',
  };
}

export async function saveNotificationSettings(
  db: SQLiteDatabase,
  input: Pick<AppSettings, 'notificationHour' | 'notificationMinute' | 'notificationIdentifier' | 'notificationsEnabled'>,
) {
  await setSetting(db, 'notification_hour', String(input.notificationHour));
  await setSetting(db, 'notification_minute', String(input.notificationMinute));
  await setSetting(db, 'notifications_enabled', String(input.notificationsEnabled));

  if (input.notificationIdentifier) {
    await setSetting(db, 'notification_identifier', input.notificationIdentifier);
  } else {
    await db.runAsync('DELETE FROM app_settings WHERE key = ?', 'notification_identifier');
  }
}

export async function getStreakState(db: SQLiteDatabase): Promise<StreakState> {
  const row = await db.getFirstAsync<StreakState>(
    'SELECT id, current_count, longest_count, last_completed_date FROM streak_state WHERE id = 1 LIMIT 1',
  );

  if (row) {
    return row;
  }

  await db.runAsync(
    'INSERT INTO streak_state (id, current_count, longest_count, last_completed_date) VALUES (1, 0, 0, NULL)',
  );

  return {
    current_count: 0,
    id: 1,
    last_completed_date: null,
    longest_count: 0,
  };
}

export async function completeMeditationSession(
  db: SQLiteDatabase,
  completedDate: string,
  verseId: string,
  durationSeconds: number,
): Promise<MeditationCompletion> {
  let streak = await getStreakState(db);
  let didIncrement = false;

  await db.withTransactionAsync(async () => {
    const existing = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM meditation_logs WHERE completed_date = ? LIMIT 1',
      completedDate,
    );

    if (existing) {
      return;
    }

    await db.runAsync(
      'INSERT INTO meditation_logs (verse_id, completed_date, completed_at, duration_seconds) VALUES (?, ?, ?, ?)',
      verseId,
      completedDate,
      new Date().toISOString(),
      durationSeconds,
    );

    const nextCount =
      streak.last_completed_date && addDaysToDateString(streak.last_completed_date, 1) === completedDate
        ? streak.current_count + 1
        : 1;
    const nextLongest = Math.max(streak.longest_count, nextCount);

    await db.runAsync(
      'UPDATE streak_state SET current_count = ?, longest_count = ?, last_completed_date = ? WHERE id = 1',
      nextCount,
      nextLongest,
      completedDate,
    );

    streak = {
      current_count: nextCount,
      id: 1,
      last_completed_date: completedDate,
      longest_count: nextLongest,
    };
    didIncrement = true;
  });

  return { didIncrement, streak };
}

function parseBoundedNumber(value: string | undefined, min: number, max: number, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    return fallback;
  }

  return parsed;
}
