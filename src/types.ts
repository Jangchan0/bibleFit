export type Verse = {
  id: string;
  date_key: string;
  reference: string;
  text: string;
  translation: string;
  theme: string;
  is_saved?: number;
};

export type SeedVerse = {
  id: string;
  dateKey: string;
  reference: string;
  text: string;
  translation: string;
  theme: string;
};

export type AiInterpretation = {
  verse_id: string;
  model: string;
  prompt_version: string;
  interpretation: string;
  created_at: string;
};

export type AppSettings = {
  notificationHour: number;
  notificationMinute: number;
  notificationIdentifier: string | null;
  notificationsEnabled: boolean;
};

export type StreakState = {
  id: number;
  current_count: number;
  longest_count: number;
  last_completed_date: string | null;
};

export type MeditationCompletion = {
  didIncrement: boolean;
  streak: StreakState;
};
