"use server";

import { requireUser } from "@/lib/auth/require-user";
import { isOpenRouterConfigured } from "@/lib/openrouter";
import { createOpenRouterClient, getChatModel } from "@/lib/openrouter";

export type WeeklyInsight = {
  weekStart: string;
  weekEnd: string;
  entryCount: number;
  categoryCounts: Record<string, number>;
  topCategory: string | null;
  answeredCount: number;
  activeRequests: number;
  savedVersesCount: number;
  /** Optional one-liner from AI; null if skipped/failed */
  encouragement: string | null;
};

export async function getWeeklyInsight(): Promise<{
  ok: boolean;
  data?: WeeklyInsight;
  error?: string;
}> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const weekEnd = new Date();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const startIso = weekStart.toISOString();
  const endIso = weekEnd.toISOString();

  const { data: entries, error: e1 } = await supabase
    .from("prayer_entries")
    .select("category, created_at")
    .eq("user_id", user.id)
    .gte("created_at", startIso)
    .lte("created_at", endIso);

  if (e1) {
    return { ok: false, error: e1.message };
  }

  const categoryCounts: Record<string, number> = {};
  for (const row of entries ?? []) {
    const c = (row.category as string) || "uncategorized";
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  }

  let topCategory: string | null = null;
  let topN = 0;
  for (const [k, v] of Object.entries(categoryCounts)) {
    if (v > topN) {
      topN = v;
      topCategory = k;
    }
  }

  const { count: answeredCount } = await supabase
    .from("prayer_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "answered")
    .gte("answered_at", startIso);

  const { count: activeRequests } = await supabase
    .from("prayer_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["pending", "ongoing"]);

  const { count: savedVersesCount } = await supabase
    .from("prayer_entry_verses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("saved", true);

  const entryCount = entries?.length ?? 0;

  let encouragement: string | null = null;
  if (isOpenRouterConfigured() && entryCount > 0) {
    try {
      encouragement = await generateEncouragement({
        entryCount,
        categoryCounts,
        topCategory,
        answeredCount: answeredCount ?? 0,
      });
    } catch {
      encouragement = null;
    }
  }

  if (!encouragement && entryCount === 0) {
    encouragement =
      "This week is a blank page. Even a short prayer of thanks draws you near to Him.";
  } else if (!encouragement && entryCount > 0) {
    encouragement = `You brought ${entryCount} prayer${entryCount === 1 ? "" : "s"} before the Lord this week. He hears you.`;
  }

  return {
    ok: true,
    data: {
      weekStart: startIso.slice(0, 10),
      weekEnd: endIso.slice(0, 10),
      entryCount,
      categoryCounts,
      topCategory,
      answeredCount: answeredCount ?? 0,
      activeRequests: activeRequests ?? 0,
      savedVersesCount: savedVersesCount ?? 0,
      encouragement,
    },
  };
}

async function generateEncouragement(input: {
  entryCount: number;
  categoryCounts: Record<string, number>;
  topCategory: string | null;
  answeredCount: number;
}): Promise<string> {
  const client = createOpenRouterClient();
  const model = getChatModel("devotional");

  const completion = await Promise.race([
    client.chat.completions.create({
      model,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: `You write one short, warm Christian encouragement (max 2 sentences) for a prayer journal user.
Base it only on the stats given. Do not invent personal details. No medical advice. Scripture allusion OK, not long quotes.
Tone: pastoral, humble, hopeful. Reply with plain text only.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            prayer_entries_last_7_days: input.entryCount,
            category_counts: input.categoryCounts,
            top_category: input.topCategory,
            requests_marked_answered_this_week: input.answeredCount,
          }),
        },
      ],
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 8000)
    ),
  ]);

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("empty");
  return text.replace(/^["']|["']$/g, "");
}
