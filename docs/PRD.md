# BibleFit PRD

## Overview
BibleFit is a free local-first Expo mobile app for building a daily Bible habit with one Korean verse per day, focused meditation sessions, local notifications, saved verses, and card sharing.

## MVP Scope
- Today tab: date, daily Korean verse card, save/share actions, and a short reflection block.
- Meditation tab: today's verse, 1/3/5 minute timer, and optional local background music.
- Saved tab: saved verse list and removal.
- Settings tab: daily local notification time, notification enable/disable, privacy, Bible source, and app information.
- Android/iOS app implementation with Expo, React Native, and TypeScript.
- No Gemini or external generative API is used in the MVP.

## Storage Policy
- Do not use `AsyncStorage`.
- Persist all app data in `biblefit.db` through `expo-sqlite`.
- Keep SQL in repository/service functions; screens must not contain raw SQL.
- Seed MVP daily verses locally and reserve the schema for later full-Bible search, notes, and sync.

## SQLite Schema
- `daily_verses(id, date_key, reference, text, translation, theme)`
- `saved_verses(verse_id, saved_at)`
- `app_settings(key, value, updated_at)`

## Post-MVP
- Add full Bible tables and FTS search.
- Add personal meditation notes and optional Supabase sync.
- Add widgets in a separate dev-build phase.
- Revisit generated interpretation only with a server-side proxy, budget limits, and explicit paid-feature planning.
