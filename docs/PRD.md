# BibleFit PRD

## Overview
BibleFit is a local-first Expo mobile app for building a daily Bible habit with one verse per day, a 60-second meditation timer, AI interpretation, local notifications, saved verses, and card sharing.

## MVP Scope
- Today tab: date, daily verse card, save/share actions, AI interpretation, meditation timer, streak status.
- Saved tab: saved verse list and removal.
- Settings tab: daily local notification time, notification enable/disable, streak summary, app information.
- Android/iOS app implementation with Expo, React Native, and TypeScript.

## Storage Policy
- Do not use `AsyncStorage`.
- Persist all app data in `biblefit.db` through `expo-sqlite`.
- Keep SQL in repository/service functions; screens must not contain raw SQL.
- Seed MVP daily verses locally and reserve the schema for later full-Bible search, notes, and sync.

## SQLite Schema
- `daily_verses(id, date_key, reference, text, translation, theme)`
- `saved_verses(verse_id, saved_at)`
- `ai_interpretations(verse_id, model, prompt_version, interpretation, created_at)`
- `app_settings(key, value, updated_at)`
- `meditation_logs(id, verse_id, completed_date, completed_at, duration_seconds)`
- `streak_state(id, current_count, longest_count, last_completed_date)`

## Post-MVP
- Add full Bible tables and FTS search.
- Add personal meditation notes and optional Supabase sync.
- Add widgets in a separate dev-build phase.
