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

export type AppSettings = {
  notificationHour: number;
  notificationMinute: number;
  notificationIdentifier: string | null;
  notificationsEnabled: boolean;
};
