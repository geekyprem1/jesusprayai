"use server";

import { revalidatePath } from "next/cache";
import { categorizePrayerText } from "@/lib/ai/categorize";
import { resolveVerseSuggestions } from "@/lib/ai/verses";
import { isOpenRouterConfigured } from "@/lib/openrouter";
import { requireUser } from "@/lib/auth/require-user";
import type { PrayerCategory } from "@/types/journal";
import { CATEGORIES } from "@/lib/ai/schemas";

export type AiActionResult<T = null> = {
  ok: boolean;
  error?: string;
  data?: T;
  /** Entry was already saved; AI is best-effort */
  partial?: boolean;
};

export type EntryVerseRow = {
  id: string;
  entry_id: string;
  reference: string;
  translation: string;
  verse_text: string;
  relevance_score: number | null;
  reason: string | null;
  saved: boolean;
  created_at: string;
};

/**
 * Run AI categorize + verse suggest for an existing entry.
 * Never fails the entry itself — returns partial errors if AI fails.
 */
export async function runAiForEntry(
  entryId: string
): Promise<
  AiActionResult<{
    category: PrayerCategory;
    categorySource: "ai" | "user";
    verses: EntryVerseRow[];
    aiWarnings: string[];
  }>
> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const { data: entry, error: entryErr } = await supabase
    .from("prayer_entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .single();

  if (entryErr || !entry) {
    return { ok: false, error: entryErr?.message ?? "Entry not found." };
  }

  if (!isOpenRouterConfigured()) {
    return {
      ok: false,
      error: "OpenRouter not configured (OPENROUTER_API_KEY / OPENROUTER_MODEL).",
      partial: true,
    };
  }

  const warnings: string[] = [];
  let category = entry.category as PrayerCategory;
  let categorySource = entry.category_source as "ai" | "user";

  // Categorize (soft  — entry already saved)
  if (entry.category_source !== "user" || entry.category === "uncategorized") {
    try {
      const result = await Promise.race([
        categorizePrayerText(entry.body_plain),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("AI categorize timeout")), 8000)
        ),
      ]);
      category = result.category;
      categorySource = "ai";
      await supabase
        .from("prayer_entries")
        .update({
          category,
          category_source: "ai",
        })
        .eq("id", entryId)
        .eq("user_id", user.id);
    } catch (e) {
      warnings.push(
        e instanceof Error ? e.message : "Categorization failed"
      );
    }
  }

  // Verses
  let verses: EntryVerseRow[] = [];
  try {
    const resolved = await Promise.race([
      resolveVerseSuggestions(entry.body_plain, "KJV", supabase),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI verse timeout")), 15000)
      ),
    ]);

    // Replace previous unsaved suggestions for this entry
    await supabase
      .from("prayer_entry_verses")
      .delete()
      .eq("entry_id", entryId)
      .eq("user_id", user.id)
      .eq("saved", false);

    if (resolved.length) {
      const { data: inserted, error: insErr } = await supabase
        .from("prayer_entry_verses")
        .insert(
          resolved.map((v) => ({
            entry_id: entryId,
            user_id: user.id,
            reference: v.reference,
            translation: v.translation,
            verse_text: v.verse_text,
            relevance_score: v.relevance_score,
            reason: v.reason,
            saved: false,
          }))
        )
        .select("*");

      if (insErr) {
        warnings.push(insErr.message);
      } else {
        verses = (inserted ?? []) as EntryVerseRow[];
      }
    }
  } catch (e) {
    warnings.push(e instanceof Error ? e.message : "Verse suggestion failed");
  }

  revalidatePath("/app/journal");

  return {
    ok: true,
    partial: warnings.length > 0,
    data: {
      category,
      categorySource,
      verses,
      aiWarnings: warnings,
    },
  };
}

export async function updateEntryCategory(
  entryId: string,
  category: PrayerCategory
): Promise<AiActionResult<{ category: PrayerCategory }>> {
  if (!CATEGORIES.includes(category)) {
    return { ok: false, error: "Invalid category." };
  }

  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const { error } = await supabase
    .from("prayer_entries")
    .update({
      category,
      category_source: "user",
    })
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/app/journal");
  return { ok: true, data: { category } };
}

export async function listEntryVerses(
  entryId: string
): Promise<AiActionResult<EntryVerseRow[]>> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("prayer_entry_verses")
    .select("*")
    .eq("entry_id", entryId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: (data ?? []) as EntryVerseRow[] };
}

export async function saveEntryVerse(
  verseId: string,
  saved: boolean
): Promise<AiActionResult> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const { error } = await supabase
    .from("prayer_entry_verses")
    .update({ saved })
    .eq("id", verseId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/app/journal");
  revalidatePath("/app/verses");
  return { ok: true, data: null };
}

export type SavedVerseRow = EntryVerseRow & {
  prayer_entries?:
    | {
        id: string;
        created_at: string;
        body_plain: string;
      }
    | {
        id: string;
        created_at: string;
        body_plain: string;
      }[]
    | null;
};

/** All verses the user bookmarked (saved = true). */
export async function listSavedVerses(): Promise<
  AiActionResult<SavedVerseRow[]>
> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("prayer_entry_verses")
    .select(
      "id, entry_id, reference, translation, verse_text, relevance_score, reason, saved, created_at, prayer_entries ( id, created_at, body_plain )"
    )
    .eq("user_id", user.id)
    .eq("saved", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: (data ?? []) as SavedVerseRow[] };
}
