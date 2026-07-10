import { createHash } from "crypto";
import { createOpenRouterClient, getChatModel } from "@/lib/openrouter";
import { verseSuggestSchema, type VerseSuggestResult } from "@/lib/ai/schemas";
import { getPassage } from "@/lib/bible/client";
import type { SupabaseClient } from "@supabase/supabase-js";

const SYSTEM = `You are a Christian Bible assistant for a prayer journal.
Given a prayer, suggest 1-3 highly relevant Bible verse references (book chapter:verse).
Prefer well-known passages that comfort, correct, or encourage according to Scripture.
Do not invent references. Use standard Protestant canon naming (e.g. "Philippians 4:6-7", "John 3:16").

Respond with JSON only:
{
  "topics": ["..."],
  "sentiment": "hopeful|anxious|grateful|repentant|neutral|other",
  "suggestions": [
    {"reference":"Book C:V","reason":"short pastoral reason","confidence":0.0-1.0}
  ]
}

Keep reasons short. If unsure, return fewer suggestions. No medical/legal advice.`;

export function verseCacheKey(topics: string[], translation: string): string {
  const normalized = topics
    .map((t) => t.toLowerCase().trim())
    .filter(Boolean)
    .sort()
    .join("|");
  return createHash("sha256")
    .update(`${normalized}::${translation}`)
    .digest("hex");
}

export async function suggestVerseReferences(
  bodyPlain: string
): Promise<VerseSuggestResult> {
  const client = createOpenRouterClient();
  const model = getChatModel("verses");

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: bodyPlain.slice(0, 4000) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned non-JSON verse suggestions");
  }

  return verseSuggestSchema.parse(parsed);
}

export type ResolvedVerse = {
  reference: string;
  translation: string;
  verse_text: string;
  relevance_score: number | null;
  reason: string | null;
};

export async function resolveVerseSuggestions(
  bodyPlain: string,
  translation: "KJV" | "NIV" | "ESV" = "KJV",
  supabase?: SupabaseClient
): Promise<ResolvedVerse[]> {
  let suggest = await suggestVerseReferences(bodyPlain);

  // Optional cache by topics (after we know topics)
  if (supabase && suggest.topics.length) {
    const key = verseCacheKey(suggest.topics, translation);
    const { data: cached } = await supabase
      .from("verse_cache")
      .select("payload, expires_at")
      .eq("cache_key", key)
      .maybeSingle();

    if (
      cached?.payload &&
      cached.expires_at &&
      new Date(cached.expires_at) > new Date()
    ) {
      return cached.payload as ResolvedVerse[];
    }
  }

  const resolved: ResolvedVerse[] = [];

  for (const s of suggest.suggestions.slice(0, 3)) {
    const passage = await getPassage(s.reference, translation);
    if (!passage.ok) continue;
    resolved.push({
      reference: passage.passage.reference,
      translation: passage.passage.translation,
      verse_text: passage.passage.text,
      relevance_score: s.confidence ?? null,
      reason: s.reason ?? null,
    });
  }

  // Cache writes locked down (migration 005) — only service_role can write.
  // User client upserts are best-effort and expected to fail silently.
  if (supabase && suggest.topics.length && resolved.length) {
    const key = verseCacheKey(suggest.topics, translation);
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    const { error: cacheErr } = await supabase.from("verse_cache").upsert({
      cache_key: key,
      payload: resolved,
      expires_at: expires.toISOString(),
    });
    // Expected after migration 005 (client writes disabled)
    void cacheErr;
  }

  return resolved;
}
