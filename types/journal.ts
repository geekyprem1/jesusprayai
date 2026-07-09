export type PrayerCategory =
  | "gratitude"
  | "intercession"
  | "petition"
  | "confession"
  | "praise"
  | "uncategorized";

export type PrayerEntry = {
  id: string;
  user_id: string;
  body_html: string;
  body_plain: string;
  category: PrayerCategory;
  category_source: "ai" | "user";
  source: "text" | "voice";
  client_id: string | null;
  created_at: string;
  updated_at: string;
};

export type JournalEntryView = {
  id: string;
  body: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  clientId?: string | null;
  syncState?: "synced" | "local" | "pending";
};
