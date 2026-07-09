import type { BiblePassage, BibleTranslation } from "@/lib/bible/types";

/**
 * bible-api.com — free, primarily public-domain translations (KJV etc.).
 * Docs: https://bible-api.com
 */
export async function fetchFromBibleApiCom(
  reference: string,
  translation: BibleTranslation = "KJV"
): Promise<BiblePassage> {
  // API uses translation query; KJV is reliable without paid license
  const translationParam =
    translation === "KJV" ? "kjv" : translation.toLowerCase();

  const url = new URL(
    `https://bible-api.com/${encodeURIComponent(reference.trim())}`
  );
  url.searchParams.set("translation", translationParam);

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`bible-api.com error ${res.status}`);
  }

  const data = (await res.json()) as {
    reference?: string;
    text?: string;
    error?: string;
  };

  if (data.error || !data.text) {
    throw new Error(data.error || "Passage not found");
  }

  return {
    reference: data.reference || reference,
    text: data.text.replace(/\s+/g, " ").trim(),
    translation: translation === "NIV" || translation === "ESV" ? "KJV" : translation,
    // Note: non-KJV may not be available free — caller should fall back
    provider: "bible-api.com",
  };
}
