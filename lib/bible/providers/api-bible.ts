import type { BiblePassage, BibleTranslation } from "@/lib/bible/types";

/** API.Bible bible ids (common). Override via env if needed. */
const BIBLE_IDS: Record<BibleTranslation, string | undefined> = {
  KJV: process.env.API_BIBLE_ID_KJV || "de4e12af7f28f599-02",
  NIV: process.env.API_BIBLE_ID_NIV,
  ESV: process.env.API_BIBLE_ID_ESV,
};

/**
 * API.Bible fallback — requires BIBLE_API_KEY.
 * https://scripture.api.bible
 */
export async function fetchFromApiBible(
  reference: string,
  translation: BibleTranslation
): Promise<BiblePassage> {
  const apiKey = process.env.BIBLE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("BIBLE_API_KEY not set");
  }

  const bibleId = BIBLE_IDS[translation];
  if (!bibleId) {
    throw new Error(
      `No API.Bible id configured for ${translation}. Set API_BIBLE_ID_${translation}.`
    );
  }

  // Search for the passage
  const searchUrl = new URL(
    `https://api.scripture.api.bible/v1/bibles/${bibleId}/search`
  );
  searchUrl.searchParams.set("query", reference.trim());
  searchUrl.searchParams.set("limit", "1");

  const searchRes = await fetch(searchUrl.toString(), {
    headers: {
      "api-key": apiKey,
      Accept: "application/json",
    },
    next: { revalidate: 86400 },
  });

  if (!searchRes.ok) {
    throw new Error(`API.Bible search error ${searchRes.status}`);
  }

  const searchJson = (await searchRes.json()) as {
    data?: {
      verses?: Array<{ reference?: string; text?: string }>;
      passages?: Array<{ reference?: string; content?: string; id?: string }>;
    };
  };

  const verse = searchJson.data?.verses?.[0];
  if (verse?.text) {
    return {
      reference: verse.reference || reference,
      text: stripHtml(verse.text),
      translation,
      provider: "api.bible",
    };
  }

  const passageMeta = searchJson.data?.passages?.[0];
  if (passageMeta?.id) {
    const passUrl = `https://api.scripture.api.bible/v1/bibles/${bibleId}/passages/${passageMeta.id}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true`;
    const passRes = await fetch(passUrl, {
      headers: { "api-key": apiKey, Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!passRes.ok) {
      throw new Error(`API.Bible passage error ${passRes.status}`);
    }
    const passJson = (await passRes.json()) as {
      data?: { reference?: string; content?: string };
    };
    if (passJson.data?.content) {
      return {
        reference: passJson.data.reference || reference,
        text: stripHtml(passJson.data.content),
        translation,
        provider: "api.bible",
      };
    }
  }

  throw new Error("Passage not found on API.Bible");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
