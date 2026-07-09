export type BibleTranslation = "KJV" | "NIV" | "ESV";

export type BiblePassage = {
  reference: string;
  text: string;
  translation: BibleTranslation;
  provider: "bible-api.com" | "api.bible";
};

export type BibleLookupResult =
  | { ok: true; passage: BiblePassage }
  | { ok: false; error: string };
