import { fetchFromApiBible } from "@/lib/bible/providers/api-bible";
import { fetchFromBibleApiCom } from "@/lib/bible/providers/bible-api-com";
import type {
  BibleLookupResult,
  BibleTranslation,
} from "@/lib/bible/types";

/**
 * Lookup a Bible passage with dual-provider fallback.
 * Primary: bible-api.com (free, great for KJV)
 * Fallback: API.Bible when BIBLE_API_KEY is set
 */
export async function getPassage(
  reference: string,
  translation: BibleTranslation = "KJV"
): Promise<BibleLookupResult> {
  const ref = reference.trim();
  if (!ref) {
    return { ok: false, error: "Enter a reference (e.g. John 3:16)." };
  }

  const errors: string[] = [];
  const hasApiBible = Boolean(process.env.BIBLE_API_KEY?.trim());

  // Licensed translations: try API.Bible first when key present
  if (hasApiBible && translation !== "KJV") {
    try {
      const passage = await fetchFromApiBible(ref, translation);
      return { ok: true, passage };
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "API.Bible failed");
    }
  }

  // Free path / KJV / fallback
  try {
    const passage = await fetchFromBibleApiCom(ref, "KJV");
    return { ok: true, passage };
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "bible-api.com failed");
  }

  // Last resort: API.Bible KJV if key set
  if (hasApiBible) {
    try {
      const passage = await fetchFromApiBible(ref, translation);
      return { ok: true, passage };
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "API.Bible failed");
    }
  }

  return {
    ok: false,
    error: errors.join(" · ") || "Could not load passage.",
  };
}

export function normalizeReferenceInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
