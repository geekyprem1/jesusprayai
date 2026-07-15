import {
  getAllCuratedVerses,
  type CuratedVerse,
} from "@/lib/content/verses-by-topic";

export const WALLPAPER_VERSE_REFERENCES = [
  "Philippians 4:6-7",
  "1 Peter 5:7",
  "Psalm 94:19",
  "Isaiah 41:10",
  "Matthew 6:34",
  "John 14:27",
  "Matthew 6:25-26",
  "Psalm 55:22",
  "Proverbs 3:5-6",
  "Psalm 56:3",
  "Luke 12:25-26",
  "Psalm 103:2-3",
  "James 5:14-15",
  "Jeremiah 17:14",
  "Psalm 147:3",
  "3 John 1:2",
  "Isaiah 40:31",
  "Philippians 4:13",
  "Psalm 28:7",
  "2 Corinthians 12:9",
  "Ephesians 6:10",
  "Isaiah 26:3",
  "John 16:33",
  "Colossians 3:15",
  "Romans 15:13",
  "Numbers 6:24-26",
  "Lamentations 3:22-23",
  "Hebrews 6:19",
  "Psalm 42:11",
  "Jeremiah 29:11",
] as const;

function resolveWallpaperVerses(): readonly CuratedVerse[] {
  const byReference = new Map(
    getAllCuratedVerses().map((verse) => [verse.reference, verse])
  );

  const verses = WALLPAPER_VERSE_REFERENCES.map((reference) => {
    const verse = byReference.get(reference);
    if (!verse) throw new Error(`Missing wallpaper verse: ${reference}`);
    return verse;
  });

  if (verses.length !== 30) {
    throw new Error(`Expected 30 wallpaper verses, found ${verses.length}.`);
  }

  return verses;
}

/** Canonical text is resolved from the existing reviewed KJV topic catalog. */
export const WALLPAPER_VERSES = resolveWallpaperVerses();
